import fitz

doc = fitz.open("Design/menu el max.pdf")
page = doc[0]

words = page.get_text("words")
menu_start_y = 0
for w in words:
    if "Seafood" in w[4]:
        menu_start_y = w[1]
        break

print(f"Menu starts around y={menu_start_y}")

info = page.get_image_info(xrefs=True)
images_in_menu = []
for img in info:
    bbox = img["bbox"]
    if bbox[1] > menu_start_y - 500 and bbox[1] < menu_start_y + 2000:
        images_in_menu.append(bbox)

print(f"Found {len(images_in_menu)} images in the menu section.")
for b in images_in_menu:
    print(f"Image bbox: {b}")

