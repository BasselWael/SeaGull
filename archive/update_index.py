import re

with open("index.html", "r") as f:
    text = f.read()

with open("all_menus.html", "r") as f:
    all_menus = f.read()

# Replace the contents of all-menus-container
pattern = r'(<div id="all-menus-container">).*?(</div>\s*</section>)'
new_text = re.sub(pattern, r'\1\n' + all_menus + r'\2', text, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_text)

print("Updated index.html")
