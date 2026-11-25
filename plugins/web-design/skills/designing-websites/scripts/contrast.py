#!/usr/bin/env python3
"""WCAG 2.x 色彩對比檢查（只用標準函式庫）。

用法：
  python3 contrast.py "#767676" "#ffffff" [text|large|ui]
  python3 contrast.py pairs.txt

pairs.txt 每行：前景 背景 [類型] [# 說明]
  類型 text = 一般文字 4.5:1（預設）
       large = 大字 3:1（>= 24px，或粗體 >= 18.66px）
       ui = 圖示、輸入框框線、焦點環等辨識元件或狀態所需的非文字 3:1（WCAG 1.4.11；W3C 不要求控制項有
            標示點擊範圍的邊界，裝飾性圖形也不必符合：
            https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html）
色值：#rgb、#rrggbb、rgb(r g b) / rgb(r,g,b)、oklch(L C H)（L 可為 0-1 或百分比）
結束碼：0 全部通過、1 有不合格、2 用法錯誤、讀不到檔案，或檔案裡有格式、色值、類型錯誤
（有錯誤的行沒有檢查到，結果不完整，所以優先於 1）。
"""
import math
import re
import sys

# WCAG 1.4.3 / 1.4.11 的門檻
THRESHOLDS = {"text": 4.5, "large": 3.0, "ui": 3.0}


def _clip(v):
    return min(1.0, max(0.0, v))


def oklch_to_srgb(l, c, h):
    """OKLCH -> sRGB（0-1），超出色域時逐通道截斷（與瀏覽器簡易處理相近）。"""
    a = c * math.cos(math.radians(h))
    b = c * math.sin(math.radians(h))
    l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s_ = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3
    lin = (
        4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
        -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
        -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
    )

    def encode(x):
        x = _clip(x)
        return 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055

    return tuple(encode(x) for x in lin)


def parse_color(s):
    """回傳 sRGB 0-1 三元組；無法解析時丟出 ValueError 並說明支援格式。"""
    t = s.strip().lower()
    # 半透明色的實際對比取決於疊在什麼上面，這裡算不出來：要求先換成疊合後的實色
    alpha = re.search(r"[,/]\s*([\d.]+)(%?)\s*\)$", t)
    if alpha and t.startswith(("rgba(", "oklch(", "rgb(")) and (t.startswith("rgba(") or "/" in t):
        value = float(alpha.group(1)) / (100 if alpha.group(2) else 1)
        if value < 1:
            raise ValueError(f"色值「{s}」是半透明的；請改填疊在背景上之後的實色再檢查")
    m = re.fullmatch(r"#([0-9a-f]{3}|[0-9a-f]{6})", t)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    m = re.fullmatch(r"rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*[\d.%]+)?\s*\)", t)
    if m:
        return tuple(float(m.group(i)) / 255 for i in (1, 2, 3))
    m = re.fullmatch(r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*/\s*[\d.%]+)?\s*\)", t)
    if m:
        l = float(m.group(1)) / (100 if m.group(2) else 1)
        return oklch_to_srgb(l, float(m.group(3)), float(m.group(4)))
    raise ValueError(f"無法解析色值「{s}」；支援 #rgb、#rrggbb、rgb()、oklch()")


def luminance(rgb):
    """WCAG 相對亮度。"""
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    l1, l2 = sorted((luminance(parse_color(fg)), luminance(parse_color(bg))), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def check(fg, bg, kind="text", note=""):
    if kind not in THRESHOLDS:
        raise ValueError(f"未知類型「{kind}」；可用 {', '.join(THRESHOLDS)}")
    r = ratio(fg, bg)
    need = THRESHOLDS[kind]
    ok = r >= need  # WCAG 不四捨五入：4.499 不合格
    shown = round(r, 2)
    if not ok and shown >= need:
        # 避免 4.497 顯示成 4.50 卻判不合格：此時改為無條件捨去
        shown = math.floor(r * 100) / 100
    print(f"{'通過' if ok else '不合格'}  {shown:5.2f}:1  需 {need}:1  {kind:5}  {fg} on {bg}" + (f"  # {note}" if note else ""))
    return ok


def main(argv):
    if len(argv) in (2, 3):
        try:
            return 0 if check(argv[0], argv[1], argv[2] if len(argv) == 3 else "text") else 1
        except ValueError as e:
            print(e, file=sys.stderr)
            return 2
    if len(argv) != 1:
        print(__doc__, file=sys.stderr)
        return 2
    try:
        with open(argv[0], encoding="utf-8") as f:
            lines = f.readlines()
    except (OSError, UnicodeDecodeError) as e:
        print(f"讀不到檔案「{argv[0]}」：{e}", file=sys.stderr)
        return 2
    all_ok, bad, n = True, 0, 0
    for lineno, raw in enumerate(lines, 1):
        stripped = raw.strip()
        # 空行與「# 開頭＋空白」的整行註解略過；#rrggbb 色值不會被當成註解
        if not stripped or stripped == "#" or stripped.startswith("# "):
            continue
        # 行尾說明以「 # 」（前後空白）分隔
        line, _, note = stripped.partition(" # ")
        parts = re.findall(r"(?:rgba?|oklch)\([^)]*\)|\S+", line)
        if len(parts) not in (2, 3):
            print(f"第 {lineno} 行格式錯誤：需要「前景 背景 [類型]」，實際為「{line}」")
            bad += 1
            continue
        try:
            all_ok &= check(*parts, note=note.strip())
            n += 1
        except ValueError as e:
            print(f"第 {lineno} 行：{e}")
            bad += 1
    if bad:
        print(f"共 {n} 組已檢查，{bad} 行有錯誤沒有檢查：修正後重跑")
        return 2
    if n == 0:
        print("沒有讀到任何色票組合：每行要有「前景 背景 [類型]」")
        return 2
    print(f"共 {n} 組，{'全部通過' if all_ok else '有不合格'}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
