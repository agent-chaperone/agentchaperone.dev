"""Draw the raster icons.

An SVG favicon alone is not enough. Google Search does not use one, and neither
does Safari before 26, so a site with only favicon.svg gets a generic globe
beside every search result. iOS needs its own file as well, because a home
screen icon is masked to a rounded square and anything with its own corner
radius baked in either gets clipped twice or shows a gap.

    python3 scripts/make-icons.py

Writes public/favicon.png and public/apple-touch-icon.png. Both are drawn rather
than rasterised from favicon.svg: that file carries rx="96", and those corners
are exactly what the iOS mask would fight with.
"""

from pathlib import Path

from mark import draw_mark
from PIL import Image, ImageDraw

BG = (12, 13, 16)
INK = (255, 255, 255)
OUT = Path(__file__).resolve().parent.parent / "public"


def icon(size: int, padding: int, radius: int) -> Image.Image:
    """The mark on an opaque panel.

    Opaque, not transparent: a transparent icon against a dark home screen or a
    dark tab strip is an invisible one, and neither surface promises a
    background.
    """
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    if radius > 0:
        # Drawn as a rounded panel over the square, for the places that show the
        # file as it is rather than masking it themselves.
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG)
    draw_mark(d, padding, padding, size - padding * 2, INK)
    return img


def main() -> None:
    # A square icon with its own corners, for the browser tab and search results.
    icon(180, 24, 40).save(OUT / "favicon.png", optimize=True)
    # iOS masks this itself, so it ships square and opaque with the mark inset
    # far enough that the mask cannot clip it.
    icon(180, 20, 0).save(OUT / "apple-touch-icon.png", optimize=True)
    for name in ("favicon.png", "apple-touch-icon.png"):
        path = OUT / name
        print(f"{name}: {path.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
