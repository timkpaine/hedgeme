from .base import ServerHandler


class LogoutHandler(ServerHandler):
    def get(self):
        '''Get the logout page'''
        self.clear_cookie("user")
