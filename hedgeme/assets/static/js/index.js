var last = '';
var entered = '';


function fetch_and_load(path, loadto){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        console.log(xhr1.response);
        var jsn = JSON.parse(xhr1.response);

        loadto.view = 'heatmap';
        loadto.columns = '["currentDebt","currentAssets","currentCash","totalAssets","totalCash","totalDebt","totalRevenue"]';
        loadto.aggregates = '{"operatingGainsLosses":"distinct count","symbol":"distinct count","totalLiabilities":"distinct count","reportDate":"distinct count","cashChange":"sum","cashFlow":"sum","costOfRevenue":"sum","currentAssets":"sum","currentCash":"sum","currentDebt":"sum","grossProfit":"sum","netIncome":"sum","operatingExpense":"sum","operatingIncome":"sum","operatingRevenue":"sum","researchAndDevelopment":"sum","shareholderEquity":"sum","totalAssets":"sum","totalCash":"sum","totalDebt":"sum","totalRevenue":"sum"}';

        if (jsn){
            loadto.delete();
            loadto.update(jsn);
        }
    };
    xhr1.send(null);
}

function stream_to(path, streamto){

}


function autocomplete_ticker(path, value, autocomplete){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        console.log(xhr1.response);
        var jsn = JSON.parse(xhr1.response);
        
        if (jsn) {
            while(autocomplete.lastChild){
                autocomplete.removeChild(autocomplete.lastChild);
            }

            for(let val of jsn){
                let option = document.createElement('option');
                option.value = val;
                autocomplete.appendChild(option);
            }
        }
    };
    xhr1.send(null);
}


window.addEventListener('WebComponentsReady', function () {
    var holder = document.getElementById('cashflow');
    var ticker_input = document.getElementById('ticker_input');
    var ticker_autocomplete = document.getElementById('ticker_autocomplete');

    ticker_input.addEventListener('keyup', function(e){
        if (e.keyCode === 13){
            if(entered == ticker_input.value){
                return;
            }

            fetch_and_load('/data?ticker=' + ticker_input.value, holder);

            entered = ticker_input.value;
        }

        if (last == ticker_input.value){
            // duplicate
            return;
        }

        if (e.keyCode !== 13){
            autocomplete_ticker('/autocomplete?partial=' + ticker_input.value, ticker_input.value, ticker_autocomplete);
        }

        last = ticker_input.value;
    });

    fetch_and_load('/data?ticker=JPM', holder);
});

