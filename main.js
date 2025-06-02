// ==================== CONFIGURACIÓN PRINCIPAL ====================
const SERVICE_URL_PROCESSTRANSACTION = "https://192.168.10.231/SAMSMX_DEV/SAMSMX.Loyalty.ProcessTransaction/TransactionService.svc/ProcessTransaction";
const SERVICE_URL_GETBALANCE        = "https://192.168.10.231/SAMSMX_DEV/SAMSMX.Loyalty.ProcessTransaction/TransactionService.svc/GetBalance";
const SERVICE_USER                  = "SAMSMXService.User";
const SERVICE_PASS                  = "SAMSMXService.Pass";
const API_KEY                       = "187AD8E8-B56E-40B8-951F-08C2CD6CF75D";
const COUNTRY_CODE                  = "MX";
const OPERATOR_NUMBER               = 421;
const REGISTER_NUM                  = 15;
const STORE_NUM                     = 6264;
const REQUEST_IS_SAF                = false;
// ==================== FIN CONFIGURACIÓN PRINCIPAL =================

let catalogoArticulos = [], catalogoTenders = [], catalogoMembresias = [];

// --- MOCK RESPUESTAS ---
const MOCK_RESPONSE_PROCESSTRANSACTION = {
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
const MOCK_RESPONSE_GETBALANCE = {
    "HeaderResponse": {
        "Code": 200,
        "IsSuccessful": true,
        "MessageCode": "",
        "TechnicalMessage": "",
        "UserMessage": ""
    },
    "RewardsInformation": {
        "AccountStatement": [
            {
                "ProcessedDate": "/Date(1715726291977-0600)/",
                "RegisterNumber": "15",
                "RegisterTransactionNumber": "52",
                "RegisterTransactionTS": "2023-07-18 09:00:11",
                "RequestTimeStamp": "/Date(-62135575200000-0600)/",
                "RewardsStatus": "Accumulate",
                "StoreNumber": "6264",
                "TransactionAmount": 0,
                "TransactionMembershipCard": "10242100318608880",
                "TransactionMoneyAmount": 688,
                "TransactionRewardsAmount": 10.07,
                "TransactionType": "Accumulate"
            },
            {
                "ProcessedDate": "/Date(1715726326413-0600)/",
                "RegisterNumber": "15",
                "RegisterTransactionNumber": "52",
                "RegisterTransactionTS": "2023-07-18 09:00:12",
                "RequestTimeStamp": "/Date(-62135575200000-0600)/",
                "RewardsStatus": "Accumulate",
                "StoreNumber": "6264",
                "TransactionAmount": 0,
                "TransactionMembershipCard": "10242200318608880",
                "TransactionMoneyAmount": 688,
                "TransactionRewardsAmount": 10.07,
                "TransactionType": "Accumulate"
            }
        ],
        "AfterStatementAccumulatedRewards": 0,
        "AfterStatementAvailableRewards": 0,
        "BeforeStatementAccumulatedRewards": 0,
        "BeforeStatementAvailableRewards": 0,
        "MembershipNumber": "10242100318608880",
        "MembershipStatus": "I",
        "RewardsExpirationDateActualPeriod": "1900-01-01",
        "RewardsExpirationDatePreviousPeriod": "1900-01-01",
        "RowCount": 0,
        "StatementEndDt": null,
        "StatementStartDt": null,
        "TotalAccumulatedRewards": 23.69,
        "TotalAvailablePoints": 0,
        "TotalAvailableRewardsActualPeriod": 0,
        "TotalAvailableRewardsPreviousPeriod": 0,
        "TotalPeriodAccumulatedRewards": 23.69,
        "TotalPeriodRedeemedRewards": 0,
        "TotalTransactionAccumulatedRewards": 0
    }
};

// ======================== UTILITARIOS =============================
// Formato de fecha/hora actual (YYYY-MM-DD HH:mm:ss)
function getFormattedNow() {
    const vNow = new Date();
    return `${vNow.getFullYear()}-${String(vNow.getMonth() + 1).padStart(2, '0')}-${String(vNow.getDate()).padStart(2, '0')} `
         + `${String(vNow.getHours()).padStart(2, '0')}:${String(vNow.getMinutes()).padStart(2, '0')}:${String(vNow.getSeconds()).padStart(2, '0')}`;
}

// Cookies get/set para persistencia local (usado con No. Transacción)
function setCookie(pName, pValue, pDays = 30) {
    const vDate = new Date();
    vDate.setTime(vDate.getTime() + (pDays*24*60*60*1000));
    document.cookie = `${pName}=${pValue};expires=${vDate.toUTCString()};path=/`;
}
function getCookie(pName) {
    const vName = pName + "=", vDecoded = decodeURIComponent(document.cookie), vArr = vDecoded.split(';');
    for(let vCookie of vArr) {
        vCookie = vCookie.trim();
        if (vCookie.indexOf(vName) === 0) return vCookie.substring(vName.length);
    }
    return "";
}

// ======================= FORMULARIO PROCESSTRANSACTION ===============

// Recalcula el total de cada fila, el monto de pago total y actualiza el request.
function recalcularTotalFila(pIndex) {
    const vPrecio = parseFloat($(`#itemPrice_${pIndex}`).val()),
          vCantidad = parseInt($(`#itemQty_${pIndex}`).val()),
          vTotal = (vPrecio * vCantidad) || 0;
    $(`#itemTotal_${pIndex}`).val(vTotal.toFixed(2));
    recalcularMontoPago();
    actualizarJsonRequest();
}
function recalcularMontoPago() {
    let vSuma = 0;
    $('.item-total').each(function() { vSuma += parseFloat($(this).val()) || 0; });
    $('#tenderAmount').val(vSuma.toFixed(2));
}

// Genera el JSON del request principal (ProcessTransaction)
function actualizarJsonRequest() {
    const vItems = $('.articulo-fila').map(function(i) {
        const vSel = $(this), vArtIdx = vSel.find('.item-select').val(), vArt = catalogoArticulos[vArtIdx];
        return {
            SequenceNum: i + 1, ItemUPC: vArt.ItemUPC, ItemCategory: vArt.ItemCategory,
            ItemBasePrice: vArt.ItemBasePrice, ItemQuantity: parseInt(vSel.find('.item-qty').val()),
            AccumulationPercentage: parseInt(vSel.find('.item-accum').val()),
            ItemAccumulationLimit: vArt.ItemAccumulationLimit, CanBeRedeemed: vArt.CanBeRedeemed
        };
    }).get();

    const vMemb = catalogoMembresias[$('#membershipSelect').val()] || {},
          vTender = catalogoTenders[$('#tenderSelect').val()] || {},
          vReq = {
            APIKey: API_KEY, Channel: $('#channel').val() || "POS", PlayerInfo: vMemb,
            DetailInfo: {
                OperationCode: $('#operationCode').val() || "Accumulate",
                TransactionHeader: {
                    CountryCode: COUNTRY_CODE,
                    OperatorNumber: OPERATOR_NUMBER,
                    RegisterNum: REGISTER_NUM,
                    RegisterTransactionNum: parseInt($('#registerTransactionNum').val()) || 1,
                    RegisterTransactionTS: $('#registerTransactionTS').val() || getFormattedNow(),
                    RewardsAmount: 30.00,
                    StoreNum: STORE_NUM,
                    TransactionAmmount: parseFloat($('#tenderAmount').val()) || 0
                },
                LineItem: vItems,
                Tenders: [{ TenderId: vTender.TenderId, TenderAmount: parseFloat($('#tenderAmount').val()) || 0 }]
            },
            RequestTimeStamp: $('#registerTransactionTS').val() || getFormattedNow(),
            RequestIsSAF: REQUEST_IS_SAF
        };
    $('#jsonRequestProcessTransaction').text(JSON.stringify(vReq, null, 2));
    return vReq;
}

// Artículos seleccionados en todas las filas (para evitar repetidos)
function getArticulosSeleccionados() {
    return $('.articulo-fila').map(function() {
        return parseInt($(this).find('.item-select').val());
    }).get();
}

// Crea una fila de artículo en el formulario y sus listeners
function agregarFilaArticulo(pIndex = 0) {
    const vSeleccionados = getArticulosSeleccionados(),
          vOptions = catalogoArticulos.map((a, i) =>
            vSeleccionados.includes(i) ? '' : `<option value="${i}">${a.Descripcion}</option>`
          ).join('');
    if (!vOptions) return;
    $('#articulosContainer').append(`
    <div class="form-row articulo-fila mb-2" data-idx="${pIndex}">
        <div class="col-md-3"><select class="form-control item-select">${vOptions}</select></div>
        <div class="col-md-2"><input type="text" class="form-control item-price" id="itemPrice_${pIndex}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-qty" id="itemQty_${pIndex}" min="1" value="1"></div>
        <div class="col-md-2"><input type="text" class="form-control item-total" id="itemTotal_${pIndex}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-accum" id="itemAccum_${pIndex}" value="200"></div>
        <div class="col-md-1 d-flex align-items-center"><button type="button" class="btn btn-danger btn-sm remove-articulo">&times;</button></div>
    </div>`);
    actualizarPrecioCantidadFila(pIndex);

    // Encapsulado: listeners de cambios
    $(`.articulo-fila[data-idx="${pIndex}"] .item-select`).on('change', function() {
        sincronizarArticulosEnTodasLasFilas();
        actualizarPrecioCantidadFila(pIndex);
        actualizarJsonRequest();
    });
    $(`#itemQty_${pIndex}, #itemAccum_${pIndex}`).on('input change', function() {
        actualizarPrecioCantidadFila(pIndex);
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
    const vSeleccionados = getArticulosSeleccionados();
    $('.articulo-fila').each(function() {
        const $select = $(this).find('.item-select'), vActual = $select.val();
        $select.html(catalogoArticulos.map((a, i) =>
            (vSeleccionados.includes(i) && i != vActual) ? '' : `<option value="${i}"${i == vActual ? ' selected' : ''}>${a.Descripcion}</option>`
        ).join(''));
    });
    checarBotonAgregarArticulo();
}
function checarBotonAgregarArticulo() {
    $('#addArticuloBtn').prop('disabled', getArticulosSeleccionados().length >= catalogoArticulos.length);
}
function actualizarPrecioCantidadFila(pIndex) {
    const vArtIdx = $(`.articulo-fila[data-idx="${pIndex}"] .item-select`).val(),
          vArt = catalogoArticulos[vArtIdx];
    $(`#itemPrice_${pIndex}`).val(vArt.ItemBasePrice);
    recalcularTotalFila(pIndex);
}

// Reset del formulario, restaurando No. Transacción desde cookies
function resetearFormulario() {
    $('#registerTransactionNum').val(parseInt(getCookie('sams_tester_numTrans')) || 1);
    $('#membershipSelect, #operationCode, #tenderSelect').prop('selectedIndex', 0);
    $('#channel').val('POS');
    $('#registerTransactionTS').val(getFormattedNow());
    $('#tenderAmount').val('');
    $('#articulosContainer').empty();
    agregarFilaArticulo(0);
    recalcularMontoPago();
    actualizarJsonRequest();
}

// Envío de la petición principal (mock o real), con headers especiales y manejo de incrementos
function ejecutarEnvioRequest(pUsarMock) {
    $('#registerTransactionTS').val(getFormattedNow());
    const vRequest = actualizarJsonRequest(),
          vNumTrans = parseInt($('#registerTransactionNum').val()) || 1;
    setCookie('sams_tester_numTrans', vNumTrans + 1);
    if (pUsarMock) {
        $('#jsonResponseProcessTransaction').val(JSON.stringify(MOCK_RESPONSE_PROCESSTRANSACTION, null, 2));
        mostrarTabla(MOCK_RESPONSE_PROCESSTRANSACTION);
    } else {
        $.ajax({
            url: SERVICE_URL_PROCESSTRANSACTION,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(vRequest),
            headers: {
                'userName': SERVICE_USER,
                'password': SERVICE_PASS,
                'Content-Type': 'application/json'
            },
            success: function(response) {
                $('#jsonResponseProcessTransaction').val(JSON.stringify(response, null, 2));
                mostrarTabla(response);
            },
            error: function(xhr, status, error) {
                $('#jsonResponseProcessTransaction').val("Error al consumir el servicio:\n" + error);
                $('#responseTableProcessTransaction tbody').empty();
            }
        });
    }
    setTimeout(resetearFormulario, 1000);
}

// Rellena la tabla de recompensas del response principal
function mostrarTabla(pResponse) {
    const vBody = $('#responseTableProcessTransaction tbody').empty();
    if (pResponse.RewardsInformation && pResponse.RewardsInformation.LineItem)
        pResponse.RewardsInformation.LineItem.forEach(item =>
            vBody.append(`<tr>
                <td>${item.SequenceNum}</td>
                <td>${item.ItemUPC}</td>
                <td>${item.ItemAccumulatedRewards}</td>
                <td>${item.ItemBasePrice}</td>
                <td>${item.ItemQuantity}</td>
            </tr>`)
        );
}

// ======================== FORMULARIO GETBALANCE =======================

// Inicializa el formulario GetBalance con catálogo, fechas, etc.
function initGetBalanceForm() {
    if (Array.isArray(catalogoMembresias) && catalogoMembresias.length) {
        const vSel = $('#gbMembershipNumber').empty();
        catalogoMembresias.forEach(m => vSel.append(`<option value="${m.MembershipNumber}">${m.MembershipNumber}</option>`));
    }
    const vNow = new Date(), vYear = vNow.getFullYear(),
          vMonth = String(vNow.getMonth() + 1).padStart(2, '0'), vDay = String(vNow.getDate()).padStart(2, '0');
    $('#gbExpirationDate').val(`${vYear}-${vMonth}-${vDay}`);
    $('#gbStartDt').val(`${vYear}-01-01`);
    $('#gbEndDt').val(`${vYear}-12-31`);
    actualizarGbJsonRequest();
}

// Genera JSON para GetBalance y lo muestra
function actualizarGbJsonRequest() {
    const vReq = {
        APIKey: API_KEY,
        MembershipNumber: $('#gbMembershipNumber').val(),
        ExpirationDate: $('#gbExpirationDate').val(),
        MessageType: $('#gbMessageType').val(),
        StartDt: $('#gbStartDt').val(),
        EndDt: $('#gbEndDt').val(),
        RequestTimeStamp: getFormattedNow()
    };
    $('#jsonRequestGetBalance').text(JSON.stringify(vReq, null, 2));
    return vReq;
}

// Tabla con estado de cuenta del response de GetBalance
function mostrarGbTabla(pResponse) {
    const vBody = $('#responseTableGetBalance tbody').empty(),
          vArr = (pResponse.RewardsInformation && pResponse.RewardsInformation.AccountStatement) ? pResponse.RewardsInformation.AccountStatement : [];
    vArr.forEach(item =>
        vBody.append(`<tr>
            <td>${item.ProcessedDate || ''}</td>
            <td>${item.RegisterNumber || ''}</td>
            <td>${item.RegisterTransactionNumber || ''}</td>
            <td>${item.RegisterTransactionTS || ''}</td>
            <td>${item.RewardsStatus || ''}</td>
            <td>${item.StoreNumber || ''}</td>
            <td>${item.TransactionAmount || ''}</td>
            <td>${item.TransactionMembershipCard || ''}</td>
            <td>${item.TransactionMoneyAmount || ''}</td>
            <td>${item.TransactionRewardsAmount || ''}</td>
            <td>${item.TransactionType || ''}</td>
        </tr>`)
    );
}

// ==================== INICIALIZACIÓN Y EVENTOS ====================

$(document).ready(function() {
    // Inicialización campos y catálogos
    $('#registerTransactionNum').val(parseInt(getCookie('sams_tester_numTrans')) || 1);
    $('#jsonRequestProcessTransaction, #jsonResponseProcessTransaction').css({
        'min-height': '140px', 'height': '180px', 'max-height': '220px', 'overflow-y': 'auto', 'resize': 'none'
    });
    $('#registerTransactionTS').val(getFormattedNow());
    $('#channel').val("POS");

    // Catálogos asíncronos
    $.getJSON('catalogo_articulos.json', data => { catalogoArticulos = data; agregarFilaArticulo(0); });
    $.getJSON('catalogo_tender.json', data => { catalogoTenders = data; data.forEach((t, i) => $('#tenderSelect').append(`<option value="${i}">${t.Descripcion}</option>`)); });
    $.getJSON('catalogo_membresias.json', data => { catalogoMembresias = data; data.forEach((m, i) => $('#membershipSelect').append(`<option value="${i}">${m.MembershipNumber}</option>`)); });

    // Listeners generales ProcessTransaction
    $('#membershipSelect, #operationCode, #channel, #registerTransactionNum').on('change input', actualizarJsonRequest);
    $('#addArticuloBtn').click(function() { agregarFilaArticulo($('.articulo-fila').length); actualizarJsonRequest(); });
    $('#btnSendMockProcessTransaction').click(() => ejecutarEnvioRequest(true));
    $('#btnSendRealProcessTransaction').click(() => ejecutarEnvioRequest(false));
    setTimeout(actualizarJsonRequest, 800);

    // GetBalance: Listeners y sub-botones
    $(document).on('change input', '#gbMembershipNumber, #gbExpirationDate, #gbMessageType, #gbStartDt, #gbEndDt', actualizarGbJsonRequest);
    $('#btnSendMockGetBalance').click(() => { $('#jsonResponseGetBalance').val(JSON.stringify(MOCK_RESPONSE_GETBALANCE, null, 2)); mostrarGbTabla(MOCK_RESPONSE_GETBALANCE); });
    $('#btnSendRealGetBalance').click(function() {
        const vReq = actualizarGbJsonRequest();
        $.ajax({
            url: SERVICE_URL_GETBALANCE,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(vReq),
            headers: {
                'userName': SERVICE_USER,
                'password': SERVICE_PASS,
                'Content-Type': 'application/json'
            },
            success: function(response) { $('#jsonResponseGetBalance').val(JSON.stringify(response, null, 2)); mostrarGbTabla(response); },
            error: function(xhr, status, error) { $('#jsonResponseGetBalance').val("Error al consumir el servicio:\n" + error); $('#responseTableGetBalance tbody').empty(); }
        });
    });
    setTimeout(initGetBalanceForm, 1200);
});
