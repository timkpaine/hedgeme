import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';


import "@jpmorganchase/perspective-viewer/build/perspective.view.js";
import "@jpmorganchase/perspective-viewer-hypergrid/build/hypergrid.plugin.js";
import "@jpmorganchase/perspective-viewer-highcharts/build/highcharts.plugin.js";


export
class PSPWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('perspective-viewer');
    node.appendChild(content);
    return node;
  }

  constructor(name: string) {
    super({ node: PSPWidget.createNode() });
    this.addClass('pspwidget');
    this.title.label = name;
    // this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
  }

  get pspNode(): any {
    return this.node.getElementsByTagName('perspective-viewer')[0];
  }

  onAfterAttach(msg: Message) : void {
    this.pspNode.notifyResize();
  }

  onAfterShow(msg: Message): void {
    this.pspNode.notifyResize();
  }

  onResize(msg: Message): void {
    this.pspNode.notifyResize();
  }

  protected onActivateRequest(msg: Message): void {
    this.pspNode.notifyResize();
    if (this.isAttached) {
      this.pspNode.focus();
    }
  }
}

export enum ViewOption {
  VIEW = 'view',
  INDEX = 'index',
  COLUMNS = 'columns',
  ROW_PIVOTS = 'row-pivots',
  COLUMN_PIVOTS = 'column-pivots',
  AGGREGATES = 'aggregates',
  SORT = 'sort',
  SETTINGS = 'settings'
}

function view_string_to_view_option(option: string): ViewOption {
  switch(option){
    case 'view': {
      return ViewOption.VIEW;
    }
    case 'index': {
      return ViewOption.INDEX;
    }
    case 'columns': {
      return ViewOption.COLUMNS;
    }
    case 'row-pivots': {
      return ViewOption.ROW_PIVOTS;
    }
    case 'column-pivots': {
      return ViewOption.COLUMN_PIVOTS;
    }
    case 'aggregates': {
      return ViewOption.AGGREGATES;
    }
    case 'sort': {
      return ViewOption.SORT;
    }
    case 'settings': {
      return ViewOption.SETTINGS;
    }
    default: {
      throw 'option not recognized';
    }
  }
}

export type ViewSettings = {
  [ key in ViewOption ]?: string;
}

export enum DataOption {
  DELETE = 'delete',
  WRAP = 'wrap',
  KEY = 'key'
}

// function data_string_to_data_option(option: string): DataOption {
//   switch(option){
//     case 'delete': {
//       return DataOption.DELETE;
//     }
//     case 'wrap': {
//       return DataOption.WRAP;
//     }
//     default: {
//       throw 'option not recognized';
//     }
//   }
// }

export type DataSettings = {
  [ key in DataOption ]?: boolean | string;
}


// TODO pull from perspective/types
export enum TypeNames {
  STRING = 'string',
  FLOAT = 'float',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATETIME = 'date'
}

// TODO pull from perspective/types
export type Schema = {
  [ key: string ]: TypeNames;
}

export class PerspectiveHelper {
constructor(url: string,  // The url to fetch data from
            psps: {[key:string]:PSPWidget}, // A set of perspective widgets 
            view_options?: {[psp_key: string]: ViewSettings}, // view options to configure the widgets,
                                                              // keyed by the `psps` keys
            data_options?: {[psp_key: string]: DataSettings}, // data load options to configure the widgets,
                                                              // keyed by the `psps` keys
            schema?: {[psp_key: string]: Schema},    // <optional> schemas to preload onto the widgets,
                                                     // keyed by the `psps` keys
            preload_url?: string,  // The url to fetch initial/cached data from
            repeat?: number) // repeat interval, if http or https
  {  
    this._url = url;
    this._preload_url = preload_url;
    this._psp_widgets = psps;
    this._data_options = data_options;
    this._view_options = view_options;

    if (repeat){this._repeat = repeat}
    for (let psp of Object.keys(this._psp_widgets)){
      // preload schema
      if(schema && Object.keys(schema).includes(psp)){
        this._psp_widgets[psp].pspNode.load(schema[psp]);
      }

      // preset view options
      if(view_options && Object.keys(view_options).includes(psp)){
        for (let attr of Object.keys(view_options[psp])){
          let view_option = view_string_to_view_option(attr);
          this._psp_widgets[psp].pspNode.setAttribute(attr, view_options[psp][view_option]);
        }
      }
    }
  }

