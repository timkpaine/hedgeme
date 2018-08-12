import pandas as pd
import tornado.concurrent
from .base import HTTPHandler


class AutocompleteHandler(HTTPHandler):
    def initialize(self, tickers=None, **kwargs):
        super(AutocompleteHandler, self).initialize()
        self.tickers = tickers

    @tornado.concurrent.run_on_executor
    def get_data(self, arg):
        return pd.concat([
            self.tickers[self.tickers['symbol'].str.startswith(arg.upper())],
            self.tickers[self.tickers['name'].str.lower().str.contains(arg.lower())]
            ])[:10].to_json(orient='records')

    async def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('partial', '')
        if arg:
            self.write(await self.get_data(arg))
        else:
            self.write('[]')
