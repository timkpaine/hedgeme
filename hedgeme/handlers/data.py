import pyEX as p
from .base import ServerHandler


class StockDataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(StockDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
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


class MarketsDataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(MarketsDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        self.write(p.marketsDF().to_json(orient='records'))
