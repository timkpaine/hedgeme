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
    fetch_and_load_cashflow('/api/json/v1/data?type=financials&ticker=' + value , psps['cashflow'].pspNode);
    fetch_and_load_chart('/api/json/v1/data?type=chart&ticker=' + value, psps['chart'].pspNode);
    fetch_and_load_company('/api/json/v1/data?type=company&ticker=' + value, companyInfo);
    fetch_and_load_grid('/api/json/v1/markets?ticker=' + value, psps['markets'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=dividends&ticker=' + value, psps['dividends'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=financials&ticker=' + value, psps['financials'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=earnings&ticker=' + value, psps['earnings'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=news&ticker=' + value, psps['news'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=peers&ticker=' + value, psps['peers'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=stats&ticker=' + value, psps['stats'].pspNode);
    fetch_and_load_grid('/api/json/v1/data?type=quote&ticker=' + value, psps['quote'].pspNode, true);
}


function fetch_and_load_cashflow(path:string, loadto:any){ //PSP Widget
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        loadto.delete();
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);

            loadto.view = 'heatmap';
            loadto.columns = '["currentDebt","currentAssets","currentCash","totalAssets","totalCash","totalDebt","totalRevenue"]';
            loadto.aggregates = '{"operatingGainsLosses":"distinct count","symbol":"distinct count","totalLiabilities":"distinct count","reportDate":"distinct count","cashChange":"sum","cashFlow":"sum","costOfRevenue":"sum","currentAssets":"sum","currentCash":"sum","currentDebt":"sum","grossProfit":"sum","netIncome":"sum","operatingExpense":"sum","operatingIncome":"sum","operatingRevenue":"sum","researchAndDevelopment":"sum","shareholderEquity":"sum","totalAssets":"sum","totalCash":"sum","totalDebt":"sum","totalRevenue":"sum"}';

            if (jsn){
                loadto.update(jsn);
            }
        }
    };
    xhr1.send(null);
}


function fetch_and_load_grid(path:string, loadto:any, convert=false, _delete=true){ //PSP Widget
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        if(_delete){
            loadto.delete();
        }
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);
            if (jsn){
                if (convert){
                    loadto.update([jsn]);
                } else {
                    loadto.update(jsn);
                }
            }
        }
    };
    xhr1.send(null);
}


function fetch_and_load_chart(path:string, loadto:any){ //PSP Widget
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        loadto.delete();
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);

            loadto.view = 'y_line';
            loadto.columns = '["open","close","high","low"]';
            loadto.aggregates = '{"ticker":"distinct count","date":"distinct count","close":"last","high":"sum","low":"sum","open":"sum"}';
            loadto.setAttribute('column-pivots', '["ticker"]');
            loadto.setAttribute('row-pivots', '["date"]');

            if (jsn){
                loadto.update(jsn);
            }
        }
    };
    xhr1.send(null);
}


function fetch_and_load_company(path:string, loadto:HTMLTableElement){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        if(xhr1.response){
            var jsn = JSON.parse(xhr1.response);
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
        fetch_and_load_grid('/api/json/v1/data?type=quote&ticker=' + this.entered, psps['quote'].pspNode, true, false);
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
