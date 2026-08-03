import re

with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find MENU_DATA
start_str = "const MENU_DATA = {"
start_idx = content.find(start_str)

# Find the closing brace of MENU_DATA
brace_count = 0
end_idx = -1
for i in range(start_idx + len("const MENU_DATA = "), len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        if brace_count == 0:
            end_idx = i
            break
        brace_count -= 1

menu_data_str = content[start_idx:end_idx+1]

# Now, let's remove it from script.js
new_script = content[:start_idx] + "\n  const MENU_DATA = getMenuData();\n" + content[end_idx+2:]

with open("script.js", "w", encoding="utf-8") as f:
    f.write(new_script)

# Add dummy prices: We'll regex replace `{ en: '...', ar: '...' }` (for items) with added price.
# Actually, since items can have desc and signature, it's safer to just inject `price: 250` before `}` if it doesn't have it.
# Wait, it's easier to use JS to parse and rewrite it if we want to add prices properly, or we can just append it via regex.
# A simple regex for items: replace ` } }` with `, price: 250 } }` or just match item objects.
# The safest way is to do it in javascript during initialization or python json.
