import {
    Message
} from '@phosphor/messaging';

import {
    Widget
} from '@phosphor/widgets';

import {
    PSPWidget, PerspectiveHelper, ViewOption, DataOption
} from './perspective-widget';

import '../ts/style/index.css';

function _fetch_and_load_quote(path:string, field:string, type:string, loadto:PSPWidget, wrap_list=false, _delete=true){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () {
        if(xhr1.response){
            var data = JSON.parse(xhr1.response);
            if (wrap_list) {data = [data[field]];} else {data = data[field];}
            if(_delete){loadto.pspNode.delete();}
            loadto.pspNode.view = 'hypergrid';
            loadto.pspNode.setAttribute('index', 'iexLastUpdated');
            loadto.pspNode.update(data);
        }
    };
    xhr1.send(null);
}

function fetch_and_load_company(path:string, loadto:HTMLTableElement){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response)['company'];
            while(loadto.lastChild){
                loadto.removeChild(loadto.lastChild);
            }

            if (jsn){
                for (let x of Object.keys(jsn)){
                    let row = document.createElement('tr');
                    let td1 = document.createElement('td');
                    let td2 = document.createElement('td');
                    td1.textContent = x;
                    td2.textContent = jsn[x];
                    row.appendChild(td1);
                    row.appendChild(td2);
                    loadto.appendChild(row)
                }
            }
        }
    };
    xhr1.send(null);
}


function autocomplete_ticker(path: string, value: string, autocomplete: HTMLDataListElement){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () {
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);

            if (jsn) {
                while(autocomplete.lastChild){
                    autocomplete.removeChild(autocomplete.lastChild);
                }

                for(let val of jsn){
                    let option = document.createElement('option');
                    option.value = val['symbol'];
                    option.innerText = val['symbol'] + ' - ' + val['name'];
                    autocomplete.appendChild(option);
                }
            }
        }
    };
    xhr1.send(null);
}


export
class ControlsWidget extends Widget {

    static createNode(def: string): HTMLElement {
        let node = document.createElement('div');
        let content = document.createElement('div');
        let input = document.createElement('input');
        let datalist = document.createElement('datalist');

        let table = document.createElement('table');
        table.cellSpacing = '10';
        input.placeholder = 'Ticker';
        input.value = def;
        input.id = 'controls_input';
        datalist.id = 'controls_datalist';
        input.setAttribute('list', datalist.id);

        content.appendChild(input);
        content.appendChild(datalist);
        content.appendChild(table);
        node.appendChild(content);
        return node;
    }

    constructor(def: string, psps: {[key:string]:PSPWidget;}) {
        super({ node: ControlsWidget.createNode(def) });
        this.setFlag(Widget.Flag.DisallowLayout);
        this.addClass('controls');
        this.title.label = 'Controls';
        this.title.closable = true;
        this.title.caption = 'Controls';
        this.node.id = 'controls';

        this.def = def;
        this.entered = '';
        this.last = '';
        this.psps = psps;
    }

