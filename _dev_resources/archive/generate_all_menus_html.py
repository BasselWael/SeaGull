import os
import glob

files = glob.glob("extracted_menu*.txt")

html_output = ""

def parse_menu(text, loc_id):
    lines = text.split("\n")
    active_class = "active-menu" if loc_id == "elmax" else ""
    display_style = 'style="display:none;"' if loc_id != "elmax" else ''
    
    menu_html = '<div class="menu-content ' + active_class + '" id="menu-' + loc_id + '" ' + display_style + '>\n'
    
    current_cat = ""
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        
        has_arabic = any('\u0600' <= c <= '\u06FF' for c in line)
        
        if len(line) < 30 and not has_arabic and "Soup" not in line and "Salad" not in line:
            if any(w in line for w in ["ABOUT", "MENU", "OUR STORY", "LOCATIONS", "MARINA", "RESERVE", "Egypt", "Since", "decades", "philosophy", "story", "hotel", "Plate", "Sea", "From", "L", "O", "T", "press", "careers", "events"]):
                continue
            if len(line) < 4: continue
            
            if current_cat:
                menu_html += '    </ul>\n</div>\n'
            current_cat = line
            menu_html += '<div class="menu-category">\n    <h3 class="category-title">' + current_cat + '</h3>\n    <ul class="menu-items">\n'
            continue
            
        if has_arabic:
            prev_line = ""
            for j in range(i-1, -1, -1):
                if lines[j].strip() and not any('\u0600' <= c <= '\u06FF' for c in lines[j]):
                    prev_line = lines[j].strip()
                    break
            
            if not current_cat:
                menu_html += '<div class="menu-category">\n    <h3 class="category-title">Menu Items</h3>\n    <ul class="menu-items">\n'
                current_cat = "Items"
                
            menu_html += '        <li>\n            <div class="item-header"><span class="item-name">' + prev_line + '</span><span class="item-name-ar">' + line + '</span></div>\n'
            menu_html += '        </li>\n'
            
    if current_cat:
        menu_html += '    </ul>\n</div>\n'
        
    menu_html += '</div>\n\n'
    return menu_html

for file in files:
    loc_name = file.replace("extracted_menu-", "").replace("extracted_menu ", "").replace(".txt", "").strip()
    loc_id = loc_name.lower().replace(" ", "")
    if loc_id == "elsheikhzayed": loc_id = "sheikhzayed"
    
    with open(file, "r") as f:
        html_output += parse_menu(f.read(), loc_id)

with open("all_menus.html", "w") as f:
    f.write(html_output)

print("Menus generated successfully.")
