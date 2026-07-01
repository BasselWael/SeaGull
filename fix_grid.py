import re

with open("index.html", "r") as f:
    html = f.read()

# For each <div class="menu-content ...">, we want to inject <div class="menu-grid"> right after it,
# and add a closing </div> right before its closing </div>
html = re.sub(r'(<div class="menu-content[^>]*>)', r'\1\n<div class="menu-grid">', html)
# This is tricky because the closing </div> is hard to find with regex.
# Let's just run fix_grid on all_menus.html instead and reinject!
