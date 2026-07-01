import re

with open('seagull-website-8.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    styles = style_match.group(1).strip()
    # Write to styles.css
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(styles)
    # Remove from HTML and add link
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="styles.css">')

# Extract scripts (only the main one at the bottom, before </body>)
script_match = re.search(r'<script>(.*?)</script>(?=\s*</body>)', content, re.DOTALL)
if script_match:
    script = script_match.group(1).strip()
    # Write to script.js
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(script)
    # Remove from HTML and add script tag
    content = content.replace(script_match.group(0), '<script src="script.js"></script>')

# Replace the inline SVG logo in the footer with the Group 56.svg file
# The footer logo looks like: <svg class="footer-logo-mark" ...> ... </svg>
footer_logo_match = re.search(r'<svg class="footer-logo-mark" [^>]+>.*?</svg>', content, re.DOTALL)
if footer_logo_match:
    new_img_tag = '<img src="assets/images/logo-white.svg" alt="Seagull Logo" class="footer-logo-mark" style="width: 85px; height: auto; margin-bottom: 20px; display: block;">'
    content = content.replace(footer_logo_match.group(0), new_img_tag)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Split completed successfully!")
