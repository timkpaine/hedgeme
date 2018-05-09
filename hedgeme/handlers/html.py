import tornado.web
from .base import ServerHandler
from ..utils.validate import validate_login_post, validate_register_post


class HTMLOpenHandler(ServerHandler):
    def initialize(self, clients=None, login=None, register=None, persist=None, template=None, template_kwargs=None, **kwargs):
        super(HTMLOpenHandler, self).initialize(clients={}, competitions={}, submissions={}, leaderboards={}, stash=[], login=login, register=register, persist=persist)
        self.template = template
        self.template_kwargs = template_kwargs or {}

    def get(self, *args):
        '''Get the login page'''
        if not self.template:
            self.redirect('/')
        else:
            if self.request.path == '/logout':
                self.clear_cookie("user")
            template = self.render_template(self.template, **self.template_kwargs)
            self.write(template)

    def post(self, *args):
        if self.request.path == '/login':
            self._validate(validate_login_post)
            user = self.get_argument('id', '') or self.current_user.decode('utf-8') or ''
            client = self._login(user)
            ret = self._login_post(client)
            if not ret:
                self.redirect('/login')

        elif self.request.path == '/register':
            data = self._validate(validate_register_post)
            ret = self._register_or_known(data)
            if not ret:
                self.redirect('/login')

        self.redirect(self.get_argument('next', '/'))


class HTMLHandler(HTMLOpenHandler):
    @tornado.web.authenticated
    def get(self, *args):
        '''Get the login page'''
        if not self.template:
            self.redirect('/')
        else:
            template = self.render_template(self.template, **self.template_kwargs)
            self.write(template)
