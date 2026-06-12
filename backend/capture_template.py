"""
Interactive utility to capture screen regions as OpenCV templates.

Usage:
    python capture_template.py spotify_play

This opens the target app (e.g. Spotify), then you position your mouse
over the button you want to template. Press Enter to capture a 40x40
region around the cursor and save it to backend/vision_templates/.
"""

import os
import sys
import time
import pyautogui
import mss
import mss.tools

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "vision_templates")

TEMPLATE_MAP = {
    "spotify_play": "spotify_play.png",
}


def capture_around_cursor(name, size=40):
    """Capture a square region around the mouse cursor and save as template."""
    os.makedirs(TEMPLATES_DIR, exist_ok=True)
    filename = TEMPLATE_MAP.get(name, f"{name}.png")
    filepath = os.path.join(TEMPLATES_DIR, filename)

    x, y = pyautogui.position()
    half = size // 2
    region = (x - half, y - half, size, size)

    with mss.mss() as sct:
        capture = {"left": region[0], "top": region[1], "width": region[2], "height": region[3]}
        img = sct.grab(capture)
        mss.tools.to_png(img.rgb, img.size, output=filepath)

    print(f"Saved {filepath} ({size}x{size}) from cursor ({x}, {y})")
    return filepath


def main():
    if len(sys.argv) < 2:
        print("Usage: python capture_template.py <template_name>")
        print(f"Available: {', '.join(TEMPLATE_MAP.keys())}")
        print("Or use any custom name (will save as <name>.png)")
        sys.exit(1)

    name = sys.argv[1]
    print(f"Template: {name}")
    print("1. Open the target app and navigate to the button/icon")
    print("2. Move your mouse cursor over the button")
    print("3. Press Enter to capture a 40x40 region around the cursor")
    print("   or type a custom size and press Enter (e.g. '60')")
    print("4. Press Ctrl+C to quit\n")

    try:
        while True:
            inp = input("Ready > ").strip()
            size = 40
            if inp.isdigit():
                size = int(inp)
            elif inp.lower() in ("q", "quit", "exit"):
                break
            capture_around_cursor(name, size)
            print("Captured! Move to next position or Ctrl+C to quit.\n")
    except KeyboardInterrupt:
        print("\nDone.")


if __name__ == "__main__":
    main()
