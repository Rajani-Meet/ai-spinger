# antigravity-latex — LNCS LaTeX Compiler

## Purpose
Assembles all agent outputs into a complete Springer LNCS LaTeX document using `llncs.cls` with 2.5cm margins, then compiles to PDF.

## Pipeline Position
**Final agent** — receives merged outputs from all 4 upstream agents, produces the finished PDF.

## Input
Merged JSON from all agents:
1. `claude-repo-analyzer` → repo metadata
2. `perplexity-subtitles` → section structure, abstract, keywords
3. `gemini-results` → LaTeX tables and figures
4. `chatgpt-style` → style-matched section content

## Output — Complete LaTeX + PDF
```json
{
  "latex_document": "\\documentclass[runningheads]{llncs}\n\\usepackage{graphicx}...",
  "pdf_url": "/output/paper.pdf",
  "compilation": {
    "success": true,
    "engine": "pdflatex",
    "passes": 3,
    "warnings": ["Overfull \\hbox (2.3pt too wide)"],
    "errors": [],
    "page_count": 12
  },
  "lncs_compliance": {
    "margins": { "top": "2.5cm", "bottom": "2.5cm", "left": "2.5cm", "right": "2.5cm" },
    "font": "Computer Modern, 10pt",
    "page_limit": "12-15 pages",
    "references_style": "splncs04",
    "compliant": true
  }
}
```

## LaTeX Template Structure
```latex
\documentclass[runningheads]{llncs}
\usepackage[T1]{fontenc}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{booktabs}
\usepackage[hidelinks]{hyperref}

\begin{document}

\title{<from perplexity-subtitles>}
\author{<from claude-repo-analyzer>}
\institute{<from claude-repo-analyzer>}
\maketitle

\begin{abstract}
<from perplexity-subtitles, rewritten by chatgpt-style>
\end{abstract}
\keywords{<from perplexity-subtitles>}

\section{Introduction}
<from chatgpt-style>

\section{Related Work}
<from chatgpt-style>

\section{Methodology}
<from chatgpt-style>

\section{Experimental Results}
<from chatgpt-style + gemini-results tables>

\section{Discussion}
<from chatgpt-style>

\section{Conclusion}
<from chatgpt-style>

\bibliographystyle{splncs04}
\bibliography{references}

\end{document}
```

## LNCS Rules Enforced
- Document class: `llncs` with `runningheads` option
- Margins: exactly 2.5cm all sides
- Font: Computer Modern, 10pt base
- Page limit: 12–15 pages
- Reference style: `splncs04.bst`
- No page numbers (LNCS adds them)
- Figures/tables within text column width

## API
- **Provider**: Google Gemini / Antigravity
- **Model**: `gemini-pro`
- **Endpoint**: POST `/webhook/antigravity-latex/compile`

## Tests
- `tests/unit/agents/antigravity-latex.test.ts`
- Validates: LaTeX syntax, margin compliance, page count, PDF generation, LNCS class usage
