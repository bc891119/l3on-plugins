#!/usr/bin/env python3
"""SVG logo 匯出點陣檔：各尺寸 PNG、apple-touch-icon（180）、favicon.ico（16/32/48）。

用法：
  python3 export_logo.py logo.svg out/ [--favicon favicon.svg]

--favicon 給簡化版 SVG 時，16/32/48 與 favicon.ico 用簡化版產出（小尺寸看得清楚）。
需要任一 SVG 轉檔工具：cairosvg、rsvg-convert、ImageMagick（magick）或 Inkscape，依此順序找。
ICO 用標準函式庫組成（PNG 內嵌格式，瀏覽器與 Windows Vista 以上都支援）。
"""
import argparse
import os
import shutil
import struct
import subprocess
import sys

LOGO_SIZES = [512, 256, 128, 64]        # 品牌指南與社群頭像常用尺寸
FAVICON_SIZES = [16, 32, 48]            # 瀏覽器分頁、Windows 捷徑
APPLE_TOUCH = 180                       # iOS 主畫面圖示


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


def render(converter, svg, png, size, background=None):
    r = subprocess.run(command(*converter, svg, png, size, background), capture_output=True, text=True)
    if r.returncode != 0 or not os.path.isfile(png):
        sys.exit(f"轉檔失敗（{os.path.basename(png)}，工具 {converter[0]}）：{r.stderr.strip()}")


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

    converter = find_converter()
    if not converter:
        sys.exit(INSTALL_HELP)
    for f in [a.svg] + ([a.favicon] if a.favicon else []):
        if not os.path.isfile(f):
            sys.exit(f"找不到 SVG：{f}")
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
