import pyEX as p


class Cache(object):
    def __init__(self, keys, fields):
        self._cache = {}

        for key in keys:
            for field in fields:
                self._fetch(key, field)

    def _fetch(self, key, field):
        if key in self._cache:
            if field == 'all':
                return self._cache[key]

            elif field in self._cache[key]:
                return {field: self._cache[key][field]}

        if key not in self._cache:
            self._cache[key] = {}

        data = {}
        if field in ('financials', 'all'):
            df = p.financialsDF(key).reset_index()
            data['financials'] = df[-100:].to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('chart', 'all'):
            df = p.chartDF(key, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
            df['ticker'] = key
            data['chart'] = df.to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('company', 'all'):
            data['company'] = p.company(key)
            self._cache[key].update(data)

        if field in ('quote', 'all'):
            data['quote'] = p.quote(key)
            self._cache[key].update(data)

        if field in ('dividends', 'all'):
            data['dividends'] = p.dividendsDF(key).to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('earnings', 'all'):
            data['earnings'] = p.earningsDF(key).to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('news', 'all'):
            data['news'] = p.newsDF(key).to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('peers', 'all'):
            data['peers'] = p.peersDF(key).to_dict(orient='records')
            self._cache[key].update(data)

        if field in ('stats', 'all'):
            data['stats'] = p.stockStatsDF(key).to_dict(orient='records')
            self._cache[key].update(data)

        if field == 'all':
            return self._cache[key]

        return {field: self._cache[key][field]}
