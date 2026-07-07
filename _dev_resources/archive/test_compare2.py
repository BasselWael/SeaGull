import fitz

def get_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

import difflib

t1 = get_text("Design/menu el max.pdf")
t2 = get_text("Design/menu-Dokki.pdf")

diff = difflib.ndiff(t1.splitlines(), t2.splitlines())
diff_lines = [l for l in diff if l.startswith('+ ') or l.startswith('- ')]
print("Differences:", len(diff_lines))
for l in diff_lines[:20]:
    print(l)
