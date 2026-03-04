# perplexity-subtitles — Springer LNCS Subtitles

## Purpose
Generates Springer LNCS-compliant section headings, abstract, and keywords from repository analysis JSON.

## Pipeline Position
**Parallel agent** — runs alongside `gemini-results` and `chatgpt-style` after `claude-repo-analyzer` completes.

## Input
Receives the structured JSON from `claude-repo-analyzer`.

## Output — LNCS Section Structure
```json
{
  "title": "A Novel Approach to Named Entity Recognition Using Transformer Architectures",
  "authors": [
    { "name": "Author Name", "affiliation": "University", "email": "author@uni.edu" }
  ],
  "abstract": "We present a novel approach to... (150-250 words, LNCS limit)",
  "keywords": ["named entity recognition", "transformer", "deep learning"],
  "sections": [
    {
      "number": "1",
      "title": "Introduction",
      "level": 1,
      "latex": "\\section{Introduction}",
      "content_brief": "Motivation, problem statement, contributions"
    },
    {
      "number": "2",
      "title": "Related Work",
      "level": 1,
      "latex": "\\section{Related Work}",
      "subsections": [
        {
          "number": "2.1",
          "title": "Transformer-Based NER",
          "level": 2,
          "latex": "\\subsection{Transformer-Based NER}"
        }
      ]
    },
    {
      "number": "3",
      "title": "Methodology",
      "level": 1,
      "latex": "\\section{Methodology}"
    },
    {
      "number": "4",
      "title": "Experimental Results",
      "level": 1,
      "latex": "\\section{Experimental Results}"
    },
    {
      "number": "5",
      "title": "Discussion",
      "level": 1,
      "latex": "\\section{Discussion}"
    },
    {
      "number": "6",
      "title": "Conclusion",
      "level": 1,
      "latex": "\\section{Conclusion}"
    }
  ],
  "references_format": "splncs04"
}
```

## LNCS Rules Enforced
- Title: max 12 words, title case
- Abstract: 150–250 words
- Keywords: 3–6 terms, lowercase
- Section numbering: Arabic numerals
- Max 3 levels of subsections
- Reference style: `splncs04.bst`

## API
- **Provider**: Perplexity
- **Model**: `pplx-70b-online`
- **Endpoint**: POST `/webhook/perplexity-subtitles/generate`

## Tests
- `tests/unit/agents/perplexity-subtitles.test.ts`
- Validates: LNCS compliance, word count limits, section structure, keyword count
