# AbhiramNair-Website

Personal homepage for Abhiram Nair, hosted from a UTCS account at
**https://www.cs.utexas.edu/~abhiram/**

## Contents

```
site/
├── index.html      Home — name, bio, academic goals, selected successes
├── about.html      Longer biography, academic record, skills, activities
├── projects.html   Selected software and embedded systems projects
├── resume.html     Education, skills, experience, awards, leadership
├── style.css       Shared stylesheet
├── main.js         Light/dark toggle and runtime email assembly
└── thinklab/
    └── index.html  Think Faire topic (Robotics) and three presentation proposals
```

`thinklab/` is deployed as a subdirectory of `public_html`, so it is served at
`/~abhiram/thinklab/`. Its page reaches the shared stylesheet and script with
`../`, since relative URLs resolve against the directory of the page that
contains them. See [DEPLOY.md](DEPLOY.md#how-a-files-location-becomes-its-url)
for how a path on disk turns into a URL.

Plain HTML, CSS, and a little vanilla JavaScript. No build step, no frameworks,
no CDN requests — every asset is served from `public_html`, so the pages work on
a cold cache and behind a restrictive network.

## Notes on the implementation

- **Responsive** down to 320px, with a sticky header whose navigation wraps
  rather than collapsing behind a menu button.
- **Light and dark themes.** Follows the operating system by default; the header
  toggle overrides it and remembers the choice in `localStorage`. Every access
  to storage is wrapped in `try`/`catch`, so private browsing can't break it.
- **Works without JavaScript.** The email address degrades to readable plain
  text and the theme toggle hides itself instead of leaving a dead button.
- **Email is assembled at runtime** from `data-` attributes rather than sitting
  in the HTML source, which defeats the simplest address scrapers.
- **Accessibility:** semantic landmarks, a skip link, `aria-current` on the
  active nav item, visible focus rings, and a `prefers-reduced-motion` guard.

## Deploying

See [DEPLOY.md](DEPLOY.md) for the upload and `chmod` steps.

## Local preview

```bash
cd site && python3 -m http.server 8000
# then open http://localhost:8000
```
