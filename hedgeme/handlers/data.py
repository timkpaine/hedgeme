import pyEX as p
from .base import ServerHandler


class CashDataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(CashDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        try:
            arg = self.get_argument('ticker', 'aapl')
            # df = p.chartDF(arg, '5y')
            df = p.financialsDF(arg).reset_index()
            self.write(df[-100:].to_json(orient='records'))
        except KeyError:
            self.write('')


class ChartDataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(ChartDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('ticker', 'aapl')
        df = p.chartDF(arg, '1m').reset_index()[['date', 'open', 'high', 'low', 'close']]
        df['ticker'] = arg
        self.write(df.to_json(orient='records'))


class CompanyDataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(CompanyDataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('ticker', 'aapl')
        self.write(p.company(arg))
