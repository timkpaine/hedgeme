import json
import numpy as np
from functools import lru_cache

from .studies.peer_correlation import peerCorrelation


class Metrics(object):
    def __init__(self, cache):
        self._cache = cache

    @lru_cache(1)
    def peerCorrelation(self, target):
        return peerCorrelation(self._cache, target)

    def fetch(self, target, type):
        if type in ('PEERCORRELATION', 'all'):
            return json.dumps({'PEERCORRELATION': self.peerCorrelation(target).replace({np.nan: None}).reset_index().to_dict(orient='records')})
