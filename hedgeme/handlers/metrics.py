import tornado.concurrent
from .base import HTTPHandler


class StockMetricsHandler(HTTPHandler):
    def initialize(self, metrics, **kwargs):
        self._metrics = metrics
        super(StockMetricsHandler, self).initialize()

    @tornado.concurrent.run_on_executor
    def get_data(self, key, type):
        return self._metrics.fetch(key, type)

    async def get(self, *args):
        key = self.get_argument('ticker', 'aapl')
        _type = self.get_argument('type', 'all')
        data = await self.get_data(key, _type)
        self.write(data)