  start(delay?: number): Promise<number> {
    return new Promise((resolve) => {
      if (this._preload_url){
        this.fetchAndLoad(true).then((count:number) => {
          resolve(count);
        });
      }

      if (this._repeat > 0){
        setInterval(() => {
          this.fetchAndLoad();
        }, this._repeat);
        resolve(0);
      } else {
        this.fetchAndLoad().then((count: number) => {
          resolve(count);
        });
      }
    });
  }

  setUrl(url: string, refetch = true): Promise<number>{
    return new Promise((resolve) => {
      this._url = url;
      if (refetch){
        this.fetchAndLoad().then((count: number)=>{
          resolve(count);
        });
      } else{
        resolve(0);
      }
    });
  }

  fetchAndLoad(use_preload_url = false): Promise<number> {
    let url = '';
    if(use_preload_url && this._preload_url){
      url = this._preload_url;
    } else {
      url = this._url;
    }

    return new Promise((resolve) => {
      this._fetchAndLoadHttp(url).then((count: number) => {
          return resolve(count);
      });
    });
  }

  private _fetchAndLoadHttp(url: string): Promise<number> {
    return new Promise((resolve) => {
      var xhr1 = new XMLHttpRequest();
      xhr1.open('GET', url, true);
      xhr1.onload = () => { 
        if(xhr1.response){
          let json = JSON.parse(xhr1.response);
          if (Object.keys(json).length > 0){
            let count = 0;
            for(let psp of Object.keys(this._psp_widgets)){
              let _delete = true;
              let wrap = false;
              let data_key = '';

              if(this._data_options && Object.keys(this._data_options).includes(psp)){
                if(Object.keys(this._data_options[psp]).includes(DataOption.DELETE)){
                  _delete = <boolean>this._data_options[psp][DataOption.DELETE] || false;
                }
                if(Object.keys(this._data_options[psp]).includes(DataOption.WRAP)){
                  wrap = <boolean>this._data_options[psp][DataOption.WRAP] || false;
                }
                if(Object.keys(this._data_options[psp]).includes(DataOption.KEY)){
                  data_key = <string>this._data_options[psp][DataOption.KEY] || '';
                }

                if(typeof data_key === 'undefined' || data_key === '' || !Object.keys(json).includes(data_key)){
                  continue;
                }

                let jsn = json;
                if(_delete){this._psp_widgets[psp].pspNode.delete();}
                if(data_key !== ''){
                  jsn = jsn[data_key];
                }
                if (wrap){jsn = [jsn];}

                // workaround for heatmap non-refresh issue
                if(this._view_options && Object.keys(this._view_options).includes(psp)){
                  if(Object.keys(this._view_options[psp]).includes('view') && this._view_options[psp]['view'] == 'heatmap'){
                    if(!Object.keys(this._view_options[psp]).includes('columns')) {
                      let columns = Object.keys(jsn[0]);
                      var index = columns.indexOf('index');
                      if (index > -1) {
                        columns.splice(index, 1);
                      }
                      this._psp_widgets[psp].pspNode.setAttribute('columns', JSON.stringify(columns));
                      this._psp_widgets[psp].pspNode.removeAttribute('aggregates');
                    }
                  }
                }
                if(jsn && (jsn.length || Object.keys(jsn).length > 0)){
                  this._psp_widgets[psp].pspNode.update(jsn);
                }
                count++;
              }
            }
            setTimeout(() => {
              resolve(count);
            }, 1000);
          }
        }
      };
      xhr1.send(null);
    });
  }

  _url: string;
  private _preload_url?: string;
  private _psp_widgets: {[key:string]:PSPWidget};
  private _data_options?: {[psp_key: string]: DataSettings};
  private _repeat = -1;
  private _view_options?: {[psp_key: string]: ViewSettings};
  // private _worker: any; // TODO make this a shared perspective worker
}
