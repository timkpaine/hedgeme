import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import {
  PSPWidget
} from './psp';

import '../style/index.css';



function autocomplete_ticker(path: string, value: string, autocomplete: HTMLDataListElement){
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

function fetch_and_load(path:string, loadto:any){ //PSP Widget
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

export
class ControlsWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    let datalist = document.createElement('datalist');

    input.placeholder = 'JPM';
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
            if(this.entered == input.value){
                return;
            }
            fetch_and_load('/data?ticker=' + input.value, psps['chart'].pspNode);

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
