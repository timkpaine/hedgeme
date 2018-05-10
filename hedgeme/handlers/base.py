import tornado.ioloop
import tornado.web
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from ..utils import log


class ServerHandler(tornado.web.RequestHandler):
    '''Just a default handler'''
    def get_current_user(self):
        return self.get_secure_cookie('user')

    def _set_400(self, log_message, *args):
        log.info(log_message, *args)
        self.clear()
        self.set_status(400)
        self.finish('{"error":"400"}')
        raise tornado.web.HTTPError(400)

    def _set_401(self, log_message, *args):
        log.info(log_message, *args)
        self.clear()
        self.set_status(401)
        self.finish('{"error":"401"}')
        raise tornado.web.HTTPError(401)

    def _set_403(self, log_message, *args):
        log.info(log_message, *args)
        self.clear()
        self.set_status(403)
        self.finish('{"error":"403"}')
        raise tornado.web.HTTPError(403)

    def _writeout(self, message, log_message, *args):
        log.info(log_message, *args)
        self.set_header("Content-Type", "text/plain")
        self.write(message)

    def _set_login_cookie(self, client):
        self.set_secure_cookie('user', str(client.id))

    def _persist(self, validated_data):
        return self._persist_method(self, validated_data)

    def initialize(self, *args, **kwargs):
        '''Initialize the server competition registry handler

        This handler is responsible for managing competition
        registration.

        Arguments:
            competitions {dict} -- a reference to the server's dictionary of competitions
        '''
        super(ServerHandler, self).initialize(*args, **kwargs)

    def render_template(self, template, **kwargs):
        if hasattr(self, 'template_dirs'):
            template_dirs = self.template_dirs
        else:
            template_dirs = []

        if self.settings.get('template_path', ''):
            template_dirs.append(
                self.settings["template_path"]
            )
        env = Environment(loader=FileSystemLoader(template_dirs))

        try:
            template = env.get_template(self.template)
        except TemplateNotFound:
            raise TemplateNotFound(self.template)

        kwargs['current_user'] = self.current_user.decode('utf-8') if self.current_user else ''
        content = template.render(**kwargs)
        return content
