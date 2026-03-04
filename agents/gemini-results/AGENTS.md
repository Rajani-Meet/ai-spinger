# gemini-results — LaTeX Results Tables

## Purpose
Extracts benchmark results from repository data and produces publication-ready LaTeX tables with metrics like F1=92.3%, accuracy, precision, recall.

## Pipeline Position
**Parallel agent** — runs alongside `perplexity-subtitles` and `chatgpt-style` after `claude-repo-analyzer` completes.

## Input
Receives the structured JSON from `claude-repo-analyzer`, specifically `metrics.reported_results`.

## Output — LaTeX Tables
```json
{
  "tables": [
    {
      "id": "tab:main-results",
      "caption": "Main experimental results on CoNLL-2003 dataset",
      "label": "tab:main-results",
      "latex": "\\begin{table}[t]\n\\caption{Main experimental results on CoNLL-2003 dataset}\n\\label{tab:main-results}\n\\centering\n\\begin{tabular}{lccc}\n\\hline\n\\textbf{Model} & \\textbf{Precision} & \\textbf{Recall} & \\textbf{F1} \\\\\n\\hline\nBaseline (BiLSTM-CRF) & 88.7 & 87.2 & 87.9 \\\\\nBERT-base & 91.1 & 90.8 & 90.9 \\\\\n\\textbf{Ours} & \\textbf{93.1} & \\textbf{91.5} & \\textbf{92.3} \\\\\n\\hline\n\\end{tabular}\n\\end{table}"
    },
    {
      "id": "tab:ablation",
      "caption": "Ablation study results",
      "label": "tab:ablation",
      "latex": "..."
    }
  ],
  "figures": [
    {
      "id": "fig:training-curve",
      "caption": "Training loss over epochs",
      "label": "fig:training-curve",
      "latex": "\\begin{figure}[t]\n\\centering\n\\includegraphics[width=0.8\\linewidth]{figures/training_curve.pdf}\n\\caption{Training loss over epochs}\n\\label{fig:training-curve}\n\\end{figure}"
    }
  ],
  "inline_metrics": {
    "best_f1": "92.3\\%",
    "improvement": "+1.4\\%",
    "p_value": "$p < 0.01$"
  }
}
```

## LaTeX Rules Enforced
- Tables use `\begin{table}[t]` placement
- Bold for best results (`\textbf`)
- Proper `\label` and `\caption`
- LNCS-compatible formatting
- No color in tables (Springer requirement)
- 3-line table style (hline top, header, bottom)

## API
- **Provider**: Google Gemini
- **Model**: `gemini-pro`
- **Endpoint**: POST `/webhook/gemini-results/generate`

## Tests
- `tests/unit/agents/gemini-results.test.ts`
- Validates: LaTeX compilation, table structure, metric formatting, label uniqueness
