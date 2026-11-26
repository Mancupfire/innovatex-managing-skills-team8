# InnovateX | A Management Turnaround Plan

**Team 8 · Managing Skills · VinUniversity** — presentation website (12 slides, target 12 min, max 15 min).

- **Website:** https://mancupfire.github.io/innovatex-managing-skills-team8/ (open one slide directly: [`#slide-09`](https://mancupfire.github.io/innovatex-managing-skills-team8/#slide-09))
- **PDF:** https://mancupfire.github.io/innovatex-managing-skills-team8/InnovateX-Team8-Managing-Skills.pdf (rebuilt on every push to `main`)

InnovateX is a fictional organisation. The team plays its new management and asks senior leadership to approve a measurable improvement plan. The website is what we present in class. The PDF exported from it is what we submit. This repository is where the team keeps updating it.

> **Status: DRAFT** — 2 of 12 slides are final (09–10). The PDF carries a *Draft* stamp until every slide is final.
> Call the PDF **submission-ready** only when `python3 scripts/build_pdf.py --require-final` passes.

| # | Slide | Owner | File to edit | Status |
|---|---|---|---|---|
| 01 | Company and Management Challenge (opening slide) | Nhung | [`content/slides/01-company-and-management-challenge.js`](content/slides/01-company-and-management-challenge.js) | Awaiting Nhung’s content |
| 02 | Purpose-Driven Leadership | Nhung | [`content/slides/02-purpose-driven-leadership.js`](content/slides/02-purpose-driven-leadership.js) | Awaiting Nhung’s content |
| 03 | Emotional Intelligence | Harry | [`content/slides/03-emotional-intelligence.js`](content/slides/03-emotional-intelligence.js) | Awaiting Harry’s content |
| 04 | Employee Motivation | Harry | [`content/slides/04-employee-motivation.js`](content/slides/04-employee-motivation.js) | Awaiting Harry’s content |
| 05 | Psychological Safety | Dương | [`content/slides/05-psychological-safety.js`](content/slides/05-psychological-safety.js) | Awaiting Dương’s content |
| 06 | Communication and Storytelling | Dương | [`content/slides/06-communication-and-storytelling.js`](content/slides/06-communication-and-storytelling.js) | Awaiting Dương’s content |
| 07 | Cross-Cultural Leadership and Inclusion | HLinh | [`content/slides/07-cross-cultural-leadership-and-inclusion.js`](content/slides/07-cross-cultural-leadership-and-inclusion.js) | Awaiting HLinh’s content |
| 08 | Hybrid and AI Leadership | HLinh | [`content/slides/08-hybrid-and-ai-leadership.js`](content/slides/08-hybrid-and-ai-leadership.js) | Awaiting HLinh’s content |
| 09 | Innovation and Change | Nhật Minh | [`content/slides/09-innovation-and-change.js`](content/slides/09-innovation-and-change.js) | Final |
| 10 | Management Action Plan | Nhật Minh | [`content/slides/10-management-action-plan.js`](content/slides/10-management-action-plan.js) | Final |
| 11 | Performance Measurement | Thảo Linh | [`content/slides/11-performance-measurement.js`](content/slides/11-performance-measurement.js) | Awaiting Thảo Linh’s content |
| 12 | Final Recommendations | Thảo Linh | [`content/slides/12-final-recommendations.js`](content/slides/12-final-recommendations.js) | Awaiting Thảo Linh’s content |

**Repo owner:** invite the GitHub user `thaithaolinhcelestrya-wq` (Thảo Linh) via **Settings → Collaborators → Add people** so they can edit slides 11–12.

## Run it locally

No install or build step. Either double-click `index.html`, or (needed for the *Download PDF* button) serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000/   ·   a single slide: http://localhost:8000/#slide-09
```

Keys: **← / →** (or PageUp/PageDown, clicker) previous/next · **Home / End** first/last · **F** full screen · **N** speaker notes · **T** contents · **P** print.
When a button on a slide (e.g. *Follow one idea*) has focus, arrow keys don't change slide. Press **Esc** to hand the keys back.

Presenting: open the site on the laptop, press **F**. Notes (**N**) only show outside full screen and never print. To rehearse one part, open **Contents** or use its link, e.g. `#slide-11`.

## Edit a slide or its speaker notes

Each slide is **one file** in `content/slides/`. You never need to touch `assets/`. Change only the text between quotes `"…"` or backticks `` `…` `` and keep commas, brackets and braces.

