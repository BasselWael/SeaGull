import re

with open("styles.css", "r") as f:
    css = f.read()

# Make gap bigger
css = css.replace("gap: 4vw;", "gap: 4rem;")

# Add flex-grow or make sure width is 100%
if "width: 100%;" not in css:
    css = css.replace("display: flex;", "display: flex;\n    width: 100%;")

with open("styles.css", "w") as f:
    f.write(css)

