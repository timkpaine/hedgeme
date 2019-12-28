import {PerspectiveWidget, PerspectiveWidgetOptions} from "@finos/perspective-phosphor";
import {IRequestResult, request} from "requests-helper";

export
interface IConsumesData {
    loadData(data: any): void;
    updateData(data: any): void;
    urlChange(): void;
}

export
class PerspectiveDataLoader extends PerspectiveWidget {// implements  ConsumesData {
    constructor(name: string = "", options: PerspectiveWidgetOptions = {}) {
        super(name, options);
    }

    public loadData(data: any): void {
        super._load(data as PerspectiveWidgetOptions);
        super._render();
    }

    public updateData(data: any): void {
        super.data = data;
    }

    // tslint:disable-next-line: no-empty
    public urlChange(): void {

    }
}

// tslint:disable-next-line: max-classes-per-file
export
class DataLoader {

    private loads: [IConsumesData];
    private url: string;
    private params: any;
    private poll: number;
    constructor(loads: [IConsumesData], url: string, queryParams: any = {}, poll = 0) {
        this.loads = loads;
        this.url = url;
        this.params = queryParams;
        this.poll = poll;
    }

    public changeUrl(newurl: string, queryParams: any = {}): void {
        this.url = newurl;
        this.params = queryParams;
        for (const l of this.loads) {
            l.urlChange();
        }
    }

    public get(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            request("get", this.url, this.params).then((res: IRequestResult) => {
                if (res.ok) {
                    resolve(res.json());
                } else {
                    reject();
                }
            });
        });
    }

    public start(): void {
        this.get().then((data: any) => {
            for (const l of this.loads) {
                l.loadData(data);
            }
        });

        if (this.poll) {
            setTimeout(() => {
                this.get().then((data: any) => {
                    for (const l of this.loads) {
                        l.updateData(data);
                    }
                });
            }, this.poll);
        }
    }
}
