'''Website figure: how to read a Lyapunov spectrum (research.html, "Reading a Lyapunov spectrum").

One run from the production dataset of the rnn-lyapunov repo: the Random model,
dx/dt = -x + gW tanh(x), N = 1000, g = 5, network seed 0 (the "Strongly chaotic" network of
fig0_chaos_transition). Nothing is recomputed here except the Kaplan-Yorke running sum, which is
checked against the stored D.

    python assets/figures/src/spectrum_reading.py [path/to/rows.csv.gz]

Default input: ~/lyapunov_data/fresh_prod/snapshots/2026-11-15_final/rows.csv.gz
Output: assets/figures/spectrum-reading.svg   (needs numpy, pandas, matplotlib)
'''
import os
import sys

import numpy as np
import pandas as pd
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = os.path.expanduser('~/lyapunov_data/fresh_prod/snapshots/2026-11-15_final/rows.csv.gz')
MODEL, N, G, SEED = 'Random', 1000, 5.0, 0
BLUE, INK, MUTED = '#0047AB', '#18203a', '#5a6377'     # Random blue from rnn-lyapunov style.py; site ink


def load(path):
    df = pd.read_csv(path, usecols=['model', 'N', 'g', 'seed_net', 'block', 'lambda_1', 'H', 'D',
                                    'n_pos', 'spectrum'])
    r = df[(df.model == MODEL) & (df.N == N) & (df.g == G) & (df.seed_net == SEED)
           & (df.block == 'prod')]
    assert len(r) == 1, len(r)
    r = r.iloc[0]
    lam = np.array(r.spectrum.split(), float)
    assert len(lam) == N and np.all(np.diff(lam) <= 0)
    return r, lam


def main(path=SNAP):
    r, lam = load(path)
    S = np.cumsum(lam)                               # running sum of the largest i exponents
    k = int(np.max(np.nonzero(S >= 0)[0])) + 1       # last i with a non-negative sum
    D = k + S[k - 1] / abs(lam[k])                   # Kaplan-Yorke dimension
    H = lam[lam > 0].sum()
    n_pos = int((lam > 0).sum())
    assert abs(D - r.D) < 1e-6 * r.D and abs(H - r.H) < 1e-6 * r.H and n_pos == r.n_pos
    print(f'lambda_1 = {lam[0]:.3f}, n_pos = {n_pos}, H = {H:.2f}, D = {D:.1f}')

    mpl.rcParams.update({
        'font.family': 'STIXGeneral', 'mathtext.fontset': 'stix', 'font.size': 13,
        'axes.labelsize': 14, 'xtick.labelsize': 12, 'ytick.labelsize': 12,
        'axes.spines.top': False, 'axes.spines.right': False, 'axes.linewidth': 0.9,
        'text.color': INK, 'axes.labelcolor': INK, 'axes.edgecolor': INK,
        'xtick.color': INK, 'ytick.color': INK, 'svg.hashsalt': 'vf',
    })
    fig, (a, b) = plt.subplots(1, 2, figsize=(10, 4.1), layout='constrained',
                               gridspec_kw=dict(width_ratios=[1, 1], wspace=0.12))
    i = np.arange(1, N + 1)

    # (a) the whole spectrum
    a.axhline(0, color=MUTED, lw=0.8)
    a.fill_between(i[:n_pos], lam[:n_pos], 0, color=BLUE, alpha=0.28, lw=0)
    a.plot(i, lam, color=BLUE, lw=2)
    a.set_xlim(0, N); a.set_xticks([1, 250, 500, 750, 1000])
    a.set_xlabel(r'exponent index $i$ (largest first)')
    a.set_ylabel(r'Lyapunov exponent $\lambda_i$ (per $\tau$)')
    a.annotate(rf'$\lambda_1 = {lam[0]:.2f}$', xy=(1, lam[0]), xytext=(110, lam[0] + 0.02),
               va='center', arrowprops=dict(arrowstyle='-', color=MUTED, lw=0.8))
    a.annotate(f'{n_pos} positive exponents:\nperturbations grow', xy=(n_pos * 0.55, 0.1),
               xytext=(230, -0.42), va='center',
               arrowprops=dict(arrowstyle='-', color=MUTED, lw=0.8))
    a.text(60, -1.95, f'{N - n_pos} negative exponents:\nperturbations shrink',
           va='center', ha='left')
    a.set_title('All 1000 exponents of one network', loc='left', fontsize=14, pad=10)

    # (b) the first exponents: entropy rate and dimension
    m = 120
    b.axhline(0, color=MUTED, lw=0.8)
    b.fill_between(i[:n_pos], lam[:n_pos], 0, color=BLUE, alpha=0.28, lw=0)
    b.plot(i[:m], lam[:m], color=BLUE, lw=2, label=r'$\lambda_i$')
    b.set_xlim(0, m); b.set_xticks([1, 40, 80, 120])
    b.set_xlabel(r'exponent index $i$')
    b.set_ylabel(r'$\lambda_i$ (per $\tau$)', color=BLUE)
    b.tick_params(axis='y', colors=BLUE)
    b.annotate(rf'shaded area $= H = {H:.1f}$', xy=(13, lam[0] * 0.45), xytext=(56, lam[0] * 0.95),
               va='center', arrowprops=dict(arrowstyle='-', color=MUTED, lw=0.8))
    c = b.twinx()
    c.spines['right'].set_visible(True)
    c.plot(i[:m], S[:m], color=INK, lw=1.6, ls=(0, (5, 2)))
    c.set_ylabel(r'running sum $\lambda_1 + \cdots + \lambda_i$')
    # align the two zeros
    lo, hi = -0.3, lam[0] * 1.08
    b.set_ylim(lo, hi)
    top = S[:m].max() * 1.12
    c.set_ylim(top * lo / hi, top)
    c.plot([D], [0], 'o', color=INK, ms=6, zorder=5, clip_on=False)
    c.annotate('sum returns\nto zero at ' rf'$D = {D:.1f}$', xy=(D, 0), xytext=(116, top * 0.42),
               ha='right', arrowprops=dict(arrowstyle='-', color=MUTED, lw=0.8))
    b.set_title('The first 120, with their running sum', loc='left', fontsize=14, pad=10)

    out = os.path.join(os.path.dirname(HERE), 'spectrum-reading.svg')
    fig.savefig(out, transparent=True, metadata={'Date': None})
    print('wrote', out)


if __name__ == '__main__':
    main(*sys.argv[1:])
