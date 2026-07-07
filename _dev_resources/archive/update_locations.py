import re

with open("index.html", "r") as f:
    html = f.read()

locations_data = [
    {
        "id": "elmax",
        "subtitle": "The Original · Since 1985",
        "title": "El Max",
        "city": "Alexandria",
        "address": "Al Meks, Dekhela, Alexandria",
        "phone": "+20 3 310 5957",
        "hours": "Daily · 12 PM - 1 AM",
        "pin_x": "25%",
        "pin_y": "40%"
    },
    {
        "id": "marina",
        "subtitle": "Seasonal · Summer Only",
        "title": "Marina",
        "city": "North Coast · Marina El Alamein",
        "address": "Marina El Alamein, Gate 2, North Coast",
        "phone": "+20 121 233 3311",
        "hours": "Summer Season · 1 PM - 1 AM",
        "pin_x": "15%",
        "pin_y": "45%"
    },
    {
        "id": "dokki",
        "subtitle": "On the Nile",
        "title": "Dokki",
        "city": "Cairo · Opposite Cairo Tower",
        "address": "Nile Street, Ad Doqi, Giza",
        "phone": "+20 2 37494244",
        "hours": "Daily · 9 AM - 2 AM",
        "pin_x": "45%",
        "pin_y": "70%"
    },
    {
        "id": "newcairo",
        "subtitle": "New Cairo · Tagamoa",
        "title": "New Cairo",
        "city": "Cairo · East Side",
        "address": "Tagamoa, New Cairo 1, Cairo",
        "phone": "+20 121 233 3311",
        "hours": "Sun-Wed: 12 PM - 1 AM · Thu-Fri until 2 AM",
        "pin_x": "55%",
        "pin_y": "72%"
    },
    {
        "id": "gleem",
        "subtitle": "Alexandria Coast",
        "title": "Gleem",
        "city": "Alexandria",
        "address": "Gleem Bay, Alexandria",
        "phone": "+20 121 233 3311",
        "hours": "Daily · 12 PM - 2 AM",
        "pin_x": "30%",
        "pin_y": "42%"
    },
    {
        "id": "madinaty",
        "subtitle": "Cairo Suburbs",
        "title": "Madinaty",
        "city": "Cairo",
        "address": "Madinaty Open Air Mall",
        "phone": "+20 121 233 3311",
        "hours": "Daily · 12 PM - 1 AM",
        "pin_x": "65%",
        "pin_y": "70%"
    },
    {
        "id": "sheikhzayed",
        "subtitle": "West Cairo",
        "title": "Sheikh Zayed",
        "city": "Giza",
        "address": "Capital Business Park, Sheikh Zayed",
        "phone": "+20 121 233 3311",
        "hours": "Daily · 12 PM - 1 AM",
        "pin_x": "40%",
        "pin_y": "68%"
    }
]

new_locations_html = """
        <section class="locations-section" id="locations">
            <div class="locations-section-header">
                <p class="section-subtitle-locations">- Locations</p>
                <h2 class="section-title-locations">Seven houses. <br> <span class="italic-serif text-accent">One kitchen.</span></h2>
            </div>
            
            <div class="locations-white-box">
                <div class="loc-box-header">
                    <div class="loc-box-title-area">
                        <h3>An Egyptian Map</h3>
                        <p><span class="italic-serif text-accent" style="font-size: 1.5em; margin-right: 0.5rem;">Tap</span> a pin to explore the house.</p>
                        <p class="loc-box-count"><span class="italic-serif text-accent" style="font-size: 1.5em; margin-right: 0.5rem;">07</span> houses across the country</p>
                    </div>
                    <div class="loc-legend">
                        <span><span class="legend-dot dot-round"></span> OPEN YEAR-ROUND</span>
                        <span><span class="legend-dot dot-seasonal"></span> SEASONAL - SUMMER</span>
                        <span><span class="legend-dot dot-hotel"></span> BOUTIQUE HOTEL</span>
                    </div>
                </div>

                <div class="loc-box-body">
                    <div class="loc-map-side">
                        <img src="assets/images/map.svg" alt="Map" class="loc-map-img">
"""

# Add map pins
for loc in locations_data:
    active = ' active' if loc['id'] == 'marina' else ''
    # Using generic positions, we can adjust CSS later if needed
    new_locations_html += f'                        <button class="loc-pin pin-{loc["id"]}{active}" data-loc="{loc["id"]}" style="left: {loc["pin_x"]}; top: {loc["pin_y"]};"></button>\n'

new_locations_html += """                    </div>
                    <div class="loc-card-side">
"""

for loc in locations_data:
    active_style = '' if loc['id'] == 'marina' else ' style="display: none;"'
    new_locations_html += f"""                        <div class="loc-detail-card" id="detail-{loc['id']}"{active_style}>
                            <p class="card-subtitle">- {loc['subtitle']}</p>
                            <h3 class="card-title">{loc['title']}</h3>
                            <p class="card-city">{loc['city']}</p>
                            <table class="card-table">
                                <tr>
                                    <th>ADDRESS</th>
                                    <td>{loc['address']}</td>
                                </tr>
                                <tr>
                                    <th>PHONE</th>
                                    <td>{loc['phone']}</td>
                                </tr>
                                <tr>
                                    <th>HOURS</th>
                                    <td>{loc['hours']}</td>
                                </tr>
                            </table>
                            <div class="card-actions">
                                <button class="btn-card-dir">📍 DIRECTIONS</button>
                                <button class="btn-card-res">RESERVE HERE</button>
                            </div>
                        </div>
"""

new_locations_html += """                    </div>
                </div>
            </div>
        </section>
"""

pattern = r'<section class="locations-section" id="locations">.*?(?=<!-- Delivery Section -->)'
new_html = re.sub(pattern, new_locations_html + "\n        ", html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_html)

print("Updated locations HTML")
