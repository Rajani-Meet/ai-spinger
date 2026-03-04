# chatgpt-style — 97% Voice Clone

## Purpose
Rewrites generated academic content to match the original author's writing style with 97% similarity, ensuring consistent academic tone throughout the paper.

## Pipeline Position
**Parallel agent** — runs alongside `perplexity-subtitles` and `gemini-results` after `claude-repo-analyzer` completes.

## Input
Receives:
1. The structured JSON from `claude-repo-analyzer` (especially `readme.raw` for style reference)
2. Draft content sections from other agents to rewrite

## Output — Style-Matched Content
```json
{
  "style_profile": {
    "formality_level": 0.85,
    "avg_sentence_length": 22.4,
    "passive_voice_ratio": 0.35,
    "technical_density": 0.72,
    "common_phrases": [
      "we propose",
      "experimental results demonstrate",
      "state-of-the-art"
    ],
    "vocabulary_complexity": "advanced",
    "similarity_score": 0.97
  },
  "rewritten_sections": {
    "introduction": "We propose a novel approach to named entity recognition...",
    "methodology": "Our architecture builds upon the transformer framework...",
    "results": "Experimental results demonstrate that our approach achieves...",
    "discussion": "The observed improvements can be attributed to...",
    "conclusion": "In this paper, we presented a novel approach..."
  },
  "consistency_check": {
    "tense_consistency": true,
    "person_consistency": true,
    "terminology_consistent": true,
    "overall_score": 0.97
  }
}
```

## Style Rules Enforced
- Match author's sentence length distribution
- Maintain passive/active voice ratio from README
- Use consistent technical terminology
- Academic tone: no casual language, contractions, or first-person singular
- "We" for plural first person (standard academic)
- Target: ≥97% cosine similarity with author's style embedding

## API
- **Provider**: OpenAI
- **Model**: `gpt-4-turbo-preview`
- **Endpoint**: POST `/webhook/chatgpt-style/rewrite`

## Tests
- `tests/unit/agents/chatgpt-style.test.ts`
- Validates: similarity score ≥ 0.97, tone consistency, no casual language, tense agreement
