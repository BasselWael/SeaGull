import re

with open("styles.css", "r") as f:
    css = f.read()

# Fix the border issue by adding it to a wrapper, or simply using a box-shadow that extends infinitely, or something else.
# Wait, let's just make the gap bigger, maybe `gap: 4vw;`.
css = css.replace("gap: 2.5rem;", "gap: 4vw;")

with open("styles.css", "w") as f:
    f.write(css)

