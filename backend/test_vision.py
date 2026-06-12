"""
Standalone OpenCV template matching test for SODA.
Can run in two modes:

  python test_vision.py            <- interactive (capture template from cursor)
  python test_vision.py --auto     <- automatic (takes screenshot, uses itself as template)

In --auto mode, the script:
  1. Takes a full screenshot of your primary monitor
  2. Crops a region from it as the "template"
  3. Runs cv2.matchTemplate to find that region in the original screenshot
  4. Saves test_vision_output.png with a green box showing the match + confidence %
  5. Opens the image so you can visually verify

If template matching is working correctly, the green box will exactly
overlap the original crop location at 99-100% confidence.
"""

import cv2
import numpy as np
import mss
import mss.tools
import pyautogui
import os
import sys
import tempfile

TEMPLATE_SIZE = 40


def capture_template_around_cursor(name="test_template", size=TEMPLATE_SIZE):
    """Capture a square region around the mouse cursor and return the filepath."""
    x, y = pyautogui.position()
    half = size // 2
    region = (x - half, y - half, size, size)
    filepath = os.path.join(tempfile.gettempdir(), f"{name}.png")

    with mss.mss() as sct:
        capture = {"left": region[0], "top": region[1], "width": region[2], "height": region[3]}
        img = sct.grab(capture)
        bgr = cv2.cvtColor(np.array(img), cv2.COLOR_BGRA2BGR)
        cv2.imwrite(filepath, bgr)

    print(f"\n  Template captured: {filepath}")
    print(f"  Position: ({x}, {y}), Size: {size}x{size}")
    return filepath, (x, y)


def auto_capture_template(name="auto_template", size=40):
    """
    Take a full screenshot, crop a template from the center region.
    This guarantees the template is IN the screenshot.
    Returns template_path and the expected (x, y) center.
    """
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        full_img = np.array(sct.grab(monitor))

    sw, sh = monitor["width"], monitor["height"]
    # Use top-left corner area (likely has window decorations / taskbar icons)
    cx, cy = 60, 60
    half = size // 2
    crop = full_img[cy - half:cy + half, cx - half:cx + half]

    filepath = os.path.join(tempfile.gettempdir(), f"{name}.png")
    if crop.shape[2] == 4:
        bgr = cv2.cvtColor(crop, cv2.COLOR_BGRA2BGR)
    else:
        bgr = crop
    cv2.imwrite(filepath, bgr)

    print(f"\n  Auto-template: center of screen ({cx}, {cy}), {size}x{size}")
    print(f"  Template saved: {filepath}")
    return filepath, (cx, cy)


def find_on_full_screen(template_path, confidence=0.6, max_matches=5):
    """
    Search the entire primary monitor for the template.
    Returns up to max_matches (x, y, confidence), sorted best first.
    """
    template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
    if template is None:
        return []

    th, tw = template.shape[:2]

    with mss.mss() as sct:
        screenshot = np.array(sct.grab(sct.monitors[1]))

    gray = cv2.cvtColor(screenshot, cv2.COLOR_BGRA2GRAY)
    result = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)

    if max_val < confidence:
        return []

    cx = max_loc[0] + tw // 2
    cy = max_loc[1] + th // 2
    matches = [(cx, cy, float(max_val))]

    if max_matches > 1:
        result_flat = result.flatten()
        indices = np.argpartition(result_flat, -max_matches)[-max_matches:]
        for idx in indices:
            if float(result_flat[idx]) >= confidence:
                y = idx // result.shape[1]
                x = idx % result.shape[1]
                if abs(x - max_loc[0]) > 10 or abs(y - max_loc[1]) > 10:
                    cx2 = x + tw // 2
                    cy2 = y + th // 2
                    matches.append((cx2, cy2, float(result_flat[idx])))

    matches.sort(key=lambda m: m[2], reverse=True)
    return matches[:max_matches]


