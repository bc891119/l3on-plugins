#!/usr/bin/env python3
"""SVG logo 匯出點陣檔：各尺寸 PNG、apple-touch-icon（180）、favicon.ico（16/32/48）。

用法：
  python3 export_logo.py logo.svg out/ [--favicon favicon.svg] [--touch-bg <色值>]

--favicon 給簡化版 SVG 時，16/32/48 與 favicon.ico 用簡化版產出（小尺寸看得清楚）。
需要任一 SVG 轉檔工具：cairosvg、rsvg-convert、ImageMagick（magick）或 Inkscape，依此順序找。
--touch-bg 只接受 #rgb 或 #rrggbb（四種轉檔工具都接受的寫法），預設 #ffffff。
ICO 用標準函式庫組成（PNG 內嵌格式，瀏覽器與 Windows Vista 以上都支援）。

結束碼：0 完成、1 轉檔失敗、2 用法或環境錯誤（色值不合法、找不到 SVG、沒有轉檔工具）。
"""
import argparse
import os
import re
import shutil
import struct
import subprocess
import sys

LOGO_SIZES = [512, 256, 128, 64]        # 品牌指南與社群頭像常用尺寸
FAVICON_SIZES = [16, 32, 48]            # 瀏覽器分頁、Windows 捷徑
APPLE_TOUCH = 180                       # iOS 主畫面圖示
HEX_COLOR = re.compile(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})")


INSTALL_HELP = """找不到 SVG 轉檔工具。安裝任一個後重跑：
  cairosvg      uv tool install cairosvg  或  pipx install cairosvg
  rsvg-convert  macOS: brew install librsvg ／ Debian, Ubuntu: apt install librsvg2-bin
  ImageMagick   macOS: brew install imagemagick ／ Debian, Ubuntu: apt install imagemagick
  Inkscape      https://inkscape.org/release/"""


def find_converter():
    """回傳 (工具名, 路徑)；順序依輸出品質與安裝容易度。"""
    for name in ("cairosvg", "rsvg-convert", "magick", "inkscape"):
        path = shutil.which(name)
        if path:
            return name, path
    return None


def command(tool, path, svg, png, size, background):
    s = str(size)
    if tool == "cairosvg":
        cmd = [path, svg, "-o", png, "--output-width", s, "--output-height", s]
        return cmd + (["--background", background] if background else [])
    if tool == "rsvg-convert":
        cmd = [path, "-w", s, "-h", s, "-o", png]
        return cmd + (["--background-color", background] if background else []) + [svg]
    if tool == "magick":
        # -background 要放在讀檔前才會套用到 SVG 的透明區域
        return [path, "-background", background or "none", svg, "-resize", f"{s}x{s}"] + (["-flatten"] if background else []) + [png]
    cmd = [path, svg, "--export-type=png", f"--export-filename={png}", "-w", s, "-h", s]
    return cmd + ([f"--export-background={background}", "--export-background-opacity=1"] if background else [])


def fail(message, code):
    print(message, file=sys.stderr)
    sys.exit(code)


def render(converter, svg, png, size, background=None):
    r = subprocess.run(command(*converter, svg, png, size, background), capture_output=True, text=True)
    if r.returncode != 0 or not os.path.isfile(png):
        fail(f"轉檔失敗（{os.path.basename(png)}，工具 {converter[0]}）：{r.stderr.strip()}", 1)


def build_ico(pngs, out):
    """把多個 PNG 包成 ICO（ICONDIR + ICONDIRENTRY + PNG 資料）。"""
    blobs = []
    for size, path in pngs:
        with open(path, "rb") as f:
            blobs.append((size, f.read()))
    header = struct.pack("<HHH", 0, 1, len(blobs))
    offset = 6 + 16 * len(blobs)
    entries, data = b"", b""
    for size, blob in blobs:
        dim = 0 if size >= 256 else size  # 256 在 ICO 中以 0 表示
        entries += struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(blob), offset)
        offset += len(blob)
        data += blob
    with open(out, "wb") as f:
        f.write(header + entries + data)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("svg")
    p.add_argument("outdir")
    p.add_argument("--favicon", help="小尺寸用的簡化版 SVG")
    p.add_argument("--touch-bg", default="#ffffff", help="apple-touch-icon 底色（iOS 不支援透明，預設白）")
    a = p.parse_args()

    # 先檢查參數再找工具：轉檔工具遇到看不懂的底色多半不報錯，會產出底色不對的圖
    if not HEX_COLOR.fullmatch(a.touch_bg):
        fail(f"--touch-bg 的色值不合法：{a.touch_bg}（要寫成 #rgb 或 #rrggbb，例 --touch-bg '#1f2937'）", 2)
    for f in [a.svg] + ([a.favicon] if a.favicon else []):
        if not os.path.isfile(f):
            fail(f"找不到 SVG：{f}", 2)
    converter = find_converter()
    if not converter:
        fail(INSTALL_HELP, 2)
    os.makedirs(a.outdir, exist_ok=True)
    small_src = a.favicon or a.svg

    for s in LOGO_SIZES:
        render(converter, a.svg, os.path.join(a.outdir, f"logo-{s}.png"), s)
    ico_parts = []
    for s in FAVICON_SIZES:
        out = os.path.join(a.outdir, f"logo-{s}.png")
        render(converter, small_src, out, s)
        ico_parts.append((s, out))
    render(converter, a.svg, os.path.join(a.outdir, "apple-touch-icon.png"), APPLE_TOUCH, a.touch_bg)
    build_ico(ico_parts, os.path.join(a.outdir, "favicon.ico"))

    print(f"完成：{a.outdir}（轉檔工具 {converter[0]}）")
    for name in sorted(os.listdir(a.outdir)):
        print(f"  {name}  {os.path.getsize(os.path.join(a.outdir, name))} bytes")


if __name__ == "__main__":
    main()
