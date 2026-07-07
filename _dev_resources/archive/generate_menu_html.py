import json

data = [
    {
        "category": "Soups",
        "category_ar": "الشوربة",
        "items": [
            {"en": "Seafood Soup", "ar": "شوربة سي فود", "desc": "Shrimp and calamari in a creamy seafood broth."},
            {"en": "Shrimp Soup", "ar": "شوربة جمبري", "desc": "Peeled shrimp simmered in a red seafood broth."}
        ]
    },
    {
        "category": "Salads & Couvert",
        "category_ar": "السلطات والمقبلات",
        "items": [
            {"en": "Couvert (per person)", "ar": "كوفير للفرد", "desc": "Our house selection of mezze-style salads."},
            {"en": "Seagull Salads", "ar": "سلطات سي جل", "desc": ""},
            {"en": "French Fries", "ar": "بطاطس محمرة", "desc": ""}
        ]
    },
    {
        "category": "Side Dishes",
        "category_ar": "أطباق جانبية",
        "items": [
            {"en": "Herring", "ar": "رنجة", "desc": "Smoked herring tossed with tahini, onions, and colourful peppers."},
            {"en": "Salt Fish (Feseekh)", "ar": "فسيخ", "desc": ""},
            {"en": "Sardines", "ar": "سردين", "desc": ""},
            {"en": "Fried Baby Fish", "ar": "بساريا مقلية", "desc": ""},
            {"en": "Seafood Kofta", "ar": "كفتة سي فود", "desc": "Calamari and shrimp minced with onions, fresh herbs, and ground rice, fried or grilled."},
            {"en": "Shrimp Molokhia", "ar": "ملوخية بالجمبري", "desc": ""},
            {"en": "Stuffed Calamari", "ar": "كاليماري محشي", "desc": ""},
            {"en": "Calamari (per kilo)", "ar": "كاليماري (بالكيلو)", "desc": ""},
            {"en": "Squid Casserole", "ar": "طاجن سبيط", "desc": "Calamari cooked in your choice of white or red sauce."},
            {"en": "Squid, Fried or Grilled", "ar": "سبيط مقلي أو مشوي", "desc": ""},
            {"en": "Squid Fajita", "ar": "فاهيتا سبيط", "desc": "Tender calamari sautéed with onions, colourful peppers, and our signature spice blend."},
            {"en": "Seafood Casserole", "ar": "طاجن سي فود", "desc": "A generous mix of calamari, shrimp, roe, and squid eggs with onions and peppers."},
            {"en": "Shrimp Casserole", "ar": "طاجن جمبري", "desc": "Fresh shrimp with onions, peppers, and creamy white sauce, served in a clay tagen."},
            {"en": "Octopus", "ar": "أخطبوط", "desc": "Prepared in tagen, grilled, or fried."},
            {"en": "Squid Eggs", "ar": "بيض سبيط", "desc": ""},
            {"en": "Grilled Chicken Meal", "ar": "وجبة دجاج مشوي", "desc": "Half-chicken grilled, served with white rice and french fries."}
        ]
    },
    {
        "category": "Fresh Fish (Market Selection)",
        "category_ar": "أسماك طازجة (حسب السوق)",
        "items": [
            {"en": "Grey Mullet", "ar": "بوري", "desc": ""},
            {"en": "Keeled Mullet", "ar": "سهيلة", "desc": ""},
            {"en": "Sea Bream", "ar": "دنيس", "desc": ""},
            {"en": "Sea Bass", "ar": "قاروص", "desc": ""},
            {"en": "Snapper", "ar": "مرجان", "desc": ""},
            {"en": "Blue Fish", "ar": "مياس", "desc": ""},
            {"en": "Red Mullet", "ar": "بربون", "desc": ""},
            {"en": "Sole Fish", "ar": "موسى", "desc": ""},
            {"en": "Grouper", "ar": "وقار", "desc": ""},
            {"en": "Grouper Steak", "ar": "ترانشات وقار", "desc": ""},
            {"en": "Salmon", "ar": "سالمون", "desc": ""},
            {"en": "Lout Fish Steak", "ar": "ترانشات لوت", "desc": ""},
            {"en": "Eel Fish", "ar": "ثعبان بحر", "desc": ""},
            {"en": "Fresh Roe (Botarga)", "ar": "بطارخ طازجة", "desc": ""},
            {"en": "Crab", "ar": "كابوريا", "desc": ""},
            {"en": "Boneless Crab", "ar": "كابوريا مخلية", "desc": ""},
            {"en": "Mussels", "ar": "بلح البحر", "desc": ""},
            {"en": "Clams (Gondofli)", "ar": "جندوفلي", "desc": ""},
            {"en": "Lobster Baladi", "ar": "استاكوزا بلدي", "desc": ""}
        ]
    },
    {
        "category": "Shrimp",
        "category_ar": "الجمبري",
        "items": [
            {"en": "Medium Shrimps", "ar": "جمبري وسط", "desc": "Prepared your way. Ask about butterfly preparation."},
            {"en": "Large Shrimps", "ar": "جمبري كبير", "desc": ""},
            {"en": "Super Shrimps", "ar": "جمبري سوبر", "desc": ""},
            {"en": "Jumbo Shrimps", "ar": "جمبري جامبو", "desc": ""},
            {"en": "Kazzaz Shrimps", "ar": "جمبري قزاز", "desc": "Available in Medium, Large, Super, and Jumbo."}
        ]
    },
    {
        "category": "Rice & Pasta",
        "category_ar": "الأرز والمكرونة",
        "items": [
            {"en": "Seagull Rice", "ar": "أرز سي جل", "desc": "Sayadeya rice topped with a mix of the day's seafood."},
            {"en": "Signature Shrimp Rice", "ar": "أرز بالجمبري", "desc": "Sayadeya rice with fresh shrimp."},
            {"en": "Seafood Rice", "ar": "أرز سي فود", "desc": "Sayadeya rice with shrimp and calamari."},
            {"en": "Sayadeya Rice", "ar": "أرز صيادية", "desc": ""},
            {"en": "Plain Pasta", "ar": "مكرونة سادة", "desc": ""},
            {"en": "Shrimp Pasta", "ar": "مكرونة بالجمبري", "desc": "With fresh shrimp, in white or red sauce."},
            {"en": "Seafood Pasta", "ar": "مكرونة سي فود", "desc": "Al dente pasta with shrimp and calamari, in spicy red or white sauce."}
        ]
    },
    {
        "category": "Shisha",
        "category_ar": "الشيشة",
        "items": [
            {"en": "Fakher Shisha", "ar": "شيشة فاخر", "desc": "Apple, Peach, Grape, Watermelon, Gum, Mint, Blueberry, Orange, Guava, Cola, Mix"}
        ]
    }
]

html = ""
for cat in data:
    html += f'                <div class="menu-category">\n'
    html += f'                    <h3 class="category-title">{cat["category"]} <span class="arabic">{cat["category_ar"]}</span></h3>\n'
    html += f'                    <ul class="menu-items">\n'
    for item in cat["items"]:
        html += f'                        <li>\n'
        html += f'                            <div class="item-header">\n'
        html += f'                                <span class="item-name">{item["en"]}</span>\n'
        html += f'                                <span class="item-name-ar">{item["ar"]}</span>\n'
        html += f'                            </div>\n'
        if item["desc"]:
            html += f'                            <p class="item-desc">{item["desc"]}</p>\n'
        html += f'                        </li>\n'
    html += f'                    </ul>\n'
    html += f'                </div>\n\n'

with open("menu_html_output.txt", "w", encoding="utf-8") as f:
    f.write(html)
