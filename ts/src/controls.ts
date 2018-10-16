import {
    Message
} from '@phosphor/messaging';

import {
    Widget
} from '@phosphor/widgets';

import {
    PSPWidget, PerspectiveHelper, ViewOption, DataOption, TypeNames
} from './perspective-widget';

import {
    TableWidget, TableHelper
} from './table';

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

function fetch_and_load_company(path:string, loadto:HTMLTableElement): Promise<void> {
    return new Promise((resolve) => {
        var xhr1 = new XMLHttpRequest();
        xhr1.open('GET', path, true);
        xhr1.onload = function () { 
            if(xhr1.response){
                var jsn = JSON.parse(xhr1.response)['COMPANY'];
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
                resolve();
            }
        };
        xhr1.send(null);
    });
}


function delete_all_children(element: HTMLElement): void{
    while(element.lastChild){
        element.removeChild(element.lastChild);
    }
}

function autocomplete_ticker(path: string, value: string, autocomplete: HTMLDataListElement){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () {
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);

            if (jsn) {
                delete_all_children(autocomplete);

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

    constructor(def: string, psps: {[key:string]:PSPWidget;}, tables: {[key:string]:TableWidget;}) {
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
        this.tables = tables;

        this.sync  = Object.keys(psps).length + Object.keys(tables).length;
        this.synced = 0;

        this.loader = document.createElement('div');
        this.loader.classList.add('loader');
        let loader_icon = document.createElement('div');
        loader_icon.classList.add('loader_icon');
        this.loader.appendChild(loader_icon);
        document.body.appendChild(this.loader);

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
                [ViewOption.ROW_PIVOTS]: '["index"]'
            }
        };

        let psps_data_options = {
            'chart':{
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'DAILY',
            },
            'quote': {
                [DataOption.WRAP]: true,
                [DataOption.KEY]: 'QUOTE'
            },
            'dividends':{
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'DIVIDENDS'
            },
            'cashflow': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'FINANCIALS'
            },
            'financials': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'FINANCIALS'
            },
            'earnings': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'EARNINGS'
            },
            'peers': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'PEERS'
            },
            'markets': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'MARKETS'
            },
            'peerCorrelation': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'PEERCORRELATION'
            },
            'composition': {
                [DataOption.DELETE]: true,
                [DataOption.KEY]: 'COMPOSITION'
            },
        };


        let table_data_options = {
            'stats': {
                ['key']: 'STATS'
            },
            'news': {
                ['key']: 'NEWS',
                ['raw']: true
            }
        };

        let psps_schemas = {
            'chart': {
                "close": TypeNames.FLOAT,
                "date": TypeNames.DATETIME,
                "high": TypeNames.FLOAT,
                "low": TypeNames.FLOAT,
                "open": TypeNames.FLOAT,
                "ticker": TypeNames.STRING,
            },
            'quote': {
                "avgTotalVolume": TypeNames.FLOAT,
                "calculationPrice": TypeNames.STRING,
                "change": TypeNames.FLOAT,
                "changePercent": TypeNames.FLOAT,
                "close": TypeNames.FLOAT,
                "closeTime": TypeNames.DATETIME,
                "companyName": TypeNames.STRING,
                "delayedPrice": TypeNames.FLOAT,
                "delayedPriceTime": TypeNames.DATETIME,
                "extendedChange": TypeNames.FLOAT,
                "extendedChangePercent": TypeNames.FLOAT,
                "extendedPrice": TypeNames.FLOAT,
                "extendedPriceTime": TypeNames.DATETIME,
                "high": TypeNames.FLOAT,
                "iexAskPrice": TypeNames.FLOAT,
                "iexAskSize": TypeNames.FLOAT,
                "iexBidPrice": TypeNames.FLOAT,
                "iexBidSize": TypeNames.FLOAT,
                "iexLastUpdated": TypeNames.DATETIME,
                "iexMarketPercent": TypeNames.FLOAT,
                "iexRealtimePrice": TypeNames.FLOAT,
                "iexRealtimeSize": TypeNames.INTEGER,
                "iexVolume": TypeNames.FLOAT,
                "latestPrice": TypeNames.FLOAT,
                "latestSource": TypeNames.STRING,
                "latestTime": TypeNames.DATETIME,
                "latestUpdate": TypeNames.FLOAT,
                "latestVolume": TypeNames.FLOAT,
                "low": TypeNames.FLOAT,
                "marketCap": TypeNames.FLOAT,
                "open": TypeNames.FLOAT,
                "openTime": TypeNames.DATETIME,
                "peRatio": TypeNames.FLOAT,
                "previousClose": TypeNames.FLOAT,
                "primaryExchange": TypeNames.STRING,
                "sector": TypeNames.STRING,
                "week52High": TypeNames.FLOAT,
                "week52Low": TypeNames.FLOAT,
                "ytdChange": TypeNames.FLOAT,
            },
            'dividends':{
                "amount": TypeNames.FLOAT,
                "declaredDate": TypeNames.DATETIME,
                "flag": TypeNames.STRING,
                "indicated": TypeNames.STRING,
                "paymentDate": TypeNames.DATETIME,
                "qualified": TypeNames.STRING,
                "recordDate": TypeNames.DATETIME,
                "type": TypeNames.STRING,
            },
            'cashflow': {
                "cashChange": TypeNames.FLOAT,
                "cashFlow": TypeNames.FLOAT,
                "costOfRevenue": TypeNames.STRING,
                "currentAssets": TypeNames.STRING,
                "currentCash": TypeNames.FLOAT,
                "currentDebt": TypeNames.FLOAT,
                "grossProfit": TypeNames.STRING,
                "netIncome": TypeNames.FLOAT,
                "operatingExpense": TypeNames.STRING,
                "operatingGainsLosses": TypeNames.STRING,
                "operatingIncome": TypeNames.STRING,
                "operatingRevenue": TypeNames.STRING,
                "reportDate": TypeNames.DATETIME,
                "researchAndDevelopment": TypeNames.STRING,
                "shareholderEquity": TypeNames.FLOAT,
                "symbol": TypeNames.STRING,
                "totalAssets": TypeNames.FLOAT,
                "totalCash": TypeNames.STRING,
                "totalDebt": TypeNames.FLOAT,
                "totalLiabilities": TypeNames.STRING,
                "totalRevenue": TypeNames.FLOAT
            },
            'financials': {
                "EPSSurpriseDollar": TypeNames.FLOAT,
                "actualEPS": TypeNames.FLOAT,
                "announceTime": TypeNames.STRING,
                "consensusEPS": TypeNames.FLOAT,
                "estimatedChangePercent": TypeNames.FLOAT,
                "estimatedEPS": TypeNames.FLOAT,
                "fiscalEndDate": TypeNames.DATETIME,
                "fiscalPeriod": TypeNames.STRING,
                "numberOfEstimates": TypeNames.INTEGER,
                "symbol": TypeNames.STRING,
                "symbolId": TypeNames.INTEGER,
                "yearAgo": TypeNames.FLOAT,
                "yearAgoChangePercent": TypeNames.FLOAT,
            },
            'earnings': {
                "cashChange": TypeNames.FLOAT,
                "cashFlow": TypeNames.FLOAT,
                "costOfRevenue": TypeNames.STRING,
                "currentAssets": TypeNames.STRING,
                "currentCash": TypeNames.FLOAT,
                "currentDebt": TypeNames.FLOAT,
                "grossProfit": TypeNames.STRING,
                "netIncome": TypeNames.FLOAT,
                "operatingExpense": TypeNames.STRING,
                "operatingGainsLosses": TypeNames.STRING,
                "operatingIncome": TypeNames.STRING,
                "operatingRevenue": TypeNames.STRING,
                "reportDate": TypeNames.DATETIME,
                "researchAndDevelopment": TypeNames.STRING,
                "shareholderEquity": TypeNames.FLOAT,
                "symbol": TypeNames.STRING,
                "totalAssets": TypeNames.FLOAT,
                "totalCash": TypeNames.STRING,
                "totalDebt": TypeNames.FLOAT,
                "totalLiabilities": TypeNames.STRING,
                "totalRevenue": TypeNames.FLOAT
            },
            'peers': {
                "CEO": TypeNames.STRING,
                "companyName": TypeNames.STRING,
                "description": TypeNames.STRING,
                "exchange": TypeNames.STRING,
                "industry": TypeNames.STRING,
                "issueType": TypeNames.STRING,
                "sector": TypeNames.STRING,
                "tags": TypeNames.FLOAT,
                "website": TypeNames.STRING,
            },
            'markets': {
                "lastUpdated": TypeNames.DATETIME,
                "marketPercent": TypeNames.FLOAT,
                "mic": TypeNames.STRING,
                "tapeA": TypeNames.FLOAT,
                "tapeB": TypeNames.FLOAT,
                "tapeC": TypeNames.FLOAT,
                "tapeId": TypeNames.STRING,
                "venueName": TypeNames.STRING,
                "volume": TypeNames.FLOAT,
            },
            'composition': {
                "Symbol": TypeNames.STRING,
                "Name": TypeNames.STRING,
                "Percent": TypeNames.FLOAT
            },
        };

        let psps1 = {'chart': this.psps['chart'],
                     'quote': this.psps['quote'],
                     'dividends': this.psps['dividends'],
                     'cashflow': this.psps['cashflow'],
                     'financials': this.psps['financials'],
                     'earnings': this.psps['earnings'],
                     'peers': this.psps['peers'],
                     'composition': this.psps['composition']}

        let psps2 = {'markets':this.psps['markets']};

        let psps3 = {'peerCorrelation': this.psps['peerCorrelation']};

        let tables = {'stats': this.tables['stats'],
                      'news': this.tables['news']};

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

        let _tables_helper = new TableHelper('/api/json/v1/data?ticker=' + this.def,
            tables,
            table_data_options);

        input.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.keyCode === 13){
                delete_all_children(autocomplete);
                this.displayLoad();

                _psps_helper.setUrl('/api/json/v1/data?ticker=' + input.value).then((count: number)=>{
                    this.hideLoad(count);
                });

                _psps_helper3.setUrl('/api/json/v1/metrics?ticker=' + input.value).then((count: number)=>{
                    this.hideLoad(count);
                });

                _tables_helper.setUrl('/api/json/v1/data?ticker=' + input.value).then((count: number)=>{
                    this.hideLoad(count);
                });

                fetch_and_load_company('/api/json/v1/data?type=COMPANY&ticker=' + input.value, this.companyInfoNode).then(() => {
                    this.hideLoad(1);
                });

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

        this.entered = this.def;
        _fetch_and_load_quote('/api/json/v1/data?type=quote&ticker=' + this.def, 'QUOTE', 'grid', this.psps['quote'], true, false);
        setInterval(() => {
            _fetch_and_load_quote('/api/json/v1/data?type=quote&ticker=' + this.entered, 'QUOTE', 'grid', this.psps['quote'], true, false);
        }, 5000);


        _psps_helper.start().then((count: number)=>{
            this.hideLoad(count);
        });
        _psps_helper2.start().then((count: number)=>{
            this.hideLoad(count);
        });
        _psps_helper3.start().then((count: number)=>{
            this.hideLoad(count);
        });
        _tables_helper.start().then((count: number)=>{
            this.hideLoad(count);
        });
        fetch_and_load_company('/api/json/v1/data?type=COMPANY&ticker=' + this.def, this.companyInfoNode);
    }

    private displayLoad(){
        this.synced = 0;
        this.loader.style.display = 'flex';
    }

    private hideLoad(count: number){
        this.synced += count;
        if (this.synced === this.sync){
            this.loader.style.display = 'none';
        }
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
    private tables: {[key:string]:TableWidget;}
    private def: string;
    private entered:string;
    private last:string;

    private loader: HTMLDivElement;
    private sync:number;
    private synced:number;
}
