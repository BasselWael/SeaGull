with open("script.js", "r") as f:
    text = f.read()

# Replace the trailing mess
text = text.replace("    });\n\n    });\n\n});", "});")
text = text.replace("    });\n\n});", "});")

with open("script.js", "w") as f:
    f.write(text)
