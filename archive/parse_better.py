import os
import glob

files = glob.glob("extracted_menu*.txt")

html_output = ""

def parse_menu(text, loc_id):
    lines = text.split("\n")
    active_class = "active-menu" if loc_id == "elmax" else ""
    display_style = 'style="display:none;"' if loc_id != "elmax" else ''
    
    menu_html = '<div class="menu-content ' + active_class + '" id="menu-' + loc_id + '" ' + display_style + '>\n'
    menu_html += '<div class="menu-grid">\n'
    
    current_cat = ""
    valid_lines = [l.strip() for l in lines if l.strip()]
    
    i = 0
    while i < len(valid_lines):
        line = valid_lines[i]
        
        if any(w in line for w in ["ABOUT", "MENU", "OUR STORY", "LOCATIONS", "MARINA", "RESERVE", "Egypt", "Since", "decades", "philosophy", "story", "hotel", "Plate", "Sea", "From", "L", "O", "T", "press", "careers", "events"]):
            i += 1
            continue
            
        has_arabic = any('\u0600' <= c <= '\u06FF' for c in line)
        
        # Check if line is a category. A category usually has english and arabic on the SAME line.
        # But wait, items can also have english and arabic on the same line if pdftotext messed up?
        # Actually, looking at the screenshot, "Soups الشوربة" is a single line.
        # "Seafood Soup" is English, and underneath it is Arabic.
        
        if has_arabic and sum(1 for c in line if '\u0600' <= c <= '\u06FF') > 0:
            english_part = ""
            arabic_part = ""
            for c in line:
                if '\u0600' <= c <= '\u06FF' or (arabic_part and c == ' '):
                    arabic_part += c
                else:
                    if not arabic_part:
                        english_part += c
            
            english_part = english_part.strip()
            arabic_part = arabic_part.strip()
            
            # If the english part has more than 5 words, it's probably a description with arabic, skip.
            if english_part and arabic_part and len(english_part.split()) < 6:
                if current_cat:
                    menu_html += '    </ul>\n</div>\n'
                current_cat = english_part
                menu_html += '<div class="menu-category">\n    <h3 class="category-title">' + english_part + ' <span class="category-title-ar">' + arabic_part + '</span></h3>\n    <ul class="menu-items">\n'
                i += 1
                continue
                
        # Item: English on one line, Arabic on next
        if not has_arabic and i + 1 < len(valid_lines):
            next_line = valid_lines[i+1]
            if any('\u0600' <= c <= '\u06FF' for c in next_line):
                english_item = line
                arabic_item = next_line
                
                desc = ""
                if i + 2 < len(valid_lines):
                    potential_desc = valid_lines[i+2]
                    if not any('\u0600' <= c <= '\u06FF' for c in potential_desc) and len(potential_desc) > 10:
                        desc = potential_desc
                        i += 1
                
                if not current_cat:
                    menu_html += '<div class="menu-category">\n    <h3 class="category-title">Menu Items</h3>\n    <ul class="menu-items">\n'
                    current_cat = "Items"
                    
                menu_html += '        <li>\n            <div class="item-header">\n'
                menu_html += '                <span class="item-name">' + english_item + '</span>\n'
                menu_html += '                <span class="item-name-ar">' + arabic_item + '</span>\n'
                menu_html += '            </div>\n'
                if desc:
                    menu_html += '            <p class="item-desc">' + desc + '</p>\n'
                menu_html += '        </li>\n'
                
                i += 2
                continue
                
        i += 1
        
    if current_cat:
        menu_html += '    </ul>\n</div>\n'
        
    menu_html += '</div>\n</div>\n\n'
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
