from .base import ServerHandler


class AutocompleteHandler(ServerHandler):
    def initialize(self, tickers=None, **kwargs):
        super(AutocompleteHandler, self).initialize()
        self.tickers = tickers

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('partial', '')
        if arg:
            self.write(self.tickers[self.tickers['symbol'].str.startswith(arg.upper())]['symbol'][:10].to_json(orient='records'))
        else:
            self.write('[]')
