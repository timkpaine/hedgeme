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


@lru_cache(1)
def yesterday():
    today = date.today()
    return datetime(year=today.year, month=today.month, day=today.day) - timedelta(days=1)


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
                    try:
                        self._fetch(key, field)
                    except KeyError:
                        self._cache[key][field] = pd.DataFrame()

    def purge(self, tickers):
        for ticker in tickers:
            self._cache.pop(ticker)

    def load(self, dir, preload=True):
        self._dir = dir

        # make if not exists
        if not os.path.exists(self._dir):
            os.makedirs(self._dir)

        # dump tickers for reference
        self._tickers.to_csv(os.path.join(self._dir, 'TICKERS.csv'))

        # get last sync date
        if os.path.exists(os.path.join(self._dir, 'TIMESTAMP')):
            with open(os.path.join(self._dir, 'TIMESTAMP'), 'r') as fp:
                self._sync = datetime.strptime(fp.read(), '%Y/%m/%d-%H:%M:%S')
        else:
            self._sync = yesterday()

        for k in os.listdir(self._dir):
            if k in ('TICKERS.CSV', 'TIMESTAMP'):
                continue

            if self._sync < today() and preload:
                self.preload([k], FIELDS)

            else:
                if k not in self._cache:
                    self._cache[k] = {}
                    self._cache[k]['timestamp'] = {}

                for f in FIELDS:
                    filename = os.path.join(self._dir, k, f + '.csv')

                    if 'timestamp' not in self._cache[k]:
                        self._cache[k]['timestamp'] = {}

                    if os.path.exists(filename):
                        self._cache[k][f] = pd.read_csv(filename)
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
                filename = os.path.join(self._dir, k, f + '.csv')

                if self._check_timestamp(k, f):
                    self._fetch(k, f)
                self._cache[k][f].to_csv(filename)

        with open(os.path.join(self._dir, 'TIMESTAMP'), 'w') as fp:
            fp.write(datetime.now().strftime('%Y/%m/%d-%H:%M:%S'))

    def _check_timestamp(self, key, field):
        if self._cache[key].get('timestamp', {}).get(field, yesterday()) < today():
            return True
        return False

    def _fetch(self, key, field):
        # tickers always caps
        key = key.upper()

        # fields always lower
        field = field.lower()

        if not (self._tickers['symbol'] == key).any():
            # FIXME
            return {}

        if key not in self._cache:
            # initialize cache
            self._cache[key] = {}
            self._cache[key]['timestamp'] = {}

        if field in ('financials', 'all'):
            if 'financials' not in self._cache[key] or self._check_timestamp(key, 'financials'):
                self._cache[key]['financials'] = p.financialsDF(key)
                self._cache[key]['timestamp']['financials'] = datetime.now()

        if field in ('chart', 'all'):
            if 'chart' not in self._cache[key] or self._check_timestamp(key, 'chart'):
                self._cache[key]['chart'] = p.chartDF(key, '1m')
                self._cache[key]['timestamp']['chart'] = datetime.now()

        if field in ('company', 'all'):
            if 'company' not in self._cache[key] or self._check_timestamp(key, 'company'):
                self._cache[key]['company'] = p.companyDF(key)
                self._cache[key]['timestamp']['company'] = datetime.now()

        if field in ('quote', 'all'):
            # always update
            self._cache[key]['quote'] = p.quoteDF(key)

        if field in ('dividends', 'all'):
            if 'dividends' not in self._cache[key] or self._check_timestamp(key, 'dividends'):
                self._cache[key]['dividends'] = p.dividendsDF(key)
                self._cache[key]['timestamp']['dividends'] = datetime.now()

        if field in ('earnings', 'all'):
            if 'earnings' not in self._cache[key] or self._check_timestamp(key, 'earnings'):
                self._cache[key]['earnings'] = p.earningsDF(key)
                self._cache[key]['timestamp']['earnings'] = datetime.now()

        if field in ('news', 'all'):
            if 'news' not in self._cache[key] or self._check_timestamp(key, 'news'):
                self._cache[key]['news'] = p.newsDF(key)
                self._cache[key]['timestamp']['news'] = datetime.now()

        if field in ('peers', 'all'):
            if 'peers' not in self._cache[key] or self._check_timestamp(key, 'peers'):
                peers = p.peersDF(key)
                if peers is not None and not peers.empty:
                    peers = peers.replace({np.nan: None})
                    infos = pd.concat([p.companyDF(item) for item in peers[0].values])
                    self._cache[key]['peers'] = infos
                else:
                    self._cache[key]['peers'] = pd.DataFrame()
                self._cache[key]['timestamp']['peers'] = datetime.now()

        if field in ('stats', 'all'):
            if 'stats' not in self._cache[key] or self._check_timestamp(key, 'stats'):
                self._cache[key]['stats'] = p.stockStatsDF(key)
                self._cache[key]['timestamp']['stats'] = datetime.now()

        # pull data
        if field == 'all':
            ret = copy.deepcopy(self._cache[key])
            del ret['timestamp']

        elif field in self._cache[key]:
            # or i have that field
            ret = {field: self._cache[key][field]}

        else:
            raise Exception('Should never get here')

        for field in ret:
            if field == 'financials':
                df = ret['financials'].reset_index()
                ret['financials'] = df[-100:].replace({np.nan: None}).to_dict(orient='records')

            if field == 'chart':
                df = ret['chart'].reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = key
                ret['chart'] = df.replace({np.nan: None}).to_dict(orient='records')

            if field == 'dividends':
                ret['dividends'] = ret['dividends'].replace({np.nan: None}).to_dict(orient='records')

            if field == 'company':
                ret['company'] = ret['company'].replace({np.nan: None})[
                    ['CEO', 'symbol', 'companyName', 'description', 'sector', 'industry', 'issueType', 'exchange', 'website']].replace({np.nan: None}).to_dict(orient='records')[0]

            if field == 'quote':
                ret['quote'] = ret['quote'].replace({np.nan: None}).to_dict(orient='records')[0]

            if field == 'earnings':
                ret['earnings'] = ret['earnings'].replace({np.nan: None}).to_dict(orient='records')

            if field == 'news':
                ret['news'] = ret['news'].replace({np.nan: None}).to_dict(orient='records')

            if field == 'peers':
                ret['peers'] = ret['peers'].replace({np.nan: None}).to_dict(orient='records')

            if field == 'stats':
                ret['stats'] = ret['stats'].replace({np.nan: None}).to_dict(orient='records')

        return ret


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
                cache.purge(list(cache._cache.keys()))

        except KeyError:
            pass

if __name__ == "__main__":
    main()
