# valeriefong.github.io

Personal site of Valerie Fong. Plain HTML, CSS and JavaScript, with no build step. Every push to `master` goes live in about a minute.

## Where things are

| To change | Edit |
| :- | :- |
| About page (intro, the three ideas, toolkit, footer) | `index.html` |
| Research page text and figure captions | `research.html` |
| CV page | `cv.html` |
| Colors, fonts, spacing, layout | `assets/site.css`. The colors are the variables at the top. |
| The live figures | `assets/js/viz.js`, one clearly labeled section per figure |
| Static research figures | `assets/figures/`. Keep the same file names, or update the `src` in `research.html`. |
| Headshot | `assets/headshot-440.webp` and `assets/headshot-800.webp` |
| Link-preview card | `assets/og-card.png` (1200 × 630) |
| Resume PDF | Edit `resume/resume.tex` (LaTeX), then rebuild (below). |

## Editing text

Text sits between tags, for example `<p>like this</p>`. Change the words and leave the tags alone. Math variables are written `<i class="m">g</i>` so they come out italic.

## Previewing before you push

Open any `.html` file in a browser. Everything works locally except the live figures in Safari; Chrome and Firefox are fine. Or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Rebuilding the resume PDF

The source is `resume/resume.tex`. Compile it with pdfLaTeX, either on Overleaf (upload the file, then download the PDF) or locally with `pdflatex resume.tex` from the `resume` folder. Save the PDF over `files/Valerie_Fong_Resume.pdf` so the site links keep working. Keep it to one page. The CV page (`cv.html`) is separate, so update both.
