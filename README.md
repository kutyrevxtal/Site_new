# Anton Kutyrev website

This is a static, multi-page academic and personal website. It does not need a
build step.

## Main pages

- `index.html` - homepage and short overview
- `research.html` - research index
- `platinum-group-minerals.html` - completed research narrative
- `early-earth-isotopes.html` - completed research narrative
- `publications.html` - published work, work under review, and datasets
- `cv.html` - web CV and CV download links
- `talks.html` - recordings and talk list
- `photography.html` - photography album index
- `petrography.html` - thin-section viewer
- `hobbies.html` - painting and skydiving index

The `layered-intrusions.html`, `chromitites.html`, and `arc-magmas.html` research
pages are intentionally marked as unfinished and excluded from search-engine
indexing until their content is ready.

## Shared files

- `styles.css` - layout, typography, responsive rules, and theme styles
- `script.js` - shared header, mobile menu, theme control, footer, and lightbox
- `assets/images/` - photographs, research figures, and image previews
- `robots.txt` and `sitemap.xml` - search-engine guidance
- `CNAME` - custom domain used by GitHub Pages

## Local preview

From this folder, run:

```text
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/index.html`.
