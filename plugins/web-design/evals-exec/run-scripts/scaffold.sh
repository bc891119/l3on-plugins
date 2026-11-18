#!/usr/bin/env bash
# 在空的工作區放一份色票組合檔，其中說明文字那一組不合格
set -euo pipefail
cat > tokens.txt <<'TXT'
# 方向 A 色票
#1f2937 #ffffff text  # 內文
#9ca3af #ffffff text  # 說明文字
#b5532e #ffffff large # 大標
TXT
