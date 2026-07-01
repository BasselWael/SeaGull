import os
import glob
import re

files = glob.glob("extracted_menu*.txt")

html_output = ""

for file in files:
    if "table" in file or "Home" in file or "Reservations" in file:
        continue
    
    # Extract location name from file name
    location_name = file.replace("extracted_menu-", "").replace("extracted_menu ", "").replace(".txt", "").strip()
    
    # Handle specific names for IDs
    location_id = location_name.lower().replace(" ", "")
    if location_id == "elsheikhzayed":
        location_id = "sheikhzayed"
        
    with open(file, "r") as f:
        text = f.read()
    
    lines = text.split("\n")
    
    display_style = 'style="display:none;"' if location_id != "elmax" else ''
    active_class = 'active-menu' if location_id == "elmax" else ''
    
    menu_html = f'<div class="menu-content {active_class}" id="menu-{location_id}" {display_style}>\n'
    
    current_cat = ""
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        
        # If it looks like a category (short, no arabic)
        if len(line) < 30 and not any('\u0600' <= c <= '\u06FF' for c in line) and not "Soup" in line:
            if "Menu" in line or "Since" in line or "Locations" in line or "Egypt" in line or "From the" in line or "Sea" in line or "decades" in line or "philosophy" in line or "story" in line or "ABOUT" in line or "OUR STORY" in line or "MARINA" in line: continue
            
            # Additional noise filter
            if len(line) < 3 or "Seagull" in line or "Couvert" in line: continue
            
            if current_cat:
                menu_html += '    </ul>\n</div>\n'
            current_cat = line
            menu_html += f'<div class="menu-category">\n    <h3 class="category-title">{current_cat}</h3>\n    <ul class="menu-items">\n'
            continue
            
        # If it has arabic, it's probably an item name
        if any('\u0600' <= c <= '\u06FF' for c in line):
            prev_line = lines[i-1].strip() if i > 0 else ""
            if len(prev_line) > 50 or "Soup" in prev_line and "Soup" in line: 
                # This is fragile, let's just use the previous non-empty line
                prev_idx = i - 1
                while prev_idx >= 0 and not lines[prev_idx].strip():
                    prev_idx -= 1
                if prev_idx >= 0:
                    prev_line = lines[prev_idx].strip()
            
            desc = lines[i+1].strip() if i < len(lines)-1 else ""
            if len(desc) < 10 or any('\u0600' <= c <= '\u06FF' for c in desc): desc = ""
            
            if not current_cat:
                menu_html += f'<div class="menu-category">\n    <ul class="menu-items">\n'
                current_cat = "Items"
                
            menu_html += f'        <li>\n            <div class="item-header"><span class="item-name">{prev_line}</span><span class="item-name-ar">{line}</span></div>\n'
            if desc:
                menu_html += f'            <p class="item-desc">{desc}</p>\n'
            menu_html += '        </li>\n'
            
    if current_cat:
        menu_html += '    </ul>\n</div>\n'
        
    menu_html += '</div>\n\n'
    html_output += menu_html

with open("all_menus.html", "w") as f:
    f.write(html_output)
    
print("Generated all_menus.html")

