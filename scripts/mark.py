"""The project mark, drawn once so both the card and the icons use it.

Lifted out of make-og.py unchanged. It is the same geometry as public/logo.svg,
scaled from that file's 460 unit box, so the drawn images and the vector stay
the same shape when one of them is edited.
"""

from PIL import ImageDraw


def draw_mark(d: ImageDraw.ImageDraw, x: int, y: int, size: int, fill: tuple) -> None:
    """Two chevrons facing inward with a dot between them."""
    k = size / 460

    def at(pts):
        return [(x + px * k, y + py * k) for px, py in pts]

    d.polygon(at([(30, 57), (85, 57), (172, 229.5), (85, 402), (30, 402), (115, 229.5)]), fill=fill)
    d.polygon(
        at([(430, 57), (375, 57), (288, 229.5), (375, 402), (430, 402), (345, 229.5)]), fill=fill
    )
    r = 30.5 * k
    cx, cy = x + 229.5 * k, y + 229.5 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
