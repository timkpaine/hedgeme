import tornado.concurrent
from perspective import PerspectiveHTTPMixin
from .base import HTTPHandler


class StockDataHandler(HTTPHandler, PerspectiveHTTPMixin):
    def initialize(self, cache, **kwargs):
        self._cache = cache
        super(StockDataHandler, self).initialize()

    @tornado.concurrent.run_on_executor
    def get_data(self, key, type):
        if type == 'daily':
            self.loadData(data=self._cache.daily([key]), view='y_line', columns=['open', 'high', 'low', 'close'])
            return self.getData()
        else:
            raise NotImplementedError()

    async def get(self, *args):
        key = self.get_argument('ticker', 'aapl')
        _type = self.get_argument('type', 'all')
        data = await self.get_data(key, _type)
        self.write(data)
