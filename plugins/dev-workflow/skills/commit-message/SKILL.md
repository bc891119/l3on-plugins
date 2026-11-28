---
name: commit-message
description: Conventional Commits 1.0.0 撰寫規範（type、subject、body、影響範圍、footer、寬度檢查腳本與反例）。撰寫、建議或審閱 git commit message 時一律載入，交付前跑 check.py。
---

# Commit message 規範

採 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)。要不要自動 commit、提交前的檢查等流程規則由使用者或專案的 CLAUDE.md 決定；專案 CLAUDE.md 可加嚴本規範（例：卡號、影響範圍）。

## 格式

```
<type>(<scope>)!: <subject>

<body：一段或多段，段落間空一行>

影響範圍：<動到共用模組時才寫>

<footer：BREAKING CHANGE: …、Refs: …>
```

寬度一律以終端機欄數計：全形字算 2 欄、半形 1 欄（[UAX #11](https://www.unicode.org/reports/tr11/) 的 Wide／Fullwidth 在等寬字型佔兩倍寬）。交付前把訊息存成檔案檢查，沒有輸出才算通過：repo 有 `scripts/check_commit_msg.py`（commit-msg hook 用的那支）就跑 `python3 scripts/check_commit_msg.py msg.txt`，以 repo 的為準；沒有就跑 `python3 ${CLAUDE_SKILL_DIR}/check.py msg.txt`。

## Type

沿用 commitlint [`config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)：`feat` `fix` `perf` `refactor` `docs` `test` `build` `ci` `style` `revert` `chore`，必填、小寫。

- 一個 commit 同時有新功能與修正時，以使用者最在意的那個為準（通常 `feat`）。
- `chore` 只用在沒有 src／test 變動的雜項；套件升級用 `build(deps)`。

## Scope

選填，小寫 kebab-case 名詞（`deploy`、`e2e`、`deps`）；沒有明確區隔就省略，不為了填而填。

## Subject

- 寫「套用這個 commit 會怎樣」：中文用動詞開頭或「X 改為 Y」，不寫「修正了」「新增了」；英文用祈使句、首字小寫。
- 描述行為或結果，不列檔名與函式名。
- 整行（含 type）≤ 72 欄（硬上限）；中文描述以 30 個全形字為上限（約 66 欄）。Git 建議 50 字元（[git-commit DISCUSSION](https://git-scm.com/docs/git-commit#_discussion)），中文只放得下 22 字，所以改以 72 欄反推。
- 兩件相關的事可用「，」接成一句；三件以上表示該拆 commit，或只寫最重要的。
- 結尾不加標點；語言跟隨該 repo 既有 git log。
- 卡號：專案要求且有卡時放在 type 之後（`feat: PROJ-123 問答集清單`）；沒卡就不寫號，也不寫「無卡號」。

## Body

subject 已足夠說明時省略（typo、版本升級、純搬移）。要寫時：

- 與 subject 空一行；每行 ≤ 72 欄（中文約 36 字）換行（[Pro Git](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)：wrap to about 72），網址可超過。
- **寫 Why**：不改會怎樣（問題與症狀）→ 為何這樣解 → 捨棄的替代方案。What 看 diff 就有，不重複。
- 用段落寫；只有多個彼此獨立的原因時才用 `- ` 條列（續行縮兩格），不用條列逐項羅列改動。
- 現況用現在式描述，不寫「原本」「目前」「這次」。
- 不依賴對話、計畫檔或外部連結也看得懂；不提 diff 裡沒有的東西（討論過但刪掉、從未提交的做法）。

## 影響範圍

動到共用模組（專案 CLAUDE.md 定義的共用目錄、跨 app 呼叫的函式、資料表結構）時，body 最後一段固定以「影響範圍：」開頭，寫哪個模組、對呼叫端的影響（行為不變也寫「行為不變」）。沒動到就不寫這段。

## Footer

- 破壞性變更：subject 加 `!`，並在 footer 寫 `BREAKING CHANGE: <要怎麼配合>`（大寫，接冒號與空格）。
- 其他 footer 的 token 用 `-` 取代空白（`Refs: PROJ-123`、`Reviewed-by: …`）。

## 範例

```
feat: 訂單匯出加上筆數核對與單筆補匯

匯出後只能開 CSV 數列數，和後台的訂單數對不起來時，不知道漏了
哪幾筆，只能整批重匯。

每筆訂單記下最後匯出的時間，匯出頁直接列出「後台有、檔案沒有」
的訂單，可以只補匯這幾筆；整批重匯會讓下游重複入帳，所以不採用。

影響範圍：core/choices.py 加稽核動作 order_reexport 的標籤。
```

```
docs: 匯入時自動建立分類，匯入說明不再要求先建
```

## 反例

- ❌ `update`、`修改`、`wip`：沒有資訊量
- ❌ `feat: 新增 Login.vue、修改 router.ts`：subject 列 diff
- ❌ body 一行一項列出「改了 A、加了 B」：那是 What，不是 Why
- ❌ body 不換行、一行超過 72 欄
- ❌ 「共用影響：」「共用檔案：」等自訂標籤：固定用「影響範圍：」
- ❌ 提到 diff 裡沒有的檔案或做法
