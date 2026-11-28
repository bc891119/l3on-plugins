# l3on-plugins

Claude Code plugins by L3ON. Skill content is written in Traditional Chinese.

**web-design** — a human-in-the-loop website design workflow (collect references → 2–3 direction drafts → iterate → lock a `DESIGN-SYSTEM.md`), with WCAG 2.2 AA checks, asset license tracking, SVG logo export, and Playwright-based UI verification.

**dev-workflow** — commit message rules (Conventional Commits 1.0.0 with a width checker) and triage rules for pre-commit code review findings.

```
/plugin marketplace add bc891119/l3on-plugins
/plugin install web-design@l3on-plugins
/plugin install dev-workflow@l3on-plugins
```

---

L3ON 的 Claude Code 外掛市集。

## 外掛

| 外掛 | 內容 |
|---|---|
| `web-design` | `designing-websites`（網站設計流程、資訊分層、WCAG 2.2 AA、圖示與素材授權、SVG logo）、`verifying-ui`（Playwright 畫面驗證）；agent `direction-reviewer`（全權委託時的方向稿獨立審查） |
| `dev-workflow` | `commit-message`（Conventional Commits 1.0.0 寫法與寬度檢查腳本）、`review-triage`（`/code-review` 結果的分級、修正範圍與再審上限）；agent `change-reviewer`（只讀的 diff 再審） |

## 安裝

在 Claude Code 對話中：

```
/plugin marketplace add bc891119/l3on-plugins
/plugin install web-design@l3on-plugins
/plugin install dev-workflow@l3on-plugins
```

只要其中一個就只裝那一個。web-design 安裝時會自動帶入相依的官方外掛 `frontend-design`。它來自官方市集 `claude-plugins-official`，Claude Code 第一次開互動式對話時會自動加入；若安裝時出現「Is the "claude-plugins-official" marketplace added?」，先執行 `/plugin marketplace add anthropics/claude-plugins-official` 再裝一次。

## 需求

- Claude Code；模型建議用 Sonnet 或 Opus。Haiku 在使用者全權委託的長流程會漏掉步驟（例：獨立審查）
- Python 3（對比檢查、logo 匯出與 commit message 檢查腳本，只用標準函式庫）
- Node.js 與 npm（截圖與無障礙掃描腳本；Playwright 與 axe-core 由外掛的 `package-lock.json` 鎖版，安裝外掛時自動裝好）
- Chromium：第一次用截圖或無障礙掃描時下載一次（下載約 330MB、解壓後約 680MB，Linux x64 實測），腳本會印出指令
- logo 匯出另需任一 SVG 轉檔工具：cairosvg、rsvg-convert、ImageMagick 或 Inkscape（沒有時腳本會印出安裝方式）
- 專案的畫面驗收測試：專案自己安裝 `@playwright/test` 與 `@axe-core/playwright`（skill 會引導，並要求鎖精確版本）

## 這個外掛會做什麼

- 只有 skill（說明檔）、供 skill 呼叫的腳本，和兩個唯讀的審查用 agent（web-design 的只有 Read，dev-workflow 的有 Read、Grep、Glob）；沒有 hook、沒有 MCP 伺服器、沒有常駐程式，也不蒐集任何使用資料。dev-workflow 的 `check.py` 只讀訊息檔或 stdin，不連網。
- `designing-websites` 用 `allowed-tools` 預先核准四支內附腳本的確切指令：叫用這個 skill 的那一輪執行它們不再逐次確認，下一則訊息起恢復原本的權限（[官方說明](https://code.claude.com/docs/en/skills)）。下載 Chromium 不在核准範圍，照舊要確認。
- 腳本的對外連線只有兩種，都在 skill 流程明確用到時才發生：第一次使用時下載 Chromium、截圖或無障礙掃描時頁面自己載入的外部資源（例如網頁字型）。
- 外掛不內建生圖。使用者自己接了生圖服務的 MCP 伺服器時，skill 會把提示詞送到那個服務；沒接就不會連。
- 腳本位置：`plugins/web-design/skills/designing-websites/scripts/`，安裝前可以直接閱讀。
- Windows 上若沒有 `python3` 指令，請改用 `python` 執行 `.py` 腳本（這時不符合上面的預先核准，每次會先問）。

## 更新

發行新版時會遞增 `plugins/web-design/.claude-plugin/plugin.json` 的 `version`，並記在 `CHANGELOG.md`。在 shell 執行：

```bash
claude plugin marketplace update l3on-plugins   # 更新市集清單
claude plugin update web-design@l3on-plugins    # 更新已安裝的外掛
```

只跑第一行不會更新已安裝的外掛；也可以在 `/plugin` 的 Installed 分頁選 Update now。更新後在對話中執行 `/reload-plugins` 套用（[官方說明](https://code.claude.com/docs/en/plugins/install)）。

## 開發

```bash
(cd plugins/web-design && npm ci --ignore-scripts)   # 從本機路徑載入外掛時要自己裝一次
claude plugin validate .                    # 檢查市集與外掛格式
claude plugin eval plugins/web-design --judge-model sonnet --threshold 0.8   # 跑 evals（有外掛 vs 無外掛），報告在 plugins/web-design/evals/results/；llm 類評分條件由 AI 判定，單次結果會浮動，看多次執行的平均
(cd plugins/web-design && claude plugin eval . --eval-dir evals-exec --scaffold --allow-tools Bash --judge-model sonnet)   # 實際執行腳本的案例；需要 sandbox（Linux：bubblewrap 與 socat）
```

## 授權

[MIT](LICENSE)
