# l3on-plugins

Claude Code plugins by L3ON. Skill content is written in Traditional Chinese.

**web-design** — a human-in-the-loop website design workflow (collect references → 2–3 direction drafts → iterate → lock a `DESIGN-SYSTEM.md`), with WCAG 2.2 AA checks, asset license tracking, SVG logo export, Taiwan trademark similarity lookup, and Playwright-based UI verification.

```
/plugin marketplace add bc891119/l3on-plugins
/plugin install web-design@l3on-plugins
```

---

L3ON 的 Claude Code 外掛市集。

## 外掛

| 外掛 | 內容 |
|---|---|
| `web-design` | `designing-websites`（網站設計流程、資訊分層、WCAG 2.2 AA、圖示與素材授權、SVG logo）、`verifying-ui`（Playwright 畫面驗證） |

## 安裝

在 Claude Code 對話中：

```
/plugin marketplace add bc891119/l3on-plugins
/plugin install web-design@l3on-plugins
```

安裝時會自動帶入相依的官方外掛 `frontend-design`。它來自官方市集 `claude-plugins-official`，Claude Code 第一次開互動式對話時會自動加入；若安裝時出現「Is the "claude-plugins-official" marketplace added?」，先執行 `/plugin marketplace add anthropics/claude-plugins-official` 再裝一次。


## 需求

- Claude Code
- Python 3（對比檢查與 logo 匯出腳本，只用標準函式庫）
- Node.js 與 npm（截圖、無障礙掃描與商標檢索腳本；Playwright 與 axe-core 由外掛的 `package-lock.json` 鎖版，安裝外掛時自動裝好）
- Chromium：第一次用截圖、無障礙掃描或商標檢索時下載一次（約 150MB），腳本會印出指令
- logo 匯出另需任一 SVG 轉檔工具：cairosvg、rsvg-convert、ImageMagick 或 Inkscape（沒有時腳本會印出安裝方式）
- 專案的畫面驗收測試：專案自己安裝 `@playwright/test` 與 `@axe-core/playwright`（skill 會引導，並要求鎖精確版本）
- 相依外掛：官方 `frontend-design`（來自 Claude Code 內建的官方市集 `claude-plugins-official`，安裝 web-design 時自動一併安裝）

## 這個外掛會做什麼

- 只有 skill（說明檔）和供 skill 呼叫的腳本；沒有 hook、沒有 MCP 伺服器、沒有常駐程式，也不蒐集任何使用資料。
- 腳本的對外連線只有三種，都在 skill 流程明確用到時才發生：商標檢索（連到經濟部智慧財產局商標檢索系統，送出要查的文字或 logo 圖檔）、第一次使用時下載 Chromium、截圖或無障礙掃描時頁面自己載入的外部資源（例如網頁字型）。
- 腳本位置：`plugins/web-design/skills/designing-websites/scripts/`，安裝前可以直接閱讀。
- Windows 上若沒有 `python3` 指令，請改用 `python` 執行 `.py` 腳本。

## 更新

發行新版時會遞增 `plugins/web-design/.claude-plugin/plugin.json` 的 `version`，並記在 `CHANGELOG.md`。使用者執行：

```
/plugin marketplace update l3on-plugins
```

## 開發

```bash
(cd plugins/web-design && npm ci --ignore-scripts)   # 從本機路徑載入外掛時要自己裝一次
claude plugin validate .                    # 檢查市集與外掛格式
claude plugin eval plugins/web-design --judge-model sonnet --threshold 0.8   # 跑 evals（有外掛 vs 無外掛），報告在 plugins/web-design/evals/results/；評審是 AI，單次結果會浮動，看多次執行的平均
```

## 授權

[MIT](LICENSE)
