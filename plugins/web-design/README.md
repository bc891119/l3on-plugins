# web-design

A Claude Code plugin for designing websites with a human in the loop, and verifying the result with Playwright. Skill content is written in Traditional Chinese.

網站設計流程與畫面驗證。安裝、需求與對外連線說明見 [repo 首頁](https://github.com/bc891119/l3on-plugins#readme)。

## Skills

| Skill | 用途 |
|---|---|
| `web-design:designing-websites` | 收素材 → 調研 → 2～3 個方向稿 → 退件 → 定案 `DESIGN-SYSTEM.md` → 素材與 logo → 驗證。含 WCAG 2.2 AA 檢查、素材授權紀錄、SVG logo 匯出、商標近似檢索 |
| `web-design:verifying-ui` | 用專案鎖版的 Playwright 驗證畫面：通過條件、桌機／手機截圖、版面與 axe 檢查、視覺回歸 |

## Scripts

位於 `skills/designing-websites/scripts/`，由 skill 呼叫，也可以單獨執行：

| 腳本 | 用途 | 需要 |
|---|---|---|
| `contrast.py` | WCAG 色彩對比檢查 | Python 3 |
| `export_logo.py` | SVG logo 匯出 PNG、favicon.ico、apple-touch-icon | Python 3＋任一 SVG 轉檔工具 |
| `screenshot.mjs` | 桌機 1440／手機 390 整頁截圖 | Node.js（Playwright 隨外掛安裝） |
| `tipo_search.mjs` | 智慧財產局商標文字近似、以圖找圖 | 同上 |

## Dependencies

- 官方外掛 `frontend-design@claude-plugins-official`（自動安裝）
- npm：`playwright`（版本鎖在 `package-lock.json`，自動安裝；Chromium 第一次使用時下載）

## Evals

```bash
claude plugin eval . --judge-model sonnet
```

## License

[MIT](../../LICENSE)
