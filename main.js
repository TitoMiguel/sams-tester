// --- CONFIGURACIÓN PRINCIPAL ---
const USE_MOCK_RESPONSE = true; // Cambie a false para consumir el servicio real
const SERVICE_URL = "https://SU_API/TransactionService.svc/ProcessTransaction";
// --- FIN DE CONFIGURACIÓN PRINCIPAL ---

let catalogoArticulos = [];
let catalogoTenders = [];
let catalogoMembresias = [];

function getFormattedNow() {
    const now = new Date();
    return now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, '0') + "-" +
        String(now.getDate()).padStart(2, '0') + " " +
        String(now.getHours()).padStart(2, '0') + ":" +
        String(now.getMinutes()).padStart(2, '0') + ":" +
        String(now.getSeconds()).padStart(2, '0');
}

function recalcularTotalFila(index) {
    let precio = parseFloat($(`#itemPrice_${index}`).val());
    let cantidad = parseInt($(`#itemQty_${index}`).val());
    let total = (precio * cantidad) || 0;
    $(`#itemTotal_${index}`).val(total.toFixed(2));
    recalcularMontoPago();
    actualizarJsonRequest();
}

function recalcularMontoPago() {
    let suma = 0;
    $('.item-total').each(function() {
        suma += parseFloat($(this).val()) || 0;
    });
    $('#tenderAmount').val(suma.toFixed(2));
}

function actualizarJsonRequest() {
    let items = [];
    $('.articulo-fila').each(function(index) {
        let sel = $(this);
        let artIdx = sel.find('.item-select').val();
        let art = catalogoArticulos[artIdx];
        items.push({
            SequenceNum: index + 1,
            ItemUPC: art.ItemUPC,
            ItemCategory: art.ItemCategory,
            ItemBasePrice: art.ItemBasePrice,
            ItemQuantity: parseInt(sel.find('.item-qty').val()),
            AccumulationPercentage: parseInt(sel.find('.item-accum').val()),
            ItemAccumulationLimit: art.ItemAccumulationLimit,
            CanBeRedeemed: art.CanBeRedeemed
        });
    });

    let memb = catalogoMembresias[$('#membershipSelect').val()] || {};
    let tender = catalogoTenders[$('#tenderSelect').val()] || {};
    let operationCode = $('#operationCode').val() || "Accumulate";
    let channel = $('#channel').val() || "POS";
    let ts = $('#registerTransactionTS').val() || getFormattedNow();
    let regTransNum = parseInt($('#registerTransactionNum').val()) || 1;

    let request = {
        APIKey: "187AD8E8-B56E-40B8-951F-08C2CD6CF75D",
        Channel: channel,
        PlayerInfo: memb,
        DetailInfo: {
            OperationCode: operationCode,
            TransactionHeader: {
                CountryCode: "MX",
                OperatorNumber: 421,
                RegisterNum: 15,
                RegisterTransactionNum: regTransNum,
                RegisterTransactionTS: ts,
                RewardsAmount: 30.00,
                StoreNum: 6264,
                TransactionAmmount: parseFloat($('#tenderAmount').val()) || 0
            },
            LineItem: items,
            Tenders: [{
                TenderId: tender.TenderId,
                TenderAmount: parseFloat($('#tenderAmount').val()) || 0
            }]
        },
        RequestTimeStamp: ts,
        RequestIsSAF: false
    };
    $('#jsonRequest').text(JSON.stringify(request, null, 2));
    return request;
}

function getArticulosSeleccionados() {
    let indices = [];
    $('.articulo-fila').each(function() {
        let idx = $(this).find('.item-select').val();
        if (idx !== undefined && idx !== null) indices.push(idx);
    });
    return indices.map(i => parseInt(i));
}

function agregarFilaArticulo(index = 0) {
    let seleccionados = getArticulosSeleccionados();
    let options = catalogoArticulos.map((a, i) => {
        return seleccionados.includes(i) ? '' : `<option value="${i}">${a.Descripcion}</option>`;
    }).join('');
    if (!options) return;

    let html = `
    <div class="form-row articulo-fila mb-2" data-idx="${index}">
        <div class="col-md-3">
            <select class="form-control item-select">${options}</select>
        </div>
        <div class="col-md-2"><input type="text" class="form-control item-price" id="itemPrice_${index}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-qty" id="itemQty_${index}" min="1" value="1"></div>
        <div class="col-md-2"><input type="text" class="form-control item-total item-total" id="itemTotal_${index}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-accum" id="itemAccum_${index}" value="200"></div>
        <div class="col-md-1 d-flex align-items-center"><button type="button" class="btn btn-danger btn-sm remove-articulo">&times;</button></div>
    </div>`;
    $('#articulosContainer').append(html);

    actualizarPrecioCantidadFila(index);

    $(`.articulo-fila[data-idx="${index}"] .item-select`).on('change', function() {
        sincronizarArticulosEnTodasLasFilas();
        actualizarPrecioCantidadFila(index);
        actualizarJsonRequest();
    });

    $(`#itemQty_${index}, #itemAccum_${index}`).on('input change', function() {
        actualizarPrecioCantidadFila(index);
        actualizarJsonRequest();
    });

    $('.remove-articulo').last().click(function() {
        $(this).closest('.articulo-fila').remove();
        sincronizarArticulosEnTodasLasFilas();
        actualizarJsonRequest();
        recalcularMontoPago();
        checarBotonAgregarArticulo();
    });

    checarBotonAgregarArticulo();
}