| Field | What it is |
|---|---|
| `status` | `"awaiting"` while content is missing, `"final"` once the team has approved it. The deck and PDF say *Draft* until all 12 are `"final"`. |
| `title` | Headline: one sentence that states the slide’s main message. |
| `lead` | Optional one-line takeaway under the title (`""` for none). |
| `blocks` | The slide body (see below). While it is empty and `status` is `"awaiting"`, the slide shows an “Awaiting …’s content” box. |
| `sources` | `{ text: "Author (Year). Title…", url: "https://…" }`. Shown in the slide footer. |
| `footnote` | Small italic line in the footer, e.g. assumptions. |
| `notes` | Speaker notes in English between backticks. A blank line starts a new paragraph. The notes panel shows the word count and estimated time. |

### Slide content blocks

Copy any of these into `blocks: [ … ]`, separated by commas. `**text**` makes text bold.

```js
// 2–4 cards side by side (slide 9 uses this)
{ type: "cards", numbered: true, items: [
  { heading: "First idea",  points: ["Short point", "Short point"] },
  { heading: "Second idea", text: "One short sentence." }
] },

// Bullet list
{ type: "bullets", heading: "Optional heading", items: ["Point one", "Point two"] },

// Highlighted one-line message
{ type: "callout", label: "Key message", text: "what we want leadership to remember." },

// Paragraph
{ type: "text", text: "A short paragraph." },

// Table (slide 10 uses this)
{ type: "table", columns: ["KPI", "Baseline", "Target", "Owner"],
  rows: [["Return rate", "20%", "16%", "Support lead"]] },

// Decision rule with labelled options
{ type: "decision", label: "Decision rule", tag: "Proposed targets", options: [
  { verdict: "Expand", symbol: "▲", text: "if …" },
  { verdict: "Stop",   symbol: "■", text: "if …" }
] }
```

If a file has a typo, the website shows a *“This slide’s file has an error”* slide that names the file and line, and the GitHub Actions check fails with the same message.

## Give one member one slide (GitHub web, no coding)

1. The repo owner invites them (**Settings → Collaborators → Add people**).
2. Send them the link to their file from the table above.
3. They click the **pencil (Edit this file)**, change the text, then click **Commit changes…**. For review first, choose *Create a new branch and start a pull request*.
4. Open the **Actions** tab. A green check means the slide files load and the PDF was rebuilt. A red cross means there is a typo; the log names the file and line.

## Export the PDF

Needs Python 3 and Google Chrome or Chromium (`--chrome PATH` if it is not found automatically):

```bash
python3 scripts/build_pdf.py                  # → InnovateX-Team8-Managing-Skills.pdf (one 16:9 page per slide)
python3 scripts/build_pdf.py --require-final  # fails unless all 12 slides are "final"
```

It renders the same website files with the print stylesheet. Navigation, notes and buttons are hidden, and the slide 9 example prints as a static line. It then checks that the PDF has exactly 12 pages. *Print / Save as PDF* in the browser uses the same print layout (choose *Landscape*, margins *None*, and enable *Background graphics*).

## Deploy

`.github/workflows/pages.yml` runs on every push to `main`:

- **Always:** checks the slide files, exports the PDF, and attaches it to the run as the **`slides-pdf`** artifact (Actions → latest run → Artifacts).
- **When Pages is on:** publishes the site and the fresh PDF to GitHub Pages, so the website’s *Download PDF* always matches the slides. All paths are relative, so it works under `https://<user>.github.io/<repo>/` and on deep links like `…/#slide-09`. Fonts are self-hosted and there are no CDNs.

GitHub Pages is **on** (Settings → Pages → Source: *GitHub Actions*; repository variable `PAGES_ENABLED=true`). After a commit to `main`, the site and PDF update in about 1–2 minutes. To redeploy without a change: **Actions → Build PDF and deploy to GitHub Pages → Run workflow**, or

```bash
gh workflow run pages.yml --repo Mancupfire/innovatex-managing-skills-team8
```

To pause deploying (e.g. if the repo goes private again on a plan without Pages), set `PAGES_ENABLED` to `false`. The PDF artifact keeps being built.

## Files

```
index.html                 page shell
content/deck.js            deck title, subtitle, and the list of slide files in order
content/slides/NN-*.js     one file per slide: text, sources, notes, status
assets/css/deck.css        layout, 16:9 canvas, mobile and print styles
assets/js/deck.js          rendering, navigation, notes, contents, example dialog
assets/fonts/              Inter (SIL Open Font License, see Inter-LICENSE.txt)
scripts/build_pdf.py       PDF export and checks
```
