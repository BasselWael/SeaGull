import fitz

doc = fitz.open("Design/menu el max.pdf")
page = doc[0]

text = page.get_text("text")
print(text[:1000])
