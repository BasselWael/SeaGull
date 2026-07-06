import re
from html.parser import HTMLParser

# First, extract all EN->AR mappings from seagull-website-8.html
with open("seagull-website-8.html") as f:
    ref_html = f.read()

mappings = {}

# Match <span class="en">...</span>\s*<span class="ar">...</span>
pattern_inline = re.compile(r'<span class="en[^"]*">([^<]+)</span>\s*<span class="ar[^"]*">([^<]+)</span>')
for match in pattern_inline.finditer(ref_html):
    en_text = match.group(1).strip()
    ar_text = match.group(2).strip()
    if en_text and ar_text:
        # replace multiple spaces/newlines
        en_clean = re.sub(r'\s+', ' ', en_text)
        ar_clean = re.sub(r'\s+', ' ', ar_text)
        mappings[en_clean] = ar_clean

# Match blocks
pattern_block = re.compile(r'<span class="en-block">([\s\S]*?)</span>\s*<span class="ar-block">([\s\S]*?)</span>')
for match in pattern_block.finditer(ref_html):
    en_html = match.group(1).strip()
    ar_html = match.group(2).strip()
    # simplify by stripping tags for matching, or just mapping raw html
    en_clean = re.sub(r'\s+', ' ', en_html).replace('<br/>', '<br>')
    mappings[en_clean] = ar_html

with open("index.html") as f:
    text = f.read()

