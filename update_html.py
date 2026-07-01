import re

with open("index.html", "r") as f:
    html = f.read()

tabs_html = """            <div class="menu-tabs">
                <button class="menu-tab active" data-target="elmax">EL MAX</button>
                <button class="menu-tab" data-target="marina">MARINA <span style="color: var(--color-accent);">&bull;</span></button>
                <button class="menu-tab" data-target="dokki">DOKKI</button>
                <button class="menu-tab" data-target="newcairo">NEW CAIRO</button>
                <button class="menu-tab" data-target="gleem">GLEEM</button>
                <button class="menu-tab" data-target="madinaty">MADINATY</button>
                <button class="menu-tab" data-target="sheikhzayed">SHEIKH ZAYED</button>
            </div>"""

pattern = r'<div class="map-nav-container">.*?</div>\s*</div>'
html = re.sub(pattern, tabs_html, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)
