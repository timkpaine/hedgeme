function fetch_and_load(path, loadto){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        console.log(xhr1.response);
        var jsn = JSON.parse(xhr1.response);
        if (jsn){
            loadto.update(jsn);
        }
    };
    xhr1.send(null);
}

function stream_to(path, streamto){

}

window.addEventListener('WebComponentsReady', function () {
    var holder = document.getElementById('holder');
    var ticker_input = document.getElementById('ticker_input');

    ticker_input.addEventListener('keydown', function(e){
        if (e.keyCode === 13){
            fetch_and_load('/data?ticker=' + ticker_input.value, holder);
        }
    });

    // fetch_and_load('/data', holder);
});