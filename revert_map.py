import re

with open("index.html", "r") as f:
    html = f.read()

# Replace the map navigation with the pill buttons
map_nav_pattern = r'<div class="map-nav-container">.*?<div class="menu-header">'
pills_html = """<div class="menu-nav">
                <button class="active" data-target="elmax">EL MAX</button>
                <button data-target="marina">MARINA <span style="color: var(--color-accent); font-size: 1.2em; line-height: 0;">&bull;</span></button>
                <button data-target="dokki">DOKKI</button>
                <button data-target="newcairo">NEW CAIRO</button>
                <button data-target="gleem">GLEEM</button>
                <button data-target="madinaty">MADINATY</button>
                <button data-target="sheikhzayed">SHEIKH ZAYED</button>
            </div>
            
            <div class="menu-header">"""

html = re.sub(map_nav_pattern, pills_html, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)
