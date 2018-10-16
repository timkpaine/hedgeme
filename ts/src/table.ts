import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';


import '../ts/style/index.css';

export
class TableWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let table = document.createElement('table');
    node.appendChild(table);
    return node;
  }

  constructor(name: string) {
    super({ node: TableWidget.createNode() });
    this.addClass('tableWidget');
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `${name}`;
  }

  get tableNode(): any {
    return this.node.getElementsByTagName('table')[0];
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.tableNode.focus();
    }
  }

  loadData(jsn: any, raw?: string | boolean){
    while(this.tableNode.lastChild){
        this.tableNode.removeChild(this.tableNode.lastChild);
    }

    if (jsn){
      let first = true;
      for(let r of Object.keys(jsn)){
        let header;
        if(first){
          header = document.createElement('tr');
        } 
        let row = document.createElement('tr');

        for(let c of Object.keys(jsn[r])){
          if(first && header){
            let th = document.createElement('th');
            th.textContent = c;
            header.appendChild(th)
          }
          let td = document.createElement('td');
          if(raw){
            td.innerHTML = jsn[r][c] as string;
          } else {
            td.textContent = jsn[r][c] as string;
          }
          row.appendChild(td);
        }

        if(first){
          first = false;
          this.tableNode.appendChild(header);
        }
        this.tableNode.appendChild(row);
      }
    }
  }
}



export class TableHelper {
constructor(url: string,  // The url to fetch data from
            tables: {[key:string]:TableWidget}, // A set of table widgets 
            data_options?: {[table_key: string]: {[key:string]:boolean | string}}, // data load options to configure the widgets,
            preload_url?: string,  // The url to fetch initial/cached data from
            repeat?: number) // repeat interval, if http or https
  {  
    this._url = url;
    this._preload_url = preload_url;
    this._table_widgets = tables;
    this._data_options = data_options;

    if (repeat){this._repeat = repeat}
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

  setUrl(url: string, refetch = true):  Promise<number>{
    return new Promise((resolve) => {
      this._url = url;
      if (refetch){
        this.fetchAndLoad().then((count: number)=>{
          resolve(count);
        });
      } else {
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
        resolve(count);
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
            for(let table of Object.keys(this._table_widgets)){
              let wrap = false;
              let data_key;
              let raw = false;

              if(this._data_options && Object.keys(this._data_options).includes(table)){
                if(Object.keys(this._data_options[table]).includes('wrap')){
                  wrap = <boolean>this._data_options[table]['wrap'] || false;
                }
                if(Object.keys(this._data_options[table]).includes('key')){
                  data_key = this._data_options[table]['key'] || '';
                }
                if(Object.keys(this._data_options[table]).includes('raw')){
                  raw = <boolean>this._data_options[table]['raw'] || false;
                }
              }

              if(data_key && data_key !== true && data_key !== '' && !Object.keys(json).includes(data_key)){
                  continue;
              }

              let jsn = json;
              if (wrap){jsn = [json];}
              if(data_key && data_key !== true && data_key !== ''){
                jsn = json[data_key];
              }
              this._table_widgets[table].loadData(jsn, raw);
              count++;
            }
            resolve(count);
          }
        }
      };
      xhr1.send(null);
    });
  }

  _url: string;
  private _preload_url?: string;
  private _table_widgets: {[key:string]:TableWidget};
  private _data_options?: {[table_key: string]: {[key:string]: boolean | string}};
  private _repeat = -1;
}
