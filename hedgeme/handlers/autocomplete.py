from .base import HTTPHandler


class AutocompleteHandler(HTTPHandler):
    def initialize(self, tickers=None, **kwargs):
        super(AutocompleteHandler, self).initialize()
        self.tickers = tickers

    def get(self, *args):
        '''Get the login page'''
        arg = self.get_argument('partial', '')
        if arg:
            self.write(self.tickers[
                self.tickers['symbol'].str.startswith(arg.upper()) |
                self.tickers['name'].str.lower().str.contains(arg.lower())]
                [:10].to_json(orient='records'))
        else:
            self.write('[]')
