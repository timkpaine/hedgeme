import {
  request, RequestResult
} from './request';

export
interface ConsumesData {
    loadData(data: any): void;
    updateData(data: any): void;
    urlChange(): void;
}

export
class DataLoader {

    constructor(loads: [ConsumesData], url: string, queryParams: any = {}, poll = 0){
        this.loads = loads;
        this.url = url;
        this.params = queryParams;
        this.poll = poll;
    }

    changeUrl(newurl: string, queryParams: any = {}): void {
        this.url = newurl;
        this.params = queryParams;
        for(let l of this.loads){
            l.urlChange();
        }
    }

    get(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            request('get', this.url, this.params).then((res: RequestResult) => {
                if (res.ok){
                    resolve(res.json());
                } else {
                    reject();
                }
            });
        });
    }

    start(): void {
        this.get().then((data: any) => {
            for(let l of this.loads){
                l.updateData(data);
            }
        });

        if(this.poll){
            setTimeout(() => {
                this.get().then((data: any) => {
                    for(let l of this.loads){
                        l.updateData(data);
                    }
                });
            }, this.poll);
        }
    }

    private loads: [ConsumesData]
    private url: string;
    private params: any;
    private poll: number;

}

