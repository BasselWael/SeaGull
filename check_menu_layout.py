import fitz

doc = fitz.open("Design/menu el max.pdf")
page = doc[0]

words = page.get_text("words")
# Find the start of the menu
menu_start_y = 0
for w in words:
    if "Seafood" in w[4]:
        menu_start_y = w[1]
        break

if not menu_start_y:
    print("Could not find Seafood")
    exit()

print(f"Menu starts around y={menu_start_y}")

# Print all words and their coordinates in a 1000px vertical window
menu_words = []
for w in words:
    if menu_start_y - 100 < w[1] < menu_start_y + 800:
        menu_words.append((w[4], round(w[0]), round(w[1])))

# Sort by Y, then X
menu_words.sort(key=lambda x: (x[2] // 10, x[1]))

for w in menu_words:
    print(f"{w[0]:<20} x:{w[1]:<5} y:{w[2]}")

