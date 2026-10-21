#!/usr/bin/env python3
"""Regenerate Next's original tab icon. Requires Pillow; GPL-3.0, tongsun99, 2026-10-21."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / 'src/img'
image = Image.new('RGBA', (512, 512))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((8, 8, 504, 504), radius=112, fill='#315ed8')
draw.rounded_rectangle((102, 112, 406, 352), radius=28, fill='#92b1ff')
draw.rounded_rectangle((76, 152, 380, 392), radius=28, fill='#ceddff')
draw.rounded_rectangle((108, 192, 412, 416), radius=28, fill='white')
for index, width in enumerate([116, 164, 212]):
    y = 238 + index * 54
    draw.rounded_rectangle((152, y, 152 + width, y + 19), radius=9, fill='#315ed8')
for size in [16, 48, 128]:
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'{size}.png')
