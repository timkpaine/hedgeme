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


function autocomplete_ticker(path: string, value: string, autocomplete: HTMLDataListElement){
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
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
    };
    xhr1.send(null);
}

function fetch_and_load_cashflow(path:string, loadto:any){ //PSP Widget
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
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

function fetch_and_load_chart(path:string, loadto:any){ //PSP Widget
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', path, true);
    xhr1.onload = function () { 
        var jsn = JSON.parse(xhr1.response);

        loadto.view = 'y_line';
        loadto.columns = '["open","close","high","low"]';
        loadto.aggregates = '{"ticker":"distinct count","date":"distinct count","close":"last","high":"sum","low":"sum","open":"sum"}';
        loadto.setAttribute('column-pivots', '["ticker"]');
        loadto.setAttribute('row-pivots', '["date"]');

        if (jsn){
            loadto.delete();
            loadto.update(jsn);
        }
    };
    xhr1.send(null);
}


export
class ControlsWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    let datalist = document.createElement('datalist');

    input.placeholder = 'Ticker';
    input.value = 'JPM';
    input.id = 'controls_input';
    datalist.id = 'controls_datalist';
    input.setAttribute('list', datalist.id);

    content.appendChild(input);
    content.appendChild(datalist);
    node.appendChild(content);
    return node;
  }

  constructor(psps: {[key:string]:PSPWidget;}) {
    super({ node: ControlsWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('controls');
    this.title.label = 'Controls';
    this.title.closable = false;
    this.title.caption = 'Controls';
    this.node.id = 'controls';

    let input = this.inputNode;
    let autocomplete = this.datalistNode;
    this.entered = '';
    this.last = '';

    input.addEventListener('keyup', function(e: KeyboardEvent){
        if (e.keyCode === 13){
            // if(this.entered == input.value){
            //     return;
            // }
            fetch_and_load_cashflow('/cash?ticker=' + input.value, psps['cash'].pspNode);
            fetch_and_load_chart('/chart?ticker=' + input.value, psps['chart'].pspNode);

            this.entered = input.value;
        }

        if (this.last == input.value){
            // duplicate
            return;
        }

        if (e.keyCode !== 13){
            autocomplete_ticker('/autocomplete?partial=' + input.value, input.value, autocomplete);
        }

        this.last = input.value;
    }.bind(this));

    fetch_and_load_cashflow('/cash?ticker=JPM', psps['cash'].pspNode);
    fetch_and_load_chart('/chart?ticker=JPM', psps['chart'].pspNode);


  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  get datalistNode(): HTMLDataListElement {
    return this.node.getElementsByTagName('datalist')[0] as HTMLDataListElement;
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }

  private entered:string;
  private last:string;
}
