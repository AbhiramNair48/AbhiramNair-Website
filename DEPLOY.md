# Deploying to the UTCS web server

Target URL: **https://www.cs.utexas.edu/~abhiram/**

Everything that needs to be published lives in the `site/` directory of this
repository: `index.html`, `about.html`, `projects.html`, `resume.html`,
`style.css`, `main.js`. There are no build steps and no external dependencies —
the files are served exactly as they are.

> **About your password:** you type it yourself, directly into your own
> terminal, when `ssh` or `scp` prompts for it. Never paste it into a chat,
> a file, or a command. UTCS may also prompt for Duo two-factor.

---

## Option A — clone straight onto the UTCS machine (recommended)

Fewest moving parts: the files never touch your laptop.

```bash
# 1. Log in to a UTCS Linux machine
ssh abhiram@linux.cs.utexas.edu

# 2. Clone this repository into a working directory (not public_html)
cd ~
git clone https://github.com/AbhiramNair48/AbhiramNair-Website.git
cd AbhiramNair-Website
git checkout claude/charming-heisenberg-fker60

# 3. Copy the site into your public web directory
cp site/index.html site/about.html site/projects.html \
   site/resume.html site/style.css site/main.js ~/public_html/
```

To publish updates later, just `git pull` and re-run the `cp`.

## Option B — copy from your own computer

Use this if you'd rather edit locally. Run these on *your* machine, not on the
UTCS server.

```bash
git clone https://github.com/AbhiramNair48/AbhiramNair-Website.git
cd AbhiramNair-Website
git checkout claude/charming-heisenberg-fker60

scp site/index.html site/about.html site/projects.html \
    site/resume.html site/style.css site/main.js \
    abhiram@linux.cs.utexas.edu:~/public_html/
```

---

## Set the permissions

This is the step that actually decides whether strangers can read the page, and
it's the one the assignment is really testing. Run it on the UTCS machine.

```bash
ssh abhiram@linux.cs.utexas.edu     # if you aren't already logged in

# Your home directory must be world-SEARCHABLE so the server can traverse into
# it. o+x alone does this without making your home directory world-readable,
# so nobody can list what else is in it.
chmod o+x /u/abhiram

# public_html must be both readable and searchable.
chmod 755 ~/public_html

# Every published file must be world-readable.
chmod 644 ~/public_html/*.html ~/public_html/*.css ~/public_html/*.js
```

Confirm it looks right:

```bash
ls -ld /u/abhiram ~/public_html
ls -l  ~/public_html
```

You want to see:

```
drwx--x--x   /u/abhiram            <- owner full, others execute only
drwxr-xr-x   /u/abhiram/public_html
-rw-r--r--   index.html  about.html  projects.html  resume.html  style.css  main.js
```

The leading `d` marks a directory; the three permission triples are owner,
group, and other. What matters is that the **other** triple ends in `x` for the
two directories and contains `r` for every file.

---

## Verify from outside

Checking from a logged-in UTCS machine can succeed even when the permissions are
wrong, so test the way a stranger would:

```bash
curl -I https://www.cs.utexas.edu/~abhiram/
```

`HTTP/1.1 200 OK` (or `HTTP/2 200`) means you're live. Then open the URL on your
phone **with Wi-Fi turned off**, so the request comes from off-campus over
cellular. Click through all four pages and confirm the styling loads.

### If something is wrong

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` | A permission bit is missing somewhere on the path | Re-run the three `chmod` commands above; check `/u/abhiram` is `o+x` |
| `404 Not Found` | File isn't where the server looks, or is misnamed | It must be `~/public_html/index.html`, lowercase, `.html` not `.htm` |
| Page loads but unstyled | `style.css` missing or not world-readable | `chmod 644 ~/public_html/style.css` |
| Trailing-slash URL fails | Directory not searchable | `chmod 755 ~/public_html` |

A link to your homepage is also added automatically to your UNIX group's master
page by a nightly batch job. That's cosmetic — your page is reachable as soon as
the permissions are right, without waiting for it.

---

## Adding a photo later

The homepage has a portrait slot ready for one.

1. Copy your photo in: `scp portrait.jpg abhiram@linux.cs.utexas.edu:~/public_html/`
2. `chmod 644 ~/public_html/portrait.jpg`
3. In `index.html`, replace the `<div class="portrait-fallback">` block (there's a
   comment marking it) with:

```html
<img class="portrait" src="portrait.jpg" alt="Portrait of Abhiram Nair" width="176" height="176">
```

A roughly square image around 600×600 is plenty; the CSS crops and scales it.