    start(): void {
        let input = this.inputNode;
        let autocomplete = this.datalistNode;
        let psps_view_options = {
            'cashflow': {
                [ViewOption.VIEW]: 'heatmap',
                [ViewOption.COLUMNS]: '["currentDebt","currentAssets","currentCash","totalAssets","totalCash","totalDebt","totalRevenue"]',
                [ViewOption.AGGREGATES]: '{"operatingGainsLosses":"distinct count","symbol":"distinct count","totalLiabilities":"distinct count","reportDate":"distinct count","cashChange":"sum","cashFlow":"sum","costOfRevenue":"sum","currentAssets":"sum","currentCash":"sum","currentDebt":"sum","grossProfit":"sum","netIncome":"sum","operatingExpense":"sum","operatingIncome":"sum","operatingRevenue":"sum","researchAndDevelopment":"sum","shareholderEquity":"sum","totalAssets":"sum","totalCash":"sum","totalDebt":"sum","totalRevenue":"sum"}'
            },
            'chart': {
                [ViewOption.VIEW]: 'y_line',
                [ViewOption.COLUMNS]: '["open","close","high","low"]',
                [ViewOption.AGGREGATES]: '{"ticker":"distinct count","date":"distinct count","close":"last","high":"sum","low":"sum","open":"sum"}',
                [ViewOption.COLUMN_PIVOTS]: '["ticker"]',
                [ViewOption.ROW_PIVOTS]: '["date"]'
            },
            'grid': {
                [ViewOption.VIEW]: 'hypergrid'
            },
            'quote': {
                [ViewOption.VIEW]: 'hypergrid',
                [ViewOption.INDEX]: 'iexLastUpdated'
            },
            'peers': {
                [ViewOption.VIEW]: 'hypergrid',
                [ViewOption.COLUMNS]: '["symbol","companyName","description","industry","website","issueType"]',
                [ViewOption.SORT]: '[["symbol", "asc"]]'
            },
            'peerCorrelation': {
                [ViewOption.VIEW]: 'heatmap',
            }
        };

        let psps_data_options = {
            'chart':{
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'chart'
            },
            'quote': {
                [DataOption.WRAP]: true,
                [DataOption.KEY]: 'quote'
            },
            'dividends':{
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'dividends'
            },
            'cashflow': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'financials'
            },
            'financials': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'financials'
            },
            'earnings': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'earnings'
            },
            'news': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'news'
            },
            'peers': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'peers'
            },
            'stats': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'stats'
            },
            'markets': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'markets'
            },
            'peerCorrelation': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'peerCorrelation'
            },
        };

        let psps_schemas = {};

        let psps1 = {'chart': this.psps['chart'],
                     'quote': this.psps['quote'],
                     'dividends': this.psps['dividends'],
                     'cashflow': this.psps['cashflow'],
                     'financials': this.psps['financials'],
                     'earnings': this.psps['earnings'],
                     'news': this.psps['news'],
                     'peers': this.psps['peers'],
                     'stats': this.psps['stats']}

        let psps2 = {'markets':this.psps['markets']};

        let psps3 = {'peerCorrelation': this.psps['peerCorrelation']};

        let _psps_helper = new PerspectiveHelper('/api/json/v1/data?ticker=' + this.def,
            psps1,
            psps_view_options,
            psps_data_options,
            psps_schemas);

        let _psps_helper2 = new PerspectiveHelper('/api/json/v1/markets',
            psps2,
            psps_view_options,
            psps_data_options,
            psps_schemas);

        let _psps_helper3 = new PerspectiveHelper('/api/json/v1/metrics?ticker=' + this.def,
            psps3,
            psps_view_options,
            psps_data_options,
            psps_schemas);


        input.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.keyCode === 13){
                _psps_helper.set_url('/api/json/v1/data?ticker=' + input.value);
                _psps_helper3.set_url('/api/json/v1/metrics?ticker=' + input.value);
                fetch_and_load_company('/api/json/v1/data?type=company&ticker=' + input.value, this.companyInfoNode);
                this.entered = input.value;
            }

            if (this.last == input.value){
                // duplicate
                return;
            }

            if (e.keyCode !== 13){
                autocomplete_ticker('/api/json/v1/autocomplete?partial=' + input.value, input.value, autocomplete);
            }

            this.last = input.value;
        });

        _psps_helper.start();
        _psps_helper2.start();
        _psps_helper3.start();
        fetch_and_load_company('/api/json/v1/data?type=company&ticker=' + this.entered, this.companyInfoNode);
        this.entered = this.def;

        setInterval(() => {
            _fetch_and_load_quote('/api/json/v1/data?type=quote&ticker=' + this.entered, 'quote', 'grid', this.psps['quote'], true, false);
        }, 500);
    }

    get inputNode(): HTMLInputElement {
        return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
    }

    get datalistNode(): HTMLDataListElement {
        return this.node.getElementsByTagName('datalist')[0] as HTMLDataListElement;
    }

    get companyInfoNode(): HTMLTableElement {
        return this.node.getElementsByTagName('table')[0] as HTMLTableElement;
    }

    protected onActivateRequest(msg: Message): void {
        if (this.isAttached) {
            this.inputNode.focus();
        }
    }

    private psps: {[key:string]:PSPWidget;}
    private def: string;
    private entered:string;
    private last:string;
}
