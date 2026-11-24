# Compliance Renewal Tracker — Overleaf report

Upload `compliance-renewal-tracker-overleaf.zip` as a new Overleaf project, set the main document to `main.tex`, and select **pdfLaTeX**. Overleaf's normal build runs BibTeX automatically. All LaTeX input and asset paths are relative. No shell escape, external diagram renderer, or custom fonts are needed.

Replace the clearly marked names, roll numbers, group and guide in `metadata.tex` before submission. Four student rows follow the supplied template; adjust the rows to the actual group. The evaluation label remains “Mid-Semester Evaluation” as in the supplied PDF. A date macro is available but the PDF title page has no date field.

## Template fidelity

The supplied input was `TIET_Report_Template.pdf`, not an editable `.tex`/`.cls` archive. It contains 13 US Letter pages, Computer Modern text at approximately 12 pt, mirrored 1.5 in inner / 1 in outer margins, right-aligned chapter headings with a rule, running course/page headers, and chapters opening on odd pages. This report reconstructs those visible settings. Exact original class/package internals cannot be recovered from a PDF.

The four chapters, numbered section/subsection arrangement, title-page fields, Contents and Bibliography are retained. The abstract is an unnumbered opening paragraph in Chapter 1, avoiding a new front-matter chapter. The supplied PDF has no university logo, declaration, certificate or acknowledgement page; none has been invented. Blank verso pages are retained where the two-sided chapter-opening style produces them. Figure/table numbering and Contents page numbers are generated automatically.

## Contents

- `main.tex`, `metadata.tex`: main document and submission details.
- `chapters/`: complete report content in the template's four chapters.
- `diagrams/`: nine editable TikZ figure sources, used directly at compile time.
- `references.bib`: bibliography with local source evidence and official documentation.
- `compliance-renewal-tracker-report.pdf`: compiled and visually checked report.
- `qa/`: local evidence, compile log and visual checks; excluded from the Overleaf ZIP.

The diagrams cover architecture, module interactions, use cases, activity/workflow, ER/schema, a conceptual UML domain class model, DFD, renewal sequence/API flow and the reminder algorithm. A machine-learning pipeline is omitted because the project has no ML implementation. The class diagram models stored domain concepts; the JavaScript implementation uses functions rather than class constructors.

No interface screenshots were fabricated. Native browser capture stopped because its tool could not establish the active Chrome URL. The report includes real test/build results and source-derived diagrams instead.

## Local reproduction

With a standard TeX Live or MiKTeX installation:

```text
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Or use `latexmk -pdf main.tex`. The delivered PDF was compiled with portable Tectonic 0.15.0; see `qa/verification.txt` for the final status and compiler notes.

Project inspection covered the README, package manifests and lockfiles, React pages/components/context/API client/styles, Express routes/controllers/middleware, runtime SQLite schema, alternative PostgreSQL schema, migration and seed scripts, reminder service/daemon, Compose file, launch scripts and existing tests. The older report in `docs/` was read as background; unsupported claims from it were not repeated.

All runtime verification used an isolated copy under the report directory and a separate database. Existing project source was not edited. The downloadable ZIP contains only report sources, bibliography and required assets, not dependencies, demo data, credentials, or temporary compiler tools.