function sincronizarArticulosEnTodasLasFilas() {
    let seleccionados = getArticulosSeleccionados();
    $('.articulo-fila').each(function() {
        let $select = $(this).find('.item-select');
        let actual = $select.val();
        let options = catalogoArticulos.map((a, i) => {
            let disabled = (seleccionados.includes(i) && i != actual);
            return `<option value="${i}"${disabled ? ' disabled' : ''}${i == actual ? ' selected' : ''}>${a.Descripcion}</option>`;
        }).join('');
        $select.html(options);
    });
    checarBotonAgregarArticulo();
}

function checarBotonAgregarArticulo() {
    if (getArticulosSeleccionados().length >= catalogoArticulos.length) {
        $('#addArticuloBtn').prop('disabled', true);
    } else {
        $('#addArticuloBtn').prop('disabled', false);
    }
}

function actualizarPrecioCantidadFila(index) {
    let artIdx = $(`.articulo-fila[data-idx="${index}"] .item-select`).val();
    let art = catalogoArticulos[artIdx];
    $(`#itemPrice_${index}`).val(art.ItemBasePrice);
    recalcularTotalFila(index);
}

function resetearFormulario() {
    // Resetea todos los campos al estado inicial
    $('#membershipSelect').prop('selectedIndex', 0);
    $('#operationCode').prop('selectedIndex', 0);
    $('#channel').val('POS');
    $('#registerTransactionTS').val(getFormattedNow());
    $('#registerTransactionNum').val(1);
    $('#tenderSelect').prop('selectedIndex', 0);
    $('#tenderAmount').val('');
    $('#articulosContainer').empty();
    agregarFilaArticulo(0);
    recalcularMontoPago();
    actualizarJsonRequest();
    $('#responseBox').val('');
    $('#responseTable tbody').empty();
}

$(document).ready(function() {
    $('#jsonRequest, #responseBox').css({
        'min-height': '140px',
        'height': '180px',
        'max-height': '220px',
        'overflow-y': 'auto',
        'resize': 'none'
    });

    $('#registerTransactionTS').val(getFormattedNow());
    $('#channel').val("POS");
    $('#registerTransactionNum').val(1);

    $.getJSON('catalogo_articulos.json', function(data) {
        catalogoArticulos = data;
        agregarFilaArticulo(0);
    });
    $.getJSON('catalogo_tender.json', function(data) {
        catalogoTenders = data;
        $.each(catalogoTenders, function(i, tender) {
            $('#tenderSelect').append(`<option value="${i}">${tender.Descripcion}</option>`);
        });
    });
    $.getJSON('catalogo_membresias.json', function(data) {
        catalogoMembresias = data;
        $.each(catalogoMembresias, function(i, memb) {
            $('#membershipSelect').append(`<option value="${i}">${memb.MembershipNumber}</option>`);
        });
    });

    $('#membershipSelect, #operationCode, #channel, #registerTransactionNum').on('change input', function() {
        actualizarJsonRequest();
    });

    $('#addArticuloBtn').click(function() {
        let idx = $('.articulo-fila').length;
        agregarFilaArticulo(idx);
        actualizarJsonRequest();
    });

    $('#sendRequest').click(function() {
        let now = getFormattedNow();
        $('#registerTransactionTS').val(now);
        let request = actualizarJsonRequest();

        if (USE_MOCK_RESPONSE) {
            let responseMock = {
                "HeaderResponse": {
                    "Code": 200,
                    "IsSuccessful": true,
                    "MessageCode": "OK",
                    "TechnicalMessage": "",
                    "UserMessage": ""
                },
                "RewardsInformation": {
                    "MembershipNumber": "10234120259973428",
                    "MembershipStatus": "A",
                    "TotalAccumulatedRewards": 2365.74,
                    "TotalAvailableRewardsActualPeriod": 0,
                    "RewardsExpirationDateActualPeriod": "21/03/2021",
                    "TotalAvailableRewardsPreviousPeriod": 0,
                    "RewardsExpirationDatePreviousPeriod": "21/03/2020",
                    "TotalPeriodAccumulatedRewards": 2365.74,
                    "TotalPeriodRedeemedRewards": 100,
                    "TotalTransactionAccumulatedRewards": 100.0,
                    "LineItem": [
                        {
                            "SequenceNum": 1,
                            "ItemUPC": "7501030426332",
                            "ItemAccumulatedRewards": 200.0,
                            "ItemBasePrice": "20.64",
                            "ItemQuantity": 1
                        }
                    ]
                }
            };
            $('#responseBox').val(JSON.stringify(responseMock, null, 2));
            mostrarTabla(responseMock);
        } else {
            $.ajax({
                url: SERVICE_URL,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(request),
                success: function(response) {
                    $('#responseBox').val(JSON.stringify(response, null, 2));
                    mostrarTabla(response);
                },
                error: function(xhr, status, error) {
                    $('#responseBox').val("Error al consumir el servicio:\n" + error);
                    $('#responseTable tbody').empty();
                }
            });
        }

        // Resetear formulario tras enviar el request
        setTimeout(resetearFormulario, 500);
    });

    setTimeout(actualizarJsonRequest, 800);

    function mostrarTabla(response) {
        let body = $('#responseTable tbody');
        body.empty();
        if(response.RewardsInformation && response.RewardsInformation.LineItem) {
            response.RewardsInformation.LineItem.forEach(function(item) {
                body.append(`<tr>
                    <td>${item.SequenceNum}</td>
                    <td>${item.ItemUPC}</td>
                    <td>${item.ItemAccumulatedRewards}</td>
                    <td>${item.ItemBasePrice}</td>
                    <td>${item.ItemQuantity}</td>
                </tr>`);
            });
        }
    }
});
