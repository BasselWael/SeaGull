with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('height="32" width="32"', 'height="64" width="64"')

with open('index.html', 'w') as f:
    f.write(html)
print("Done")
