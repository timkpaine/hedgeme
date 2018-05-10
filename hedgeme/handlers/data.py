import lantern as l
import pyEX as p
from .base import ServerHandler


class DataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(DataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('ticker', '')
        if arg:
            df = p.chartDF(arg, '5y')
            print(df.to_json(orient='records'))
            self.write(df.to_json(orient='records'))

        else:
            self.write(l.line.sample().to_json(orient='records'))
