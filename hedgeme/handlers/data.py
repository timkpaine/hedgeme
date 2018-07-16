import pyEX as p
import json
from .base import HTTPHandler, WebSocketHandler


class StockDataHandler(HTTPHandler):
    def initialize(self, **kwargs):
        super(StockDataHandler, self).initialize()

    def get(self, *args):
        try:
            arg = self.get_argument('ticker', 'jpm')
            type = self.get_argument('type', 'all')

            data = {}

            if type in ('financials', 'all'):
                df = p.financialsDF(arg).reset_index()
                data['financials'] = df[-100:].to_dict(orient='records')

            elif type in ('chart', 'all'):
                df = p.chartDF(arg, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = arg
                data['chart'] = df.to_dict(orient='records')

            elif type in ('company', 'all'):
                data['company'] = p.company(arg)

            elif type in ('quote', 'all'):
                data['quote'] = p.quote(arg)

            elif type in ('dividends', 'all'):
                data['dividends'] = p.dividendsDF(arg).to_dict(orient='records')

            elif type in ('earnings', 'all'):
                data['earnings'] = p.earningsDF(arg).to_dict(orient='records')

            elif type in ('news', 'all'):
                data['news'] = p.newsDF(arg).to_dict(orient='records')

            elif type in ('peers', 'all'):
                data['peers'] = p.peersDF(arg).to_dict(orient='records')

            elif type in ('stats', 'all'):
                data['stats'] = p.stockStatsDF(arg).to_dict(orient='records')

            self.write(json.dumps(data))

        except KeyError:
            self.write('')


class StockDataHandlerWS(WebSocketHandler):
    def open(self):
        print('opened')

    def on_message(self, message):
        try:
            arg = message.get('ticker', 'jpm')
            type = message.get('type', 'all')
            data = {}

            if type in ('financials', 'all'):
                df = p.financialsDF(arg).reset_index()
                data['financials'] = df[-100:].to_dict(orient='records')

            elif type in ('chart', 'all'):
                df = p.chartDF(arg, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = arg
                data['chart'] = df.to_dict(orient='records')

            elif type in ('company', 'all'):
                data['company'] = p.company(arg)

            elif type in ('quote', 'all'):
                data['quote'] = p.quote(arg)

            elif type in ('dividends', 'all'):
                data['dividends'] = p.dividendsDF(arg).to_dict(orient='records')

            elif type in ('earnings', 'all'):
                data['earnings'] = p.earningsDF(arg).to_dict(orient='records')

            elif type in ('news', 'all'):
                data['news'] = p.newsDF(arg).to_dict(orient='records')

            elif type in ('peers', 'all'):
                data['peers'] = p.peersDF(arg).to_dict(orient='records')

            elif type in ('stats', 'all'):
                data['stats'] = p.stockStatsDF(arg).to_dict(orient='records')

            self.write_message(json.dumps(data))

        except KeyError:
            self.write_message({'key': 'error', 'data': ''})

    def on_close(self):
        pass


class MarketsDataHandler(HTTPHandler):
    def initialize(self, **kwargs):
        super(MarketsDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        self.write(json.dumps({'markets': p.marketsDF().to_dict(orient='records')}))
