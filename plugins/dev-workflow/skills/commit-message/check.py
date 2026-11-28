"""檢查 commit message 的格式：python3 check.py msg.txt（或從 stdin：git log -1 --format=%B | python3 check.py）。

也當 git commit-msg hook 用（git 傳入訊息檔路徑）：# 開頭的說明行與 scissors 以下忽略，
git 產生的 Merge／Revert 與 fixup!／squash!／amend! 不檢查。

寬度以終端機欄數計：全形（East Asian Wide／Fullwidth）算 2 欄，其餘 1 欄。
只檢查機械規則；Why 寫得好不好要自己看。沒有問題時不輸出、結束碼 0。
"""

import re
import sys
import unicodedata

TYPES = "build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test"
HEADER_RE = re.compile(rf"^({TYPES})(\([a-z0-9-]+\))?!?: \S")
HEADER_MAX = 72  # 欄
BODY_MAX = 72  # 欄
FORBIDDEN = ("Co-Authored-By", "Generated with")
GENERATED = ("Merge ", 'Revert "', "fixup! ", "squash! ", "amend! ")
SCISSORS = "# ------------------------ >8 ------------------------"


def width(text: str) -> int:
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)


def main() -> int:
    text = open(sys.argv[1], encoding="utf-8").read() if len(sys.argv) > 1 else sys.stdin.read()
    text = text.split(SCISSORS, 1)[0]
    lines = [line for line in text.splitlines() if not line.startswith("#")]
    while lines and not lines[-1].strip():
        lines.pop()
    if lines and lines[0].startswith(GENERATED):
        return 0
    problems: list[str] = []
    header = lines[0] if lines else ""
    if not HEADER_RE.match(header):
        problems.append(f"第 1 行不是「type(scope): 描述」，type 限 {TYPES}")
    if width(header) > HEADER_MAX:
        problems.append(f"第 1 行 {width(header)} 欄，上限 {HEADER_MAX}")
    if header.endswith(("。", ".", "，", ",")):
        problems.append("第 1 行結尾不加標點")
    if len(lines) > 1 and lines[1].strip():
        problems.append("第 1 行與 body 之間要空一行")
    for n, line in enumerate(lines[2:], start=3):
        if width(line) > BODY_MAX and not re.match(r"\s*(https?://|\S+\.\S+/)", line):
            problems.append(f"第 {n} 行 {width(line)} 欄，上限 {BODY_MAX}")
        if line.lstrip().startswith(FORBIDDEN):
            problems.append(f"第 {n} 行：不加 AI 署名")
    print("\n".join(problems))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
