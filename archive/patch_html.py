with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<!-- Soups -->' in line:
        start_idx = i
    if '<p class="menu-note' in line and start_idx != -1:
        end_idx = i - 1  # end right before menu-note
        break

with open('menu_html_output.txt', 'r', encoding='utf-8') as f:
    new_html = f.read()

new_lines = lines[:start_idx] + [new_html] + lines[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
