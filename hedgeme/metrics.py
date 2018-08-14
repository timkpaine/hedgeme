import json
import numpy as np
import pandas as pd


class Metrics(object):
    def __init__(self, cache):
        self._cache = cache

    def peerCorrelation(self, target):
        target = target.upper()

        # grab peers
        peers = self._cache.fetchDF(target, 'peers').xs('peers').index.values.tolist()

        # assemble dict
        to_merge = {x: self._cache.fetchDF(x, 'chart').xs('chart') for x in peers}

        # mixin target
        to_merge.update({target: self._cache.fetchDF(target, 'chart').xs('chart')})

        # make multiindex
        rets = pd.concat(to_merge)

        rets = rets.unstack(0)['changePercent'][[target] + peers]
        rets = rets.corr()
        rets['symbol'] = rets.index
        return rets.corr()

    def fetch(self, target, type):
        if type in ('peerCorrelation', 'all'):
            return json.dumps({'peerCorrelation': self.peerCorrelation(target).replace({np.nan: None}).to_dict(orient='records')})
