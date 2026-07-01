import re

with open("styles.css", "r") as f:
    css = f.read()

# Make sure menu-tabs has width: 100%
css = css.replace(".menu-tabs {\n    display: flex;", ".menu-tabs {\n    display: flex;\n    width: 100%;")

with open("styles.css", "w") as f:
    f.write(css)
