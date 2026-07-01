import fitz
doc = fitz.open("Design/menu el max.pdf")
page = doc[0]

words = page.get_text("words")
soup_y = None
for w in words:
    if w[4] == "Seafood" and w[5] == 0: # block no maybe
        soup_y = w[1]
        print(f"Found Seafood at {w}")
        break

if soup_y:
    images = page.get_images()
    print(f"Found {len(images)} images in PDF.")
    # We can't easily get image coords without page.get_image_info(), available in newer PyMuPDF
    info = page.get_image_info(xrefs=True)
    for img in info:
        y0 = img["bbox"][1]
        if abs(y0 - soup_y) < 1000:
            print(f"Image near Seafood Soup: {img['bbox']}")
