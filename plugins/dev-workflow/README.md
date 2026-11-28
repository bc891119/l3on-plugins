# dev-workflow

A Claude Code plugin with commit message rules and pre-commit code review triage. Skill content is written in Traditional Chinese.

Commit message 規範與 code review 分級。需求說明見 [repo 首頁](https://github.com/bc891119/l3on-plugins#readme)。

## Install

在 Claude Code 對話中：

```
/plugin marketplace add bc891119/l3on-plugins
/plugin install dev-workflow@l3on-plugins
```

## Skills

| Skill | 用途 |
|---|---|
| `dev-workflow:commit-message` | Conventional Commits 1.0.0 的 type、subject、body、影響範圍、footer 寫法與反例；附寬度檢查腳本 |
| `dev-workflow:review-triage` | `/code-review` 結果的分級（擋提交／不擋／既有問題／不採納）、驗證、修正範圍、再審與最多 3 輪的停止條件；Claude 自動載入，不出現在 `/` 選單 |

## Agents

| Agent | 用途 |
|---|---|
| `dev-workflow:change-reviewer` | 用全新 context 審查存成檔案的 diff，對照計畫或已判定清單，只回報會造成實際問題的缺口；只有 Read、Grep、Glob 工具。`review-triage` 的再審用它 |

## Scripts

| 腳本 | 用途 | 需要 |
|---|---|---|
| `skills/commit-message/check.py` | 檢查 commit message 的 type 格式、標題與內文寬度（全形算 2 欄）、禁止的署名行；也能當 git commit-msg hook | Python 3 |

## Evals

`skills/review-triage/evals/evals.json` 是 [skill-creator](https://github.com/anthropics/claude-plugins-official) 的格式，用 skill-creator 跑有 skill 與沒有 skill 的對照。