# We have manual ones to replace first based on my manual review of the remaining texts
replacements = [
    # Delivery
    ('<h3>Talabat</h3>', '<h3><span class="en">Talabat</span><span class="ar">طلبات</span></h3>'),
    ('<p>Our full menu, delivered across Cairo and Alexandria via Talabat.</p>', '<p><span class="en">Our full menu, delivered across Cairo and Alexandria via Talabat.</span><span class="ar">قائمتنا الكاملة، تصلك في جميع أنحاء القاهرة والإسكندرية عبر طلبات.</span></p>'),
    ('<button class="btn-primary btn-small">ORDER ON TALABAT</button>', '<button class="btn-primary btn-small"><span class="en">ORDER ON TALABAT</span><span class="ar">اطلب عبر طلبات</span></button>'),
    ('<button class="btn-success btn-small">CHAT ON WHATSAPP</button>', '<button class="btn-success btn-small"><span class="en">CHAT ON WHATSAPP</span><span class="ar">تواصل عبر واتساب</span></button>'),

    # Reviews
    ('<h2 class="reviews-title">\n        Four decades. <span class="reviews-title-italic">Thousands of tables.</span>\n      </h2>', '<h2 class="reviews-title">\n        <span class="en-block">Four decades. <span class="reviews-title-italic">Thousands of tables.</span></span>\n        <span class="ar-block">أربعة عقود. <span class="reviews-title-italic">وآلاف الطاولات.</span></span>\n      </h2>'),
    ('<p class="reviews-average">Average across 18,000+ reviews · Google & TripAdvisor</p>', '<p class="reviews-average"><span class="en">Average across 18,000+ reviews · Google & TripAdvisor</span><span class="ar">متوسط التقييم عبر أكثر من ١٨,٠٠٠ مراجعة · جوجل وتريب أدفايزر</span></p>'),
    
    # "AS FEATURED IN"
    ('<h2 class="featured-main-title">AS FEATURED IN</h2>', '<h2 class="featured-main-title"><span class="en">AS FEATURED IN</span><span class="ar">كما ظهر في</span></h2>'),
    ('<a href="#" class="featured-link">READ THE REVIEW ⟶</a>', '<a href="#" class="featured-link"><span class="en">READ THE REVIEW ⟶</span><span class="ar">اقرأ المراجعة ⟶</span></a>'),
    ('<a href="#" class="featured-link">READ THE FEATURE ⟶</a>', '<a href="#" class="featured-link"><span class="en">READ THE FEATURE ⟶</span><span class="ar">اقرأ المقال ⟶</span></a>'),
    ('<a href="#" class="featured-link">VIEW THE LIST ⟶</a>', '<a href="#" class="featured-link"><span class="en">VIEW THE LIST ⟶</span><span class="ar">شاهد القائمة ⟶</span></a>'),

    # FAQ
    ('<h2 class="section-title">Before you <br> <span class="italic-serif text-accent">drop anchor.</span></h2>', '    <h2 class="section-title">\n      <span class="en-block">Before you<br/><em>drop anchor.</em></span>\n      <span class="ar-block">قبل أن<br/><em>ترسو عندنا.</em></span>\n    </h2>'),
    ('<strong>HOTLINE</strong>', '<strong><span class="en">HOTLINE</span><span class="ar">الخط الساخن</span></strong>'),
    ('<strong>WHATSAPP</strong>', '<strong><span class="en">WHATSAPP</span><span class="ar">واتساب</span></strong>'),

    # CTA Footer
    ('<h2 class="footer-cta-title">Join us at <br> <span class="italic-serif text-accent">the table.</span></h2>', '<h2 class="footer-cta-title">\n      <span class="en-block">Join us at<br/><em>the table.</em></span>\n      <span class="ar-block">انضم إلينا<br/><em>على الطاولة.</em></span>\n    </h2>'),
    ('<p class="footer-cta-desc">Open daily from 12 PM to 2 AM <br> for lunch, dinner, and private events across all seven houses. For larger groups or full-venue bookings, please call us directly.</p>', '<p class="footer-cta-desc">\n      <span class="en">Open daily from 12 PM to 2 AM<br/>for lunch, dinner, and private events across all seven houses. For larger groups or full-venue bookings, please call us directly.</span>\n      <span class="ar">مفتوح يوميًا من ١٢ ظهرًا حتى ٢ صباحًا<br/>للغداء والعشاء والمناسبات الخاصة في جميع فروعنا السبعة. للمجموعات الكبيرة أو حجز الفرع بالكامل، يرجى الاتصال بنا مباشرة.</span>\n    </p>'),
    
    # Modals - Events
    ('<h2 class="section-title">Host with <br> <span class="italic-serif text-accent">Seagull</span></h2>', '<h2 class="section-title"><span class="en-block">Host with<br/><em>Seagull</em></span><span class="ar-block">نظّم مناسبتك<br/><em>مع سي جل</em></span></h2>'),
    ('<p class="modal-desc">Share a few details and our events team will contact you shortly.</p>', '<p class="modal-desc"><span class="en">Share a few details and our events team will contact you shortly.</span><span class="ar">شاركنا بعض التفاصيل وسيتواصل معك فريق المناسبات قريباً.</span></p>'),
    ('<button type="button" class="btn-dark full-width mt-large" onclick="submitEvents()">Submit Inquiry</button>', '<button type="button" class="btn-dark full-width mt-large" onclick="submitEvents()"><span class="en">Submit Inquiry</span><span class="ar">إرسال الطلب</span></button>'),
    
    # Modals - Careers
    ('<p class="section-subtitle">Join Us</p>', '<p class="section-subtitle"><span class="en">Join Us</span><span class="ar">انضم إلينا</span></p>'),
    ('<h2 class="section-title">Careers</h2>', '<h2 class="section-title"><span class="en">Careers</span><span class="ar">الوظائف</span></h2>'),
    ('<p class="modal-desc">We are always looking for passionate individuals to join our growing team.</p>', '<p class="modal-desc"><span class="en">We are always looking for passionate individuals to join our growing team.</span><span class="ar">نبحث دائماً عن الشغوفين للانضمام إلى فريقنا المتنامي.</span></p>'),
    ('<button type="button" class="btn-dark full-width mt-large" onclick="submitCareers()">Submit Application</button>', '<button type="button" class="btn-dark full-width mt-large" onclick="submitCareers()"><span class="en">Submit Application</span><span class="ar">إرسال الطلب</span></button>')
]

for src, tgt in replacements:
    text = text.replace(src, tgt)

# More dynamic replacements for remaining FAQ questions/answers
for m_en, m_ar in mappings.items():
    if m_en in text and "<span class=\"en\">" not in m_en:
        # replace plain text with bilingual
        text = text.replace(f">{m_en}<", f"><span class=\"en\">{m_en}</span><span class=\"ar\">{m_ar}</span><")
        # Handle cases where it is inside a button or p without exact match of > <
        text = text.replace(f">{m_en}\n", f"><span class=\"en\">{m_en}</span><span class=\"ar\">{m_ar}</span>\n")

with open("index.html", "w") as f:
    f.write(text)

print("Done")
