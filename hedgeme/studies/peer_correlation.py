import pandas as pd


def peerCorrelation(cache, target):
    target = target.upper()

    # grab peers
    peers = cache.fetchDF(target, 'peers').xs('peers').index.values.tolist()

    # assemble dict
    to_merge = {x: cache.fetchDF(x, 'chart').xs('chart') for x in peers}

    # mixin target
    to_merge.update({target: cache.fetchDF(target, 'chart').xs('chart')})

    # make multiindex
    rets = pd.concat(to_merge)

    all = sorted(peers + [target])
    rets = rets.unstack(0)['changePercent'][all]
    rets = rets.corr()
    rets['symbol'] = rets.index
    return rets.corr()
