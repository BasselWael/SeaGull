import fitz

def get_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

text1 = get_text("Design/menu el max.pdf")
text2 = get_text("Design/menu-Dokki.pdf")
text3 = get_text("Design/menu-marina.pdf")
text4 = get_text("Design/menu-MADINATY.pdf")
text5 = get_text("Design/menu-New Cairo.pdf")
text6 = get_text("Design/menu-ELSHEIKH ZAYED.pdf")
text7 = get_text("Design/menu Gleem.pdf")

def clean(t):
    return " ".join([word for word in t.split() if "El Max" not in word and "Dokki" not in word and "Marina" not in word and "Madinaty" not in word and "Cairo" not in word and "Zayed" not in word and "Gleem" not in word])

c1 = clean(text1)
print(c1 == clean(text2), c1 == clean(text3), c1 == clean(text4), c1 == clean(text5), c1 == clean(text6), c1 == clean(text7))
