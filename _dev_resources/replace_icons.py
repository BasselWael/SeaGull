import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Talabat
talabat_regex = re.compile(r'(<div class="delivery-card talabat">.*?<div class="delivery-icon delivery-card-icon"[^>]*>)\s*<svg.*?</svg>\s*(</div>)', re.DOTALL)
html = talabat_regex.sub(r'\1<img src="icons/talabat.svg" alt="Talabat" height="32" width="32" style="margin: auto;">\2', html)

# 2. WhatsApp
whatsapp_regex = re.compile(r'(<div class="delivery-card whatsapp">.*?<div class="delivery-icon delivery-card-icon"[^>]*>)\s*<svg.*?</svg>\s*(</div>)', re.DOTALL)
html = whatsapp_regex.sub(r'\1<img src="icons/whatsapp.svg" alt="WhatsApp" height="32" width="32" style="margin: auto;">\2', html)

# 3. Call Direct
call_regex = re.compile(r'(<div class="delivery-card phone">.*?<div class="delivery-icon delivery-card-icon"[^>]*>)\s*<svg.*?</svg>\s*(</div>)', re.DOTALL)
html = call_regex.sub(r'\1<img src="icons/call.svg" alt="Call" height="32" width="32" style="margin: auto;">\2', html)

with open('index.html', 'w') as f:
    f.write(html)

print("Done")
