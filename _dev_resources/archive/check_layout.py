import sys
try:
    import fitz  # PyMuPDF
except ImportError:
    import os
    os.system("pip install PyMuPDF")
    import fitz

doc = fitz.open("Design/menu el max.pdf")
page = doc[0]

words = page.get_text("words")
targets = ["EL", "MAX", "MARINA", "DOKKI", "NEW", "CAIRO", "GLEEM"]
found = []
for w in words:
    if w[4] in targets:
        found.append((w[4], round(w[0], 2), round(w[1], 2), round(w[2], 2), round(w[3], 2)))

print("Word Coordinates (x0, y0, x1, y1):")
for f in found:
    print(f)

# Also check for vector drawings (paths) around these words
paths = page.get_drawings()
print(f"\nFound {len(paths)} vector drawings on the page.")
for i, p in enumerate(paths):
    rect = p["rect"]
    # Check if this drawing is near our menu items (roughly y between 500 and 800)
    if 500 < rect.y0 < 900:
        print(f"Drawing at {rect}, type: {p['type']}, fill: {p.get('fill')}, color: {p.get('color')}")

