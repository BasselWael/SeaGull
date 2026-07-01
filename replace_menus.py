with open("index.html", "r") as f:
    text = f.read()

start_idx = text.find('<div class="menu-grid">')
end_idx = text.find('</section>', start_idx)

with open("all_menus.html", "r") as f:
    all_menus = f.read()

new_text = text[:start_idx] + '<div id="all-menus-container">\n' + all_menus + '</div>\n' + text[end_idx:]

with open("index.html", "w") as f:
    f.write(new_text)

print("Replaced menus in index.html")
