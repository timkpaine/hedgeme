import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import {
  PSPWidget
} from './psp';

import '../ts/style/index.css';


function fetch_and_load(value: string, psps: {[key:string]:PSPWidget;}, companyInfo: any){
    _fetch_and_load('/api/json/v1/data?type=financials&ticker=' + value, 'financials', 'cashflow', psps['cashflow']);
    _fetch_and_load('/api/json/v1/data?type=chart&ticker=' + value, 'chart', 'chart', psps['chart']);
    _fetch_and_load('/api/json/v1/markets', 'markets', 'grid', psps['markets']);
    _fetch_and_load('/api/json/v1/data?type=dividends&ticker=' + value, 'dividends', 'grid', psps['dividends']);
    _fetch_and_load('/api/json/v1/data?type=financials&ticker=' + value, 'financials', 'grid', psps['financials']);
    _fetch_and_load('/api/json/v1/data?type=earnings&ticker=' + value, 'earnings', 'grid', psps['earnings']);
    _fetch_and_load('/api/json/v1/data?type=news&ticker=' + value, 'news', 'grid', psps['news']);
    _fetch_and_load('/api/json/v1/data?type=peers&ticker=' + value, 'peers', 'grid', psps['peers']);
    _fetch_and_load('/api/json/v1/data?type=stats&ticker=' + value, 'stats', 'grid', psps['stats']);
    _fetch_and_load('/api/json/v1/data?type=quote&ticker=' + value, 'quote', 'grid', psps['quote'], true);

    fetch_and_load_company('/api/json/v1/data?type=company&ticker=' + value, companyInfo);
}

function _fetch_and_load(path:string, field:string, type:string, loadto:PSPWidget, wrap_list=false, _delete=true){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);
            setup_psp_and_load(field, type, jsn, loadto, wrap_list, _delete);
        }
    };
    xhr1.send(null);
}


function setup_psp_and_load(field: string, type: string, data: any, loadto: PSPWidget, wrap_list=false, _delete=true){
    if (wrap_list) {data = [data[field]];} else {data = data[field];}
    if(_delete){loadto.pspNode.delete();}
    if (data){
        switch(type){
            case 'cashflow': {
                loadto.pspNode.view = 'heatmap';
                loadto.pspNode.columns = '["currentDebt","currentAssets","currentCash","totalAssets","totalCash","totalDebt","totalRevenue"]';
                loadto.pspNode.aggregates = '{"operatingGainsLosses":"distinct count","symbol":"distinct count","totalLiabilities":"distinct count","reportDate":"distinct count","cashChange":"sum","cashFlow":"sum","costOfRevenue":"sum","currentAssets":"sum","currentCash":"sum","currentDebt":"sum","grossProfit":"sum","netIncome":"sum","operatingExpense":"sum","operatingIncome":"sum","operatingRevenue":"sum","researchAndDevelopment":"sum","shareholderEquity":"sum","totalAssets":"sum","totalCash":"sum","totalDebt":"sum","totalRevenue":"sum"}';
                loadto.pspNode.update(data);
                break;
            }
            case 'grid': {
                loadto.pspNode.view = 'hypergrid';
                loadto.pspNode.update(data);
                break;
            }
            case 'chart': {
                loadto.pspNode.view = 'y_line';
                loadto.pspNode.columns = '["open","close","high","low"]';
                loadto.pspNode.aggregates = '{"ticker":"distinct count","date":"distinct count","close":"last","high":"sum","low":"sum","open":"sum"}';
                loadto.pspNode.setAttribute('column-pivots', '["ticker"]');
                loadto.pspNode.setAttribute('row-pivots', '["date"]');
                loadto.pspNode.update(data);
                break;
            }
        }
    }
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

    let input = this.inputNode;
    let autocomplete = this.datalistNode;
    this.entered = '';
    this.last = '';

    input.addEventListener('keyup', function(e: KeyboardEvent){
        if (e.keyCode === 13){
            fetch_and_load(input.value, psps, this.companyInfoNode);
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
    }.bind(this));

    fetch_and_load(def, psps, this.companyInfoNode);
    this.entered = def;

    setInterval(() => {
        _fetch_and_load('/api/json/v1/data?type=quote&ticker=' + this.entered, 'quote', 'grid', psps['quote'], true, false);
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

  private entered:string;
  private last:string;
}
