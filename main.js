let catalogoArticulos = [];
let catalogoTenders = [];
let catalogoMembresias = [];

$(document).ready(function() {
    // Cargar catálogos
    $.getJSON('catalogo_articulos.json', function(data) {
        catalogoArticulos = data;
        $.each(catalogoArticulos, function(i, item) {
            $('#itemSelect').append(`<option value="${i}">${item.Descripcion} (${item.ItemUPC})</option>`);
        });
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

    $('#sendRequest').click(function() {
        // Armar JSON request dinámicamente
        let memb = catalogoMembresias[$('#membershipSelect').val()];
        let art = catalogoArticulos[$('#itemSelect').val()];
        let tender = catalogoTenders[$('#tenderSelect').val()];
        let now = new Date($('#registerTransactionTS').val());
        let ts = now.toISOString().replace('T',' ').substring(0,19);

        let request = {
            APIKey: "187AD8E8-B56E-40B8-951F-08C2CD6CF75D",
            Channel: $('#channel').val(),
            PlayerInfo: memb,
            DetailInfo: {
                OperationCode: $('#operationCode').val(),
                TransactionHeader: {
                    CountryCode: "MX",
                    OperatorNumber: 421,
                    RegisterNum: 15,
                    RegisterTransactionNum: 52,
                    RegisterTransactionTS: ts,
                    RewardsAmount: 30.00,
                    StoreNum: 6264,
                    TransactionAmmount: parseFloat($('#tenderAmount').val())
                },
                LineItem: [{
                    SequenceNum: 1,
                    ItemUPC: art.ItemUPC,
                    ItemCategory: art.ItemCategory,
                    ItemBasePrice: art.ItemBasePrice,
                    ItemQuantity: parseInt($('#itemQty').val()),
                    AccumulationPercentage: parseInt($('#accumPercent').val()),
                    ItemAccumulationLimit: art.ItemAccumulationLimit,
                    CanBeRedeemed: art.CanBeRedeemed
                }],
                Tenders: [{
                    TenderId: tender.TenderId,
                    TenderAmount: parseFloat($('#tenderAmount').val())
                }]
            },
            RequestTimeStamp: ts,
            RequestIsSAF: false
        };
        $('#jsonRequest').text(JSON.stringify(request, null, 2));

        // Simulación de llamada AJAX (sustituya la URL por la real en ambiente de pruebas)
        $.ajax({
            url: '/ruta/TransactionService.svc/ProcessTransaction', // Sustituir por endpoint real
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(response) {
                $('#responseBox').val(JSON.stringify(response, null, 2));
                mostrarTabla(response);
            },
            error: function() {
                // Simular respuesta si falla (mock)
                let mock = {
                    "HeaderResponse": {
                        "Code": 200,
                        "IsSuccessful": true,
                        "MessageCode": "OK",
                        "TechnicalMessage": "",
                        "UserMessage": ""
                    },
                    "RewardsInformation": {
                        "MembershipNumber": memb.MembershipNumber,
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
                                "ItemUPC": art.ItemUPC,
                                "ItemAccumulatedRewards": 200.0,
                                "ItemBasePrice": art.ItemBasePrice,
                                "ItemQuantity": parseInt($('#itemQty').val())
                            }
                        ]
                    }
                };
                $('#responseBox').val(JSON.stringify(mock, null, 2));
                mostrarTabla(mock);
            }
        });
    });

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
