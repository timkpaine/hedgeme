import pyEX as p
from .base import ServerHandler


class DataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(DataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('ticker', 'aapl')
        # df = p.chartDF(arg, '5y')
        df = p.financialsDF(arg).reset_index()
        print(df.to_json(orient='records'))
        self.write(df[-100:].to_json(orient='records'))
