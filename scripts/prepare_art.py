"""Make screen-sized runtime art from Lyra's archived originals.

Usage: python3 scripts/prepare_art.py FULL.zip DONATE.zip
Requires Pillow for development only. Original archives are not embedded in the APK.
"""
from pathlib import Path
from PIL import Image, ImageSequence
import io
import json
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
out = root / 'web' / 'art'


def max_side(name):
    if name.startswith('ui/backgrounds/'): return 1200
    if name.startswith('ui/icons/'): return 240
    if name.startswith('ui/illustrations/'): return 680
    if name.startswith('ui/buttons/') or name.startswith('ui/cards/'): return 600
    if name.startswith('interiors/'):
        leaf = Path(name).name
        if leaf in ('wall_base.png', 'ceiling_base.png', 'floor_base.png', 'window_view.png', 'lighting_overlay.png'): return 1080
        if leaf == 'window_frame.png': return 900
        return 600
    if name.startswith('shop/'): return 500
    return 760


def resize(im, limit):
    im = im.convert('RGBA')
    im.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    return im


def remove_green(im):
    """Color-key the supplied neon-green photography stage, preserving soft edges."""
    im = im.convert('RGBA')
    pixels = list(im.getdata())
    clean = []
    for r, g, b, a in pixels:
        green = g - max(r, b)
        if g > 150 and green > 95:
            a = 0
        elif g > 130 and green > 35:
            a = round(a * max(0, 1 - (green - 35) / 60))
        clean.append((r, g, b, a))
    im.putdata(clean)
    return im


def save_webp(im, path, quality=78):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, 'WEBP', quality=quality, method=6)


def convert_full(path):
    count = 0
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            if not name.startswith('assets/') or not name.endswith('.png') or name.startswith('assets/atlases/'):
                continue
            relative = name.removeprefix('assets/')
            im = resize(Image.open(io.BytesIO(z.read(name))), max_side(relative))
            save_webp(im, out / Path(relative).with_suffix('.webp'))
            count += 1
    assert count == 117, f'Expected 117 primary art files, got {count}'
    return count


def convert_donate(path):
    with zipfile.ZipFile(path) as z:
        for name in ['donate_button.png', 'info_button.png', 'donate_hero.png']:
            im = Image.open(io.BytesIO(z.read('donate_package/' + name)))
            im = resize(im, 900 if name == 'donate_hero.png' else 260)
            if name == 'donate_hero.png': im = remove_green(im)
            save_webp(im, out / 'donate' / name.replace('.png', '.webp'))
        gif = Image.open(io.BytesIO(z.read('donate_package/lyra_yuki_wave.gif')))
        frames, durations = [], []
        for frame in ImageSequence.Iterator(gif):
            frames.append(remove_green(resize(frame, 560)))
            durations.append(frame.info.get('duration', 100))
        # Animated WebP remains optional in UI, but preserves the gifted waving art.
        frames[0].save(out / 'donate' / 'lyra_yuki_wave.webp', 'WEBP', save_all=True,
                       append_images=frames[1:], duration=durations, loop=0, quality=65, method=6)


if __name__ == '__main__':
    convert_full(Path(sys.argv[1]))
    convert_donate(Path(sys.argv[2]))
    files = sorted(out.rglob('*.webp'))
    print(f'{len(files)} runtime images, {sum(p.stat().st_size for p in files):,} bytes')
