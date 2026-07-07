import re

with open("index.html", "r") as f:
    html = f.read()

custom_map_html = """
                        <!-- Custom Code-Generated Map -->
                        <div class="custom-map-bg">
                            <div class="map-sea">
                                <span class="sea-label">THE MEDITERRANEAN</span>
                                <svg class="fish-svg" style="left: 10%; top: 60%;" viewBox="0 0 100 30"><ellipse cx="50" cy="15" rx="40" ry="10" fill="rgba(0,0,0,0.05)"/><circle cx="95" cy="15" r="5" fill="rgba(0,0,0,0.05)"/></svg>
                                <svg class="fish-svg" style="left: 70%; top: 30%; transform: scale(1.5);" viewBox="0 0 100 30"><ellipse cx="50" cy="15" rx="40" ry="10" fill="rgba(0,0,0,0.05)"/><circle cx="95" cy="15" r="5" fill="rgba(0,0,0,0.05)"/></svg>
                            </div>
                            <div class="map-land">
                                <span class="land-label" style="left: 15%; top: 15%;">NORTH COAST<br><span style="font-size:0.8em">الساحل الشمالي</span></span>
                                <span class="land-label" style="left: 35%; top: 20%;">ALEXANDRIA<br><span style="font-size:0.8em">الإسكندرية</span></span>
                                <span class="land-label" style="left: 60%; top: 65%;">CAIRO<br><span style="font-size:0.8em">القاهرة</span></span>
                                
                                <svg class="nile-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <!-- Nile Delta Branches -->
                                    <path d="M 50,70 Q 48,35 32,0" fill="none" stroke="#9bc4cb" stroke-width="0.8" />
                                    <path d="M 50,70 Q 52,35 62,0" fill="none" stroke="#9bc4cb" stroke-width="0.8" />
                                    <!-- Main River -->
                                    <path d="M 50,100 L 50,70" fill="none" stroke="#9bc4cb" stroke-width="0.8" />
                                </svg>
                            </div>
                        </div>

                        <!-- Pins -->
                        <div class="pin-wrapper" style="left: 15%; top: 20%;">
                            <button class="loc-pin pin-marina active" data-loc="marina"></button>
                            <span class="pin-label">Marina</span>
                        </div>
                        <div class="pin-wrapper" style="left: 30%; top: 25%;">
                            <button class="loc-pin pin-elmax" data-loc="elmax"></button>
                            <span class="pin-label">El Max</span>
                        </div>
                        <div class="pin-wrapper" style="left: 38%; top: 27%;">
                            <button class="loc-pin " data-loc="gleem"></button>
                            <span class="pin-label">Gleem</span>
                        </div>
                        <div class="pin-wrapper" style="left: 45%; top: 75%;">
                            <button class="loc-pin " data-loc="sheikhzayed"></button>
                            <span class="pin-label">Sheikh Zayed</span>
                        </div>
                        <div class="pin-wrapper" style="left: 52%; top: 68%;">
                            <button class="loc-pin " data-loc="dokki"></button>
                            <span class="pin-label">Dokki</span>
                        </div>
                        <div class="pin-wrapper" style="left: 62%; top: 72%;">
                            <button class="loc-pin " data-loc="newcairo"></button>
                            <span class="pin-label">New Cairo</span>
                        </div>
                        <div class="pin-wrapper" style="left: 70%; top: 67%;">
                            <button class="loc-pin " data-loc="madinaty"></button>
                            <span class="pin-label">Madinaty</span>
                        </div>
"""

# Replace everything from <img src="assets/images/map.svg" to the end of the pins
pattern = r'<img src="assets/images/map.svg".*?(?=</div>\s*<div class="loc-card-side">)'
new_html = re.sub(pattern, custom_map_html, html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_html)
