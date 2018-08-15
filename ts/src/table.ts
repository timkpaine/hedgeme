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
    this.addClass('tablewidget');
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

  loadData(jsn: any, unwrap?: string | boolean, raw?: string | boolean){
    while(this.tableNode.lastChild){
        this.tableNode.removeChild(this.tableNode.lastChild);
    }

    if (jsn){
      if (unwrap){
        for (let x of Object.keys(jsn)){
            let row = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            if(raw){
              td1.innerHTML = x;
              td2.innerHTML = jsn[x];
            } else {
              td1.textContent = x;
              td2.textContent = jsn[x];
            }
            row.appendChild(td1);
            row.appendChild(td2);
            this.tableNode.appendChild(row)
        }
      } else {
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

  start(delay?: number): void {
    if (this._preload_url){
      this.fetch_and_load(true);
    }

    if (this._repeat > 0){
      setInterval(() => {
        this.fetch_and_load();
      }, this._repeat);
    } else {
      this.fetch_and_load();
    }
  }

  set_url(url: string, refetch = true): void{
    this._url = url;
    if (refetch){
      this.fetch_and_load();
    }
  }

  fetch_and_load(use_preload_url = false): void {
    let url = '';
    if(use_preload_url && this._preload_url){
      url = this._preload_url;
    } else {
      url = this._url;
    }

    for(let table of Object.keys(this._table_widgets)){
      let wrap;
      let unwrap;
      let data_key;
      let raw;

      if(this._data_options && Object.keys(this._data_options).includes(table)){
        if(Object.keys(this._data_options[table]).includes('wrap')){
          wrap = this._data_options[table]['wrap'] || false;
        }
        if(Object.keys(this._data_options[table]).includes('unwrap')){
          unwrap = this._data_options[table]['unwrap'] || false;
        }
        if(Object.keys(this._data_options[table]).includes('key')){
          data_key = this._data_options[table]['key'] || '';
        }
        if(Object.keys(this._data_options[table]).includes('raw')){
          raw = this._data_options[table]['raw'] || false;
        }
      }
      this._fetch_and_load_http(url, table, data_key, wrap, unwrap, raw);
    }
  }

  private _fetch_and_load_http(url: string, table_key: string, data_key?: string | boolean, wrap?: string | boolean, unwrap?: string | boolean, raw?: string | boolean): void {
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', url, true);
    xhr1.onload = () => { 
      if(xhr1.response){
        let jsn = JSON.parse(xhr1.response);
        if (Object.keys(jsn).length > 0){
          if (wrap){jsn = [jsn];}
          if(data_key && data_key !== true && data_key !== ''){
            jsn = jsn[data_key];
          }
          if (unwrap){jsn = jsn[0];}
          this._table_widgets[table_key].loadData(jsn, unwrap, raw);
        }
      }
    };
    xhr1.send(null);
  }

  _url: string;
  private _preload_url?: string;
  private _table_widgets: {[key:string]:TableWidget};
  private _data_options?: {[table_key: string]: {[key:string]: boolean | string}};
  private _repeat = -1;
}
