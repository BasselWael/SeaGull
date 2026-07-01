import glob
import re

files = glob.glob("extracted_menu*.txt")

english_items = set()

for file in files:
    with open(file, "r") as f:
        text = f.read()
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        for i, line in enumerate(lines):
            # If line has no arabic and next line has arabic, it's an item!
            has_arabic = any('\u0600' <= c <= '\u06FF' for c in line)
            
            # Categories also might have english and arabic on same line
            if has_arabic and sum(1 for c in line if '\u0600' <= c <= '\u06FF') > 0:
                english_part = ""
                for c in line:
                    if not ('\u0600' <= c <= '\u06FF' or c == ' ' and '\u0600' <= line[-1] <= '\u06FF'):
                        english_part += c
                english_part = re.sub(r'[\u0600-\u06FF]', '', line).strip()
                english_items.add(english_part)
            
            if not has_arabic and i + 1 < len(lines):
                next_line = lines[i+1]
                if any('\u0600' <= c <= '\u06FF' for c in next_line):
                    english_items.add(line)

print("ALL ENGLISH STRINGS:")
for item in sorted(list(english_items)):
    if len(item) > 2 and len(item) < 40:
        print(item)
