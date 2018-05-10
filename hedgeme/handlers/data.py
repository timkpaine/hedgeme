import lantern as l
from .base import ServerHandler


class DataHandler(ServerHandler):
    def initialize(self, **kwargs):
        super(DataHandler, self).initialize()

    def get(self, *args):
        '''Get the login page'''
        self.write(l.line.sample().to_json(orient='records'))
