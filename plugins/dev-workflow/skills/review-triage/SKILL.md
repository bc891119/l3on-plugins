---
name: review-triage
description: 提交前 code review 的分級（A 擋提交／B 不擋／既有問題／不採納）、驗證、修正範圍、再審與輪數上限。專案收斂流程跑 /code-review 後載入。
user-invocable: false
---

# Review 分級與停止條件

`/code-review` 等級與旗標之後的文字會被當成 review 目標，所以這裡的規則用在處理它的結果，不要當指示傳給它；專案規則寫在 CLAUDE.md，它會自己讀（[官方](https://code.claude.com/docs/en/code-review-local)）。

**整個 review 都適用**：reviewer 被要求找問題就一定會找到一些，全部照修只會多出不必要的抽象（[官方](https://code.claude.com/docs/en/best-practices)）。寧可少修，不追求完美。

## 先驗證

分級前，每條 finding 都打開它指的 `檔案:行號` 核對：
- 沒有行號、或只從名稱推論的，自己讀程式碼確認；確認不了就不採納
- 確認這段程式碼是這次改的；修改前就存在的歸為「既有問題」，看 `git diff` 判斷

## 分級

全部 findings 都列給使用者，每條先分級再寫處理方式，不默默丟掉：

| 級別 | 條件 | 處理 |
|---|---|---|
| **A 擋提交** | 這次造成、以現有程式碼可重現的功能錯誤、資料遺失、資安、無障礙違規、與專案規範衝突（與鄰近慣例不一致也算） | 本輪修 |
| **B 不擋提交** | 這次造成、使用者確實會遇到但影響小（體驗、效能、重構、去重） | 小的本輪順手修；大的依專案流程記錄 |
| **既有問題** | 修改前就存在 | 不修進這次的 commit，依專案流程記錄；資安問題另外明確提醒使用者 |
| **不採納** | 查證後不成立、假設性未來用法、純偏好、預先準備 | 不修，列一行理由 |

依據：[Claude Code 文章](https://claude.dev/blog/solving-code-review-at-anthropic/)（Important／Nit／Pre-existing，既有問題不算作者造成）、[Conventional Comments](https://conventionalcomments.org/)、[Google eng-practices](https://google.github.io/eng-practices/review/reviewer/comments.html)。

## 修正

- 修同一類問題的所有地方，不只改被點到的那行：先 grep 同樣寫法
- 修根本原因；不用清空全域狀態、畫面特判之類的繞路
- 不額外加「為以後準備」的機制
- 修完重跑專案流程指定的驗證，改到新檔案就重新 stage 並 git status

## 再審

只審本輪修正。把修正 diff 存到 scratchpad，交給 `dev-workflow:change-reviewer` subagent，連同已判定清單（不採納、B、既有問題），這些不重複提出。

## 停止

- 再審沒有新的 A、B 就停
- **最多 3 輪**。第 3 輪後還有 A 類，停下來告訴使用者，建議重新考慮做法，不繼續修（文章實測：多輪之後找到的多半是第一輪就存在的舊問題；導入上限後平均審查次數由 2.08 降到 1.32）
