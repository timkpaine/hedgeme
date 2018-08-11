import copy
import json
import os
import os.path
import pandas as pd
import pyEX as p
import numpy as np
from functools import lru_cache
from datetime import datetime, timedelta, date
from .define import FIELDS


@lru_cache(1)
def today():
    today = date.today()
    return datetime(year=today.year, month=today.month, day=today.day)


class Cache(object):
    def __init__(self, tickers):
        self._cache = {}
        self._tickers = tickers

    def preload(self, keys, fields):
        for key in keys:
            # tickers always caps
            key = key.upper()
            for field in fields:
                # fields always lower
                field = field.lower()
                if key not in self._cache or field not in self._cache[key]:
                    print('fetching %s for %s' % (field, key))
                    self._fetch(key, field)

    def load(self, dir):
        self._dir = dir

        # dump tickers for reference
        self._tickers.to_csv(os.path.join(self._dir, 'TICKERS.csv'))

        with open(os.path.join(self._dir, 'TIMESTAMP'), 'r') as fp:
            self._sync = datetime.strptime(fp.read(), '%Y/%m/%d-%H:%M:%S')

        if not os.path.exists(self._dir):
            os.makedirs(self._dir)

        for k in os.listdir(self._dir):
            if self._sync < today():

                self.preload([k], FIELDS)

            else:
                if k not in self._cache:
                    self._cache[k] = {}
                    self._cache[k]['timestamp'] = {}

                for f in FIELDS:
                    filename = os.path.join(self._dir, k, f + '.json')

                    if 'timestamp' not in self._cache[k]:
                        self._cache[k]['timestamp'] = {}

                    if os.path.exists(filename):
                        with open(filename, 'r') as fp:
                            self._cache[k][f] = json.load(fp)
                            self._cache[k]['timestamp'][f] = datetime.now()

    def save(self):
        if not os.path.exists(self._dir):
            os.makedirs(self._dir)

        for k in self._cache:
            for f in self._cache[k]:
                if f == 'timestamp':
                    continue

                if not os.path.exists(os.path.join(self._dir, k)):
                    os.makedirs(os.path.join(self._dir, k))
                filename = os.path.join(self._dir, k, f + '.json')
                with open(filename, 'w') as fp:
                    if self._check_timestamp(k, f):
                        self._fetch(k, f)
                    fp.write(json.dumps(self._cache[k][f]))

        with open(os.path.join(self._dir, 'TIMESTAMP'), 'w') as fp:
            fp.write(datetime.now().strftime('%Y/%m/%d-%H:%M:%S'))

    def _check_timestamp(self, key, field):
        if self._cache[key].get('timestamp', {}).get(field, today() - timedelta(days=1)) < today():
            return True
        return False

    def _fetch(self, key, field):
        # tickers always caps
        key = key.upper()

        # fields always lower
        field = field.lower()

        if not (self._tickers['symbol'] == key).any():
            return {}

        if key in self._cache:
            if field == 'all':
                if len(FIELDS) == len(self._cache[key]):
                    ret = copy.deepcopy(self._cache[key])
                    del ret['timestamp']
                    return ret

            elif field in self._cache[key]:
                return {field: self._cache[key][field]}

        if key not in self._cache:
            self._cache[key] = {}
            self._cache[key]['timestamp'] = {}

        if field in ('financials', 'all'):
            if 'financials' not in self._cache[key] or self._check_timestamp(key, 'financials'):
                df = p.financialsDF(key).reset_index()
                self._cache[key]['financials'] = df[-100:].replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['financials'] = datetime.now()

        if field in ('chart', 'all'):
            if 'chart' not in self._cache[key] or self._check_timestamp(key, 'chart'):
                df = p.chartDF(key, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = key
                self._cache[key]['chart'] = df.replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['chart'] = datetime.now()

        if field in ('company', 'all'):
            if 'company' not in self._cache[key] or self._check_timestamp(key, 'company'):
                self._cache[key]['company'] = p.company(key)
                self._cache[key]['timestamp']['company'] = datetime.now()

        if field in ('quote', 'all'):
            # always update
            self._cache[key]['quote'] = p.quote(key)

        if field in ('dividends', 'all'):
            if 'dividends' not in self._cache[key] or self._check_timestamp(key, 'dividends'):
                self._cache[key]['dividends'] = p.dividendsDF(key).replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['dividends'] = datetime.now()

        if field in ('earnings', 'all'):
            if 'earnings' not in self._cache[key] or self._check_timestamp(key, 'earnings'):
                self._cache[key]['earnings'] = p.earningsDF(key).replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['earnings'] = datetime.now()

        if field in ('news', 'all'):
            if 'news' not in self._cache[key] or self._check_timestamp(key, 'news'):
                self._cache[key]['news'] = p.newsDF(key).replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['news'] = datetime.now()

        if field in ('peers', 'all'):
            if 'peers' not in self._cache[key] or self._check_timestamp(key, 'peers'):
                peers = p.peersDF(key).replace({np.nan: None})
                infos = pd.concat([p.companyDF(item) for item in peers[0].values])
                self._cache[key]['peers'] = infos.to_dict(orient='records')
                self._cache[key]['timestamp']['peers'] = datetime.now()

        if field in ('stats', 'all'):
            if 'stats' not in self._cache[key] or self._check_timestamp(key, 'stats'):
                self._cache[key]['stats'] = p.stockStatsDF(key).replace({np.nan: None}).to_dict(orient='records')
                self._cache[key]['timestamp']['stats'] = datetime.now()

        if field == 'all':
            ret = copy.deepcopy(self._cache[key])
            del ret['timestamp']
            return ret

        return {field: self._cache[key][field]}


def main():
    tickers = p.symbolsDF()
    cache = Cache(tickers)
    cache.load('./cache')

    i = 0
    for item in tickers.symbol.values.tolist():
        try:
            print('loading %s' % item)
            cache.preload([item], FIELDS)
            i += 1
            if i == 25:
                cache.save()
        except KeyError:
            pass

if __name__ == "__main__":
    main()
