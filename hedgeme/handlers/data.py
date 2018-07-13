import pyEX as p
from .base import HTTPHandler, WebSocketHandler


class StockDataHandler(HTTPHandler):
    def initialize(self, **kwargs):
        super(StockDataHandler, self).initialize()

    def get(self, *args):
        try:
            arg = self.get_argument('ticker', 'aapl')
            type = self.get_argument('type', 'financials')

            if type == 'financials':
                df = p.financialsDF(arg).reset_index()
                self.write(df[-100:].to_json(orient='records'))
            elif type == 'chart':
                df = p.chartDF(arg, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = arg
                self.write(df.to_json(orient='records'))
            elif type == 'company':
                self.write(p.company(arg))
            elif type == 'quote':
                self.write(p.quote(arg))
            elif type == 'dividends':
                self.write(p.dividendsDF(arg).to_json(orient='records'))
            elif type == 'earnings':
                self.write(p.earningsDF(arg).to_json(orient='records'))
            elif type == 'news':
                self.write(p.newsDF(arg).to_json(orient='records'))
            elif type == 'peers':
                self.write(p.peersDF(arg).to_json(orient='records'))
            elif type == 'stats':
                self.write(p.stockStatsDF(arg).to_json(orient='records'))

        except KeyError:
            self.write('')


class StockDataHandlerWS(WebSocketHandler):
    def open(self):
        print('opened')

    def on_message(self, message):
        try:
            arg = message.get('ticker', 'aapl')
            type = message.get('type', 'financials')

            if type == 'financials':
                df = p.financialsDF(arg).reset_index()
                self.write_message({'key': 'financials', 'data': df[-100:].to_dict(orient='records')})

            elif type == 'chart':
                df = p.chartDF(arg, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
                df['ticker'] = arg
                self.write_message({'key': 'chart', 'data': df.to_dict(orient='records')})

            elif type == 'company':
                self.write_message({'key': 'company', 'data': p.company(arg)})

            elif type == 'quote':
                self.write_message({'key': 'quote', 'data': p.quote(arg)})

            elif type == 'dividends':
                self.write_message({'key': 'dividends', 'data': p.dividendsDF(arg).to_dict(orient='records')})

            elif type == 'earnings':
                self.write_message({'key': 'earnings', 'data': p.earningsDF(arg).to_dict(orient='records')})

            elif type == 'news':
                self.write_message({'key': 'news', 'data': p.newsDF(arg).to_dict(orient='records')})

            elif type == 'peers':
                self.write_message({'key': 'peers', 'data': p.peersDF(arg).to_dict(orient='records')})

            elif type == 'stats':
                self.write_message({'key': 'stats', 'data': p.stockStatsDF(arg).to_dict(orient='records')})

        except KeyError:
            self.write_message({'key': 'error', 'data': ''})

    def on_close(self):
        pass


class MarketsDataHandler(HTTPHandler):
    def initialize(self, **kwargs):
        super(MarketsDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        self.write(p.marketsDF().to_json(orient='records'))
