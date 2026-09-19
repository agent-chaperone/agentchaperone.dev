"""Draw the Open Graph card.

Committed as a script rather than as a one-off, so the card can be redrawn when
the wording changes. Deliberately carries no measured numbers: social scrapers
cache aggressively, and a stale figure in a cached card cannot be fixed by
redeploying.

    python3 scripts/make-og.py
"""

from pathlib import Path

from mark import draw_mark
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (12, 13, 16)
PANEL = (19, 21, 25)
LINE = (35, 38, 45)
INK = (230, 232, 236)
DIM = (160, 166, 176)
ACCENT = (127, 178, 255)

MONO = "/System/Library/Fonts/Menlo.ttc"
SANS = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=index)


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # A hairline frame, the same one pixel the site uses between sections.
    d.rectangle([40, 40, W - 41, H - 41], outline=LINE, width=1)

    draw_mark(d, x=84, y=86, size=52, fill=INK)
    d.text((152, 92), "agent-chaperone", font=font(MONO, 40, 1), fill=INK)

    headline = ["Screening for agent tool calls,", "and for what comes back."]
    y = 178
    for line in headline:
        d.text((84, y), line, font=font(SANS, 62, 1), fill=INK)
        y += 74

    sub = [
        "It starts in shadow mode and blocks nothing, so the",
        "decision to switch rests on your own log.",
    ]
    y = 352
    for line in sub:
        d.text((84, y), line, font=font(SANS, 31), fill=DIM)
        y += 42

    # One line of real shadow-mode output, in the panel the site uses for terminals.
    d.rounded_rectangle([84, 470, W - 84, 546], radius=8, fill=PANEL, outline=LINE, width=1)
    d.text(
        (108, 495),
        "call  forward  write_file (would have held it)",
        font=font(MONO, 26),
        fill=ACCENT,
    )

    out = Path(__file__).resolve().parent.parent / "public" / "og.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
