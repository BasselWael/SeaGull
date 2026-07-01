import re

with open("index.html", "r") as f:
    html = f.read()

# I will replace the loc-map-side inner HTML completely.

locations_data = [
    {"id": "marina", "title": "Marina", "x": "15%", "y": "30%", "class": "pin-marina active"},
    {"id": "elmax", "title": "El Max", "x": "30%", "y": "30%", "class": "pin-elmax"},
    {"id": "gleem", "title": "Gleem", "x": "37%", "y": "33%", "class": "pin-gleem"},
    {"id": "sheikhzayed", "title": "Sheikh Zayed", "x": "45%", "y": "70%", "class": "pin-sheikhzayed"},
    {"id": "dokki", "title": "Dokki", "x": "55%", "y": "65%", "class": "pin-dokki"},
    {"id": "newcairo", "title": "New Cairo", "x": "63%", "y": "73%", "class": "pin-newcairo"},
    {"id": "madinaty", "title": "Madinaty", "x": "72%", "y": "70%", "class": "pin-madinaty"}
]

pins_html = '<img src="assets/images/map.svg" alt="Map" class="loc-map-img">\n'
for loc in locations_data:
    pins_html += f"""                        <div class="pin-wrapper" style="left: {loc['x']}; top: {loc['y']};">
                            <button class="loc-pin {loc['class']}" data-loc="{loc['id']}"></button>
                            <span class="pin-label">{loc['title']}</span>
                        </div>\n"""

pattern = r'<img src="assets/images/map.svg" alt="Map" class="loc-map-img">.*?(?=</div>\s*<div class="loc-card-side">)'

new_html = re.sub(pattern, pins_html, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_html)

print("Updated pins HTML")
