import re

with open("index.html", "r") as f:
    html = f.read()

append_html = """
            <div class="menu-disclaimer">
                Menu selections vary with the season and the morning's catch. <span class="text-accent">Butterfly, tagen, and potato preparations available on request.</span> Ask our staff about the day's sea-market selection.
            </div>

            <div class="menu-quote">
                <div class="quote-icon">“</div>
                <h3>“From the sea to your plate and nothing in between.”</h3>
                <p>The house philosophy, since '85</p>
            </div>
"""

# We know <div id="all-menus-container"> ends before </section> which is the end of the menu section.
pattern = r'(</div>\s*</section>\s*<!-- Footer -->)'
if re.search(pattern, html):
    new_html = re.sub(pattern, append_html + r'\1', html)
    with open("index.html", "w") as f:
        f.write(new_html)
    print("Success: Appended disclaimer and quote")
else:
    print("Error: Could not find end of menu section")
