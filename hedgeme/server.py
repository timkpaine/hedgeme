import sys
import os.path
import pyEX
import signal
import tornado.ioloop
import tornado.web
from functools import partial
from .utils import log, parse_args
from .cache import Cache
from .handlers import HTMLOpenHandler, AutocompleteHandler, StockDataHandler, MarketsDataHandler, StockDataHandlerWS
from .define import FIELDS


def sig_handler(server, cache, sig, frame):
    io_loop = tornado.ioloop.IOLoop.instance()

    def shutdown():
        io_loop.stop()

    io_loop.add_callback_from_signal(shutdown)
    cache.save()


def getContext():
    d = {}
    d['tickers'] = pyEX.symbolsDF()
    d['cache'] = Cache(d['tickers'])
    return d


class ServerApplication(tornado.web.Application):
    def __init__(self, context, cookie_secret=None, debug=True):
        root = os.path.join(os.path.dirname(__file__), 'assets')
        static = os.path.join(root, 'static')

        default_handlers = [
            (r"/", HTMLOpenHandler, {'template': 'index.html'}),
            (r"/api/json/v1/data", StockDataHandler, context),
            (r"/api/ws/v1/data", StockDataHandler, context),
            (r"/api/json/v1/markets", MarketsDataHandler, context),
            (r"/api/json/v1/autocomplete", AutocompleteHandler, context),
            (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": static}),
            (r"/(.*)", HTMLOpenHandler, {'template': '404.html'})
        ]

        settings = {
                "cookie_secret": cookie_secret or "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
                "login_url": "/login",
                "debug": debug,
                "template_path": os.path.join(root, 'templates'),
                }

        super(ServerApplication, self).__init__(default_handlers, **settings)


def main(*args, **kwargs):
    port = kwargs.get('port', 8080)

    context = getContext()

    application = ServerApplication(context)
    log.info('LISTENING: %s', port)
    application.listen(port)

    cache = context['cache']
    cache.load('./cache', preload=False)
    cache.preload(['aapl', 'jpm'], FIELDS)

    signal.signal(signal.SIGTERM, partial(sig_handler, application, cache))
    signal.signal(signal.SIGINT, partial(sig_handler, application, cache))

    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        cache.save()

if __name__ == "__main__":
    args, kwargs = parse_args(sys.argv)
    main(*args, **kwargs)
