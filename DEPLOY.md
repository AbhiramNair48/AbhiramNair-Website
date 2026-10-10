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

## First: getting SSH to work at all

If `ssh abhiram@linux.cs.utexas.edu` fails with **`Permission denied (publickey)`**,
nothing is wrong with your password — the server never asked for it. Since
12 April 2019 UTCS has disabled SSH password authentication for connections
coming from outside their networks, so the server accepts *keys only*. See
<https://www.cs.utexas.edu/facilities/documentation/ssh-keys>.

You can confirm that is what's happening:

```bash
ssh -v abhiram@linux.cs.utexas.edu 2>&1 | grep -i "authentications that can continue"
```

If it prints only `publickey`, the server is refusing passwords. If it also lists
`password`, the problem is something else.

### The catch

Registering a key requires logging in, and password login only works from
*inside* UT's networks. So you have to get inside once, by any of:

- **UT campus Wi-Fi** — simplest if you're on campus
- **UT VPN** — simplest from home
  (<https://wikis.utexas.edu/display/cnsoitpublic/Connecting+to+the+UT+VPN>)
- **A physical CS lab machine**

### Set up the key

Run step 1 on your own computer. For step 2 you must be on campus Wi-Fi or the
UT VPN.

```bash
# 1. Create a key pair. Choose a passphrase — not your CS password.
ssh-keygen -t rsa -b 4096

# 2. Now on campus Wi-Fi or UT VPN, register the public key.
#    macOS / Linux:
ssh-copy-id abhiram@linux.cs.utexas.edu

#    Windows (cmd), or if ssh-copy-id is unavailable:
type .ssh\id_rsa.pub | ssh abhiram@linux.cs.utexas.edu "umask 0077 && mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

It will prompt for your CS password this one time. Afterwards `ssh` and `scp`
work from anywhere, no VPN needed. Registering the key on
`linux.cs.utexas.edu` propagates it to every machine on the CS network.

Only `id_rsa.pub` — the `.pub` file — ever leaves your machine. Never send
anyone `id_rsa`, the file without the extension.

> **Shortcut:** if you only want the site live right now and you're already on
> campus Wi-Fi or the VPN, skip the key entirely. Password authentication works
> from inside, so go straight to Option A or B below.

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

# 4. The Think Faire page lives in its own subdirectory
mkdir -p ~/public_html/thinklab
cp site/thinklab/index.html ~/public_html/thinklab/
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

# -r recurses, so this creates ~/public_html/thinklab/ with index.html inside
scp -r site/thinklab abhiram@linux.cs.utexas.edu:~/public_html/
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

# The thinklab subdirectory needs the same treatment: searchable directory,
# readable file. A directory must be o+x or the server cannot descend into it,
# even when the file inside it is world-readable.
chmod 755 ~/public_html/thinklab
chmod 644 ~/public_html/thinklab/index.html
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
drwxr-xr-x   thinklab              <- the subdirectory, searchable by others
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
curl -I https://www.cs.utexas.edu/~abhiram/thinklab/
curl -I https://www.cs.utexas.edu/~abhiram/thinklab/index.html
```

All three should answer `200`. The last two must return the *same* page — compare
them byte for byte:

```bash
diff <(curl -s https://www.cs.utexas.edu/~abhiram/thinklab/) \
     <(curl -s https://www.cs.utexas.edu/~abhiram/thinklab/index.html) \
  && echo "identical"
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
| `/thinklab/` gives 403 but `/thinklab/index.html` works | Directory missing `o+x` | `chmod 755 ~/public_html/thinklab` |
| `/thinklab/` lists files instead of showing the page | `index.html` missing or misnamed in that directory | Check `ls ~/public_html/thinklab` |

A link to your homepage is also added automatically to your UNIX group's master
page by a nightly batch job. That's cosmetic — your page is reachable as soon as
the permissions are right, without waiting for it.

---

## How a file's location becomes its URL

This is the part worth actually understanding, and it's the whole point of
putting the second page in a subdirectory.

```
     /u/abhiram/public_html/thinklab/index.html      <- where the file sits
     |________| |_________| |______| |________|
          |          |          |         |
          v          v          v         v
https://www.cs.utexas.edu/~abhiram/thinklab/         <- how the world asks for it
```

**Why `public_html` never appears in the URL.** Apache's UserDir module is
configured so that a leading `~username` in a path means "serve from that user's
`public_html`". So `/~abhiram/` *is* `/u/abhiram/public_html/`. It acts as the
document root for your personal web space, and a document root is never itself
part of a URL — it's the thing paths are measured *from*. That's also a security
boundary: because the mapping starts at `public_html`, there is no URL that
reaches your home directory above it.

Everything after that prefix is appended to the directory path literally, which
is why creating a directory called `thinklab` is all it takes to create the URL
`/~abhiram/thinklab/`. The filesystem layout *is* the URL layout.

**Why `/thinklab/` and `/thinklab/index.html` show the same page.** When a URL
names a directory rather than a file, Apache has to decide what to send. Rather
than listing the directory's contents, it looks for a DirectoryIndex file — by
default `index.html` — and serves that. So `/thinklab/` resolves to
`/thinklab/index.html`. The second URL just names that same file explicitly.
One file on disk, two routes to it, byte-identical responses.

(Asking for `/thinklab` with no trailing slash gets you a `301` redirect to
`/thinklab/` first, so that relative links inside the page resolve against the
right directory.)

**Why two files called `index.html` don't collide.** Filenames only have to be
unique *within* a directory. `~/public_html/index.html` and
`~/public_html/thinklab/index.html` are two different paths, so they are two
different files that happen to share a basename — exactly like having a
`README.md` in several folders of a project. Each is the DirectoryIndex for the
directory that contains it, so each is the default page of its own level:
the first answers `/~abhiram/`, the second answers `/~abhiram/thinklab/`.

**One consequence worth noting.** Because `thinklab/index.html` sits one level
deeper, its links to shared files need `../` in front: `../style.css`,
`../index.html`. A relative URL is resolved against the directory of the page
it appears in, not against the site root.

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
