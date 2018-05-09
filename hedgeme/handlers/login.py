import ujson
from .base import ServerHandler
from ..utils.utils import _CLIENT_NOT_REGISTERED, _REGISTER
from ..utils.validate import validate_login_get, validate_login_post


class LoginHandler(ServerHandler):
    def get(self):
        '''Get the login page'''
        self._validate(validate_login_get)

        if self.current_user:
            self.redirect('/api/register')
        else:
            self.redirect('/login')

    def post(self):
        '''Login'''
        self._validate(validate_login_post)
        user = self.get_argument('id', '') or self.current_user.decode('utf-8') or ''
        client = self._login(user)
        ret = self._login_post(client)

        if ret:
            self._writeout(ujson.dumps(ret), _REGISTER, client.id)
        else:
            self._set_401(_CLIENT_NOT_REGISTERED)
