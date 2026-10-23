"""Rebuild files/Valerie_Fong_Resume.pdf from resume/resume.html.

Needs Playwright:  pip install playwright && playwright install chromium
Run from the repo root:  python resume/build_pdf.py

No Python? Open resume/resume.html in Chrome, choose Print, set
Destination to "Save as PDF", Margins to "Default", turn off
"Headers and footers", and save over files/Valerie_Fong_Resume.pdf.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
src = root / "resume" / "resume.html"
out = root / "files" / "Valerie_Fong_Resume.pdf"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(src.as_uri())
    page.wait_for_timeout(500)  # let the fonts load
    page.pdf(path=str(out), format="Letter", prefer_css_page_size=True, print_background=True)
    browser.close()

print(f"Wrote {out}")
