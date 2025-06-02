
let catalogoArticulos = [];
let catalogoTenders = [];
let catalogoMembresias = [];

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
            SequenceNum: index+1,
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

    let request = {
        APIKey: "187AD8E8-B56E-40B8-951F-08C2CD6CF75D",
        Channel: "POS",
        PlayerInfo: memb,
        DetailInfo: {
            OperationCode: "Accumulate",
            TransactionHeader: {
                CountryCode: "MX",
                OperatorNumber: 421,
                RegisterNum: 15,
                RegisterTransactionNum: 52,
                RegisterTransactionTS: new Date().toISOString().replace('T', ' ').substring(0, 19),
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
        RequestTimeStamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        RequestIsSAF: false
    };
    $('#jsonRequest').text(JSON.stringify(request, null, 2));
}

function agregarFilaArticulo(index = 0) {
    let selectHtml = `<select class="form-control item-select">${catalogoArticulos.map((a, i) => `<option value="${i}">${a.Descripcion}</option>`)}</select>`;
    let html = `
    <div class="form-row articulo-fila mb-2" data-idx="${index}">
        <div class="col-md-3">${selectHtml}</div>
        <div class="col-md-2"><input type="text" class="form-control item-price" id="itemPrice_${index}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-qty" id="itemQty_${index}" min="1" value="1"></div>
        <div class="col-md-2"><input type="text" class="form-control item-total item-total" id="itemTotal_${index}" readonly></div>
        <div class="col-md-2"><input type="number" class="form-control item-accum" id="itemAccum_${index}" value="200"></div>
        <div class="col-md-1 d-flex align-items-center"><button type="button" class="btn btn-danger btn-sm remove-articulo">&times;</button></div>
    </div>`;
    $('#articulosContainer').append(html);
    actualizarPrecioCantidadFila(index);

    $(`#itemQty_${index}, .item-select, .item-accum`).on('input change', function() {
        actualizarPrecioCantidadFila(index);
        actualizarJsonRequest();
    });
    $('.remove-articulo').last().click(function() {
        $(this).closest('.articulo-fila').remove();
        actualizarJsonRequest();
        recalcularMontoPago();
    });
}

function actualizarPrecioCantidadFila(index) {
    let artIdx = $(`.articulo-fila[data-idx="${index}"] .item-select`).val();
    let art = catalogoArticulos[artIdx];
    $(`#itemPrice_${index}`).val(art.ItemBasePrice);
    recalcularTotalFila(index);
}

$(document).ready(function() {
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

    $('#addArticuloBtn').click(function() {
        let idx = $('.articulo-fila').length;
        agregarFilaArticulo(idx);
    });
});
