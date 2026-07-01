import re

with open("index.html", "r") as f:
    text = f.read()

with open("all_menus.html", "r") as f:
    all_menus = f.read()

# Make sure we only replace the first occurrence of menu-grid and up to the end of its section
# Actually, it's safer to find exactly the indices.
start = text.find('<div class="menu-grid">')
# The section ends with </section>
# Let's find the first </section> AFTER start
end = text.find('</section>', start)

new_text = text[:start] + '<div id="all-menus-container">\n' + all_menus + '</div>\n        ' + text[end:]

with open("index.html", "w") as f:
    f.write(new_text)
print("Injected all_menus into index.html")
