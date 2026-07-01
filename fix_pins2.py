import re

with open("index.html", "r") as f:
    html = f.read()

# I will replace the loc-map-side inner HTML completely.

locations_data = [
    {"id": "marina", "x": "13.5%", "y": "21%", "class": "pin-marina active"},
    {"id": "elmax", "x": "30%", "y": "24%", "class": "pin-elmax"},
    {"id": "gleem", "x": "36%", "y": "26.5%", "class": ""},
    {"id": "sheikhzayed", "x": "41.5%", "y": "60%", "class": ""},
    {"id": "dokki", "x": "48.5%", "y": "56%", "class": ""},
    {"id": "newcairo", "x": "58.5%", "y": "60%", "class": ""},
    {"id": "madinaty", "x": "65%", "y": "56%", "class": ""}
]

pins_html = '<img src="assets/images/map.svg" alt="Map" class="loc-map-img">\n'
for loc in locations_data:
    pins_html += f"""                        <div class="pin-wrapper" style="left: {loc['x']}; top: {loc['y']};">
                            <button class="loc-pin {loc['class']}" data-loc="{loc['id']}"></button>
                        </div>\n"""

pattern = r'<img src="assets/images/map.svg" alt="Map" class="loc-map-img">.*?(?=</div>\s*<div class="loc-card-side">)'

new_html = re.sub(pattern, pins_html, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_html)

print("Updated pins HTML")
