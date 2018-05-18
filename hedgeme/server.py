import sys
import os.path
import pyEX
import tornado.ioloop
import tornado.web
from .utils import log, parse_args
from .handlers import HTMLOpenHandler, DataHandler, AutocompleteHandler


def getContext():
    d = {}
    d['tickers'] = pyEX.symbolsDF()
    return d


class ServerApplication(tornado.web.Application):
    def __init__(self, cookie_secret=None, debug=True):
        root = os.path.join(os.path.dirname(__file__), 'assets')
        static = os.path.join(root, 'static')

        context = getContext()

        default_handlers = [
            (r"/", HTMLOpenHandler, {'template': 'index.html'}),
            (r"/data", DataHandler, context),
            (r"/autocomplete", AutocompleteHandler, context),
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
    port = kwargs.get('port', 8889)

    application = ServerApplication()
    log.info('LISTENING: %s', port)
    application.listen(port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    args, kwargs = parse_args(sys.argv)
    main(*args, **kwargs)
