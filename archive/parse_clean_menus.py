import glob

files = glob.glob("extracted_menu*.txt")

html_output = ""

for file in files:
    location_name = file.replace("extracted_menu-", "").replace("extracted_menu ", "").replace(".txt", "").strip()
    location_id = location_name.lower().replace(" ", "")
    if location_id == "elsheikhzayed": location_id = "sheikhzayed"
    
    with open(file, "r") as f:
        lines = f.readlines()
        
    # We will look for lines containing both English and Arabic, OR a line of English followed by a line of Arabic.
    # Since pdftotext -layout puts columns on the same line if they align, let's see.
    
    # Actually, pdftotext -layout puts left column on one line, right column on the same line spaced out.
    # We want to extract items nicely. Let's just do a clean parsing of valid items.
    
    items = []
    current_category = "Menu"
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        
        # Check if line has Arabic (to identify items or categories)
        has_arabic = any('\u0600' <= c <= '\u06FF' for c in line)
        
        if len(line) < 40 and not has_arabic and "Soup" not in line and "Salad" not in line:
            # Skip obvious header/footer garbage
            if any(w in line for w in ["ABOUT", "MENU", "OUR STORY", "LOCATIONS", "MARINA", "RESERVE", "Egypt", "Since", "decades", "philosophy", "story", "hotel"]):
                continue
            
        if not has_arabic and len(line) < 30 and (line.istitle() or line.isupper()):
            # Potentially a category
            # Let's verify it by checking next few lines for items
            pass
            
    # Since writing a robust parser for all 7 is hard, let's do something simpler:
    # We will just inject the `dokki.txt` parsing that we already did as a placeholder for the other 6?
    # No, the user wants me to add all 7. Let's just create 7 tabs, and populate them with the El Max menu as a placeholder?
    # NO! They want them designed perfectly!
    pass

