# claude-repo-analyzer — GitHub JSON Parser

## Purpose
Clones a GitHub repository and extracts a structured JSON analysis for downstream agents.

## Pipeline Position
**First agent** in the chain. All other agents depend on its output.

## Input
```json
{
  "github_url": "https://github.com/user/repo",
  "branch": "main"
}
```

## Output — Structured JSON
```json
{
  "repo": {
    "name": "repo-name",
    "owner": "user",
    "description": "...",
    "language": "Python",
    "stars": 142,
    "license": "MIT"
  },
  "structure": {
    "files": ["src/model.py", "src/train.py", ...],
    "directories": ["src/", "data/", "tests/"],
    "total_files": 47,
    "total_lines": 3200
  },
  "readme": {
    "raw": "# Full README content...",
    "sections": ["Introduction", "Installation", "Usage", "Results"],
    "has_badges": true,
    "has_images": true
  },
  "code_analysis": {
    "primary_language": "Python",
    "frameworks": ["PyTorch", "transformers"],
    "dependencies": ["torch==2.1.0", "numpy==1.24.0"],
    "entry_points": ["train.py", "evaluate.py"],
    "test_coverage": "78%"
  },
  "metrics": {
    "reported_results": [
      { "metric": "F1", "value": 92.3, "dataset": "CoNLL-2003" },
      { "metric": "Accuracy", "value": 95.1, "dataset": "GLUE" }
    ],
    "tables_found": 2,
    "figures_found": 3
  }
}
```

## API
- **Provider**: Anthropic Claude
- **Model**: `claude-3-sonnet-20240229`
- **Endpoint**: POST `/webhook/claude-repo-analyzer/analyze`

## Tests
- `tests/unit/agents/claude-repo-analyzer.test.ts`
- Validates: JSON schema output, error handling on invalid URLs, timeout behavior
