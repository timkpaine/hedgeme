import {
  Message,
} from "@phosphor/messaging";

import {
  Widget,
} from "@phosphor/widgets";

import {
  IRequestResult, request,
} from "requests-helper";

export
class TableWidget extends Widget {

  get tableNode(): any {
    return this.node.getElementsByTagName("table")[0];
  }

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    const table = document.createElement("table");
    node.appendChild(table);
    return node;
  }

  constructor(name: string) {
    super({ node: TableWidget.createNode() });
    this.addClass("tableWidget");
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `${name}`;
  }

  public loadData(jsn: any, unwrap?: string | boolean, raw?: string | boolean) {
    while (this.tableNode.lastChild) {
        this.tableNode.removeChild(this.tableNode.lastChild);
    }

    if (jsn) {
      if (unwrap) {
        for (const x of Object.keys(jsn)) {
            const row = document.createElement("tr");
            const td1 = document.createElement("td");
            const td2 = document.createElement("td");
            if (raw) {
              td1.innerHTML = x;
              td2.innerHTML = jsn[x];
            } else {
              td1.textContent = x;
              td2.textContent = jsn[x];
            }
            row.appendChild(td1);
            row.appendChild(td2);
            this.tableNode.appendChild(row);
        }
      } else {
        let first = true;
        for (const r of Object.keys(jsn)) {
          let header;
          if (first) {
            header = document.createElement("tr");
          }
          const row = document.createElement("tr");

          for (const c of Object.keys(jsn[r])) {
            if (first && header) {
              const th = document.createElement("th");
              th.textContent = c;
              header.appendChild(th);
            }
            const td = document.createElement("td");
            if (raw) {
              td.innerHTML = jsn[r][c] as string;
            } else {
              td.textContent = jsn[r][c] as string;
            }
            row.appendChild(td);
            if (first) {
              first = false;
              this.tableNode.appendChild(header);
            }
            this.tableNode.appendChild(row);
          }
        }
      }
    }
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.tableNode.focus();
    }
  }
}

// tslint:disable-next-line: max-classes-per-file
export class TableHelper {
  // tslint:disable: variable-name
  private _url: string;
  private _preload_url?: string;
  private _table_widgets: {[key: string]: TableWidget};
  private _data_options?: {[table_key: string]: {[key: string]: boolean | string}};
  private _repeat = -1;
constructor(url: string,  // The url to fetch data from
            tables: {[key: string]: TableWidget}, // A set of table widgets
// tslint:disable-next-line: no-trailing-whitespace
            data_options?: {[table_key: string]: 
                {[key: string]: boolean | string}}, // data load options to configure the widgets,
            preload_url?: string,  // The url to fetch initial/cached data from
            repeat?: number) {
    this._url = url;
    this._preload_url = preload_url;
    this._table_widgets = tables;
    this._data_options = data_options;

    if (repeat) {this._repeat = repeat; }
  }

  public start(delay?: number): Promise<number> {
    return new Promise((resolve) => {
      if (this._preload_url) {
        this.fetchAndLoad(true).then((count: number) => {
            resolve(count);
          });
      }

      if (this._repeat > 0) {
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

  public setUrl(url: string, refetch = true): Promise<number> {
    return new Promise((resolve) => {
      this._url = url;
      if (refetch) {
        this.fetchAndLoad().then((count: number) => {
          resolve(count);
        });
      } else {
        resolve(0);
      }
    });
  }

  public fetchAndLoad(use_preload_url = false): Promise<number> {

    let url = "";
    if (use_preload_url && this._preload_url) {
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
      request("get", url).then((res: IRequestResult) => {
        if (res.ok) {
          const json = res.json() as any;
          if (Object.keys(json).length > 0) {
            let count = 0;
            for (const table of Object.keys(this._table_widgets)) {
              let wrap = false;
              let unwrap = false;
              let data_key;
              let raw = false;

              if (this._data_options && Object.keys(this._data_options).includes(table)) {
                if (Object.keys(this._data_options[table]).includes("wrap")) {
                  wrap =  this._data_options[table].wrap as boolean || false;
                }
                if (Object.keys(this._data_options[table]).includes("unwrap")) {
                  unwrap =  this._data_options[table].unwrap as boolean || false;
                }
                if (Object.keys(this._data_options[table]).includes("key")) {
                  data_key = this._data_options[table].key || "";
                }
                if (Object.keys(this._data_options[table]).includes("raw")) {
                  raw =  this._data_options[table].raw as boolean || false;
                }
              }

              if (data_key && data_key !== true && data_key !== "" && !Object.keys(json).includes(data_key)) {
                  continue;
              }

              let jsn = json;
              if (wrap) {jsn = [json]; }
              if (data_key && data_key !== true && data_key !== "") {
                jsn = json[data_key];
              }
              if (unwrap) {jsn = jsn[0]; }
              this._table_widgets[table].loadData(jsn, unwrap, raw);
              count++;
            }
            resolve(count);
          }
        }
      });
    });
  }
}
