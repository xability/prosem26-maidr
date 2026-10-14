# ProSem 2026: MAIDR

**Data (In)sight for All: Multimodal Data Representation**

JooYoung Seo · IS 529 Doctoral ProSem · October 14, 2026

[Open the slides](https://xability.github.io/prosem26-maidr/)

Based on [xability/maidr-quarto-slide](https://github.com/xability/maidr-quarto-slide). GitHub Pages serves the checked-in rendered deck and assets from main. After rendering updates, commit slides.html and slides_files/ together. The ChatGPT demo requires presenter login; the included charts are publicly viewable.

`slides.qmd` is the deck; `quarto render` writes it to `slides.html`.

## Render

The deck is laid out for the package versions pinned in `requirements.txt`, so
give it an environment of its own:

```sh
uv venv --python 3.12
uv pip install -r requirements.txt
```

Then tell Quarto to use it. In PowerShell:

```powershell
$env:QUARTO_PYTHON = ".venv\Scripts\python.exe"
quarto render slides.qmd
```

On macOS or Linux: `QUARTO_PYTHON=.venv/bin/python quarto render slides.qmd`.

## Present

Open `slides.html` in Chrome or Edge: a tactile display is reached through Web
Bluetooth, Web Serial or WebHID, which only Chromium has. The charts can reach
one whether the deck is opened from disk or served, for instance with

```sh
python -m http.server 8000 --bind 127.0.0.1
```

at <http://localhost:8000/slides.html>.

## Charts drawn outside the deck

The deck runs on a Python kernel, so its R charts are drawn ahead of time, and
the AI assistant's chart is kept as the assistant returned it. Both live in
`charts/` as pages of their own, and the deck puts them on its slides.

- `Rscript charts/make_r_charts.R` draws the two R charts. It needs the maidr R
  package, 0.5.0 or later as released on CRAN, and ggplot2. Render the deck
  again after running it.
- `charts/ai-ischool-enrollment.html` is the page Claude Code returned for the
  prompt on "AI: Just Ask for a Plot", and `charts/ai-ischool-enrollment.csv`
  the numbers it found. The slide shows the page's chart, not its data table
  and notes. To make them again, run the prompt again (below).

  Its first chart had a separate bar for the PhD in Library & Information
  Science, with one student. Asked "Does it make sense that PhD Library &
  Information Science has 1 student?", the same session found that the PhD
  was renamed Information Sciences in 2019 (Board of Trustees, November 14,
  2019) and that DAIR still lists one student under the old code. Told "Yes,
  please make that change.", it folded that student into PhD Information
  Sciences (148) and added a note. The two turns took 4 and 3.5 minutes.

  The session drew its chart with the py-maidr this machine's own Python
  loads, a clone of the repository from September 5. The page here was then
  rebuilt with py-maidr 1.27.0 by running the session's own build script,
  `build_chart.py`, on the data it had pulled from DAIR: the chart and its
  numbers are unchanged.

## The live AI demo

The prompt asks for a chart and names where the data lives, nothing more:

```text
Chart this fall's iSchool enrollment by program from dair.illinois.edu
```

On 2026-10-14 a fresh Claude Code session (Opus 5.5, maidr skill installed),
given only that line in an empty folder, took 26 minutes. It found the Tableau
dashboard behind DAIR's Student Enrollment page, read the Fall 2026 table out
of it in a headless browser, drew the chart with py-maidr, and checked it: the
programs add up to DAIR's total of 1,840. That is too long for the slide, so
start it before the talk. In PowerShell:

```powershell
mkdir $HOME\prosem-demo -Force; cd $HOME\prosem-demo
claude --permission-mode acceptEdits --allowedTools "Bash WebFetch WebSearch Skill" --disallowedTools "Artifact ArtifactComments ArtifactData mcp__playwright mcp__chrome-devtools" "Chart this fall's iSchool enrollment by program from dair.illinois.edu"
```

These are the permissions the rehearsal ran with. Without them Claude Code asks
before each of its 30 or so commands. It writes the chart to an HTML file and
names it at the end.
