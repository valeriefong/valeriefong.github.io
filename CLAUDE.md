# Notes for Claude

Valerie's personal site. Read README.md for the file layout.

- Static HTML/CSS/JS, served by GitHub Pages from `master`. There's no build step, and `.nojekyll` is set.
- Don't add attribution lines to commits or PRs (see `.claude/settings.json`). Commit as Valerie Fong <valmarie222@gmail.com>.
- Make changes on a branch and show her the preview. Merge to `master` only when she says to publish.
- Visual system: STIX Two Text throughout, italics only for math variables, colors as CSS variables in `assets/site.css` with a dark-mode set. Keep it quiet and typographic.
- Live figures in `assets/js/viz.js` must be numerically honest. Captions say exactly what is computed, and nothing claims a result she doesn't have yet. Her own figures are working drafts.
- Ongoing goal: replace the generic demos on the Research page with ones driven by her own code (the `rnn-lyapunov` repo, which is private), e.g. random vs dynamically critical connectivity.
- Resume source: `resume/resume.html` produces `files/Valerie_Fong_Resume.pdf` (one page). `cv.html` is the long form, so keep the two consistent.