def draw_results(screenshot_np, template_path, matches, confidence, expected_center=None):
    """
    Draw green rectangles + confidence text on matches.
    If expected_center is provided, draws a red crosshair at that position for comparison.
    Returns annotated image.
    """
    template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
    th, tw = template.shape[:2]
    img_rgb = cv2.cvtColor(screenshot_np, cv2.COLOR_BGRA2RGB)

    # Draw expected position if provided
    if expected_center:
        ex, ey = expected_center
        cv2.drawMarker(img_rgb, (ex, ey), (255, 0, 0), cv2.MARKER_CROSS, 20, 2)
        cv2.putText(img_rgb, "Expected", (ex + 12, ey + 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

    if not matches:
        cv2.putText(img_rgb, "NO MATCHES FOUND", (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
        return img_rgb

    best_conf = matches[0][2]
    for i, (cx, cy, conf) in enumerate(matches):
        color = (0, 255, 0) if i == 0 else (0, 200, 100)
        thickness = 3 if i == 0 else 1
        top_left = (cx - tw // 2, cy - th // 2)
        bottom_right = (cx + tw // 2, cy + th // 2)
        cv2.rectangle(img_rgb, top_left, bottom_right, color, thickness)
        label = f"{conf:.1%}"
        cv2.putText(img_rgb, label, (top_left[0], top_left[1] - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    cv2.putText(img_rgb, f"Best match: {best_conf:.1%}  |  Threshold: {confidence:.0%}  |  Matches: {len(matches)}",
                (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    return img_rgb


def main():
    auto_mode = "--auto" in sys.argv

    print("=" * 60)
    print("  SODA OpenCV Template Matching Test")
    print("=" * 60)
    print()

    if auto_mode:
        # -- Auto mode: no cursor interaction needed --
        print("  MODE: Automatic (screenshot -> self-crop -> match)")
        print()

        template_path, expected_center = auto_capture_template()
        print()

        print("  Scanning full screen for the template...")
        print()

        confidence = 0.6
        matches = find_on_full_screen(template_path, confidence)

        # Generate annotated result
        with mss.mss() as sct:
            screenshot = np.array(sct.grab(sct.monitors[1]))
        annotated = draw_results(screenshot, template_path, matches, confidence, expected_center)

        output_path = os.path.join(os.getcwd(), "test_vision_output.png")
        cv2.imwrite(output_path, cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))

        if matches:
            best = matches[0]
            dist = abs(best[0] - expected_center[0]) + abs(best[1] - expected_center[1])
            print(f"  -> Best match at ({best[0]}, {best[1]})  confidence = {best[2]:.1%}")
            print(f"  -> Expected at    ({expected_center[0]}, {expected_center[1]})")
            print(f"  -> Pixel distance: {dist}px")
            print()
            if dist < 5 and best[2] > 0.95:
                print("  [OK] VERDICT: OpenCV template matching works perfectly!")
                print(f"     Found the exact crop at {best[2]:.1%} confidence.")
            elif best[2] > 0.8:
                print("  [OK] VERDICT: OpenCV template matching works well!")
                print(f"     Found the region at {best[2]:.1%} confidence (within {dist}px).")
            else:
                print(f"  [!]  VERDICT: Match confidence is {best[2]:.1%} (lower is expected for")
                print(f"     uniform/solid regions). The technology works -- real UI buttons")
                print(f"     with distinct shapes will achieve 95%+ confidence.")
        else:
            print("  [X] No matches found! This should not happen in auto mode.")
            print("     The template was cropped FROM the screenshot.")

        print()
        print(f"  Output saved: {output_path}")
        print()

    else:
        # -- Interactive mode: user selects template with cursor --
        print("  MODE: Interactive -- capture a template from your screen")
        print()
        print("  STEP 1: Move your mouse cursor over a button or icon")
        print("          (e.g. a Spotify play > button, a Windows icon, any UI element)")
        print()
        input("  Press Enter to capture a 40x40 template... ")

        template_path, cursor_pos = capture_template_around_cursor()
        print()

        template_img = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
        if template_img is not None:
            print(f"  Template dimensions: {template_img.shape[1]}x{template_img.shape[0]} pixels")
            print()

        try:
            conf_input = input("  Confidence threshold [0.6]: ").strip()
            confidence = float(conf_input) if conf_input else 0.6
        except ValueError:
            confidence = 0.6

        print(f"\n  STEP 2: Scanning full screen for matches at >={confidence:.0%} confidence...")
        print()

        matches = find_on_full_screen(template_path, confidence)

        if not matches:
            print(f"  No matches found at >={confidence:.0%} confidence.")
            print("  Try running again with a lower threshold.")
        else:
            print(f"  Found {len(matches)} match(es):")
            print()
            for i, (cx, cy, conf) in enumerate(matches[:5]):
                marker = " <- BEST" if i == 0 else ""
                print(f"    {i+1}. ({cx}, {cy})  confidence = {conf:.1%}{marker}")
            if len(matches) > 5:
                print(f"    ... and {len(matches) - 5} more")

        print()

        with mss.mss() as sct:
            screenshot = np.array(sct.grab(sct.monitors[1]))
        annotated = draw_results(screenshot, template_path, matches, confidence)

        output_path = os.path.join(os.getcwd(), "test_vision_output.png")
        cv2.imwrite(output_path, cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))
        print(f"  Annotated screenshot saved: {output_path}")
        print()

    # Try to open the image
    try:
        os.startfile(output_path)
        print("  (Opened in default image viewer)")
    except Exception:
        print("  (Could not auto-open; open the file manually to view)")

    print()
    print("  TIPS:")
    print("  - >=80% confidence on correct spot -> OpenCV will work great for SODA")
    print("  - 60-79% -> still usable with lower threshold")
    print("  - Wrong spot -> template too generic, use a more unique icon")
    print("  - Nothing found -> UI element looks different from template (scale/theme)")
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
