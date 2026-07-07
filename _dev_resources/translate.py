import re

with open("index.html") as f:
    html = f.read()

replacements = [
    # Marina section
    (r'<h2 class="marina-exp-title">\s*<span class="italic-serif text-accent">\s*Mediterranean\.\s*</span>\s*</h2>',
     r'<h2 class="marina-exp-title">\n<span class="en-block"><span class="italic-serif text-accent">Mediterranean.</span></span>\n<span class="ar-block">صيف على المتوسط.<br/><em>من سي جل.</em></span>\n</h2>'),
    (r'<p class="marina-exp-desc">\s*<span class="dropcap">F</span>or three months each year, the <span class="en"><span class="en">Marina</span><span class="ar">مارينا</span></span><span class="ar">مارينا</span>\s*house reopens and with it, a tradition thirty years in the making\. The restaurant that defined the <span class="en"><span class="en">North Coast</span><span class="ar">الساحل الشمالي</span></span><span class="ar">الساحل الشمالي</span>\s*dining table, paired now with <span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\'s only property of its kind\.\s*</p>',
     r'<p class="marina-exp-desc">\n<span class="en"><span class="dropcap">F</span>or three months each year, the Marina house reopens — and with it, a tradition thirty years in the making. The restaurant that defined the North Coast dining table, paired now with Seagull\'s only property of its kind.</span>\n<span class="ar">لثلاثة شهور كل عام، يُعاد فتح بيت مارينا — ومعه تقليد عمره ثلاثون عامًا. المطعم الذي شكّل مائدة الساحل الشمالي، مقترنًا الآن بملكيّة سي جل الوحيدة من نوعها.</span>\n</p>'),
    (r'<p class="marina-exp-card-desc">\s*Our <span class="en"><span class="en">El Max</span><span class="ar">المكس</span></span><span class="ar">المكس</span>\s*house is where the coast comes to eat the day\'s catch laid out on ice, the charcoal already lit, the sunset doing the rest\. Open three months each summer\.\s*<br/>\s*<span class="italic-serif text-accent">\s*Reservations\s*</span>\s*essential during peak weeks\.\s*</p>',
     r'<p class="marina-exp-card-desc">\n<span class="en">Our El Max house is where the coast comes to eat — the day\'s catch laid out on ice, the charcoal already lit, the sunset doing the rest. Open three months each summer. <br/><span class="italic-serif text-accent">Reservations</span> essential during peak weeks.</span>\n<span class="ar">بيت المكس الخاص بنا هو المكان الذي يأتي إليه الساحل لتناول الطعام — صيد اليوم معروض على الثلج، الفحم مشتعل بالفعل، وغروب الشمس يتكفل بالباقي. يفتح أبوابه لثلاثة أشهر كل صيف. <br/><span class="italic-serif text-accent">الحجوزات</span> ضرورية خلال أسابيع الذروة.</span>\n</p>'),
    (r'<span class="marina-exp-address"><span class="en"><span class="en">Marina</span><span class="ar">مارينا</span></span><span class="ar">مارينا</span>\s*El Alamein - Gate 2</span>',
     r'<span class="marina-exp-address"><span class="en">Marina El Alamein - Gate 2</span><span class="ar">مارينا العلمين - بوابة ٢</span></span>'),
    (r'<p class="marina-exp-card-desc">\s*Our only boutique property\. Rooms and suites on the water, a <span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\s*kitchen steps from the lobby, and the Mediterranean at the door\.\s*<br/>\s*For guests who want the whole summer not just dinner\.\s*</p>',
     r'<p class="marina-exp-card-desc">\n<span class="en">Our only boutique property. Rooms and suites on the water, a Seagull kitchen steps from the lobby, and the Mediterranean at the door.<br/>For guests who want the whole summer — not just dinner.</span>\n<span class="ar">ملكيتنا البوتيكية الوحيدة. غرف وأجنحة على الماء، مطبخ سي جل على بُعد خطوات من البهو، والبحر الأبيض المتوسط عند الباب.<br/>للضيوف الذين يريدون الصيف بأكمله — وليس فقط العشاء.</span>\n</p>'),
    (r'<span class="marina-exp-address"><span class="en"><span class="en">Marina</span><span class="ar">مارينا</span></span><span class="ar">مارينا</span>\s*El Alamein -\s*<span class="en"><span class="en">North Coast</span><span class="ar">الساحل الشمالي</span></span><span class="ar">الساحل الشمالي</span></span>',
     r'<span class="marina-exp-address"><span class="en">Marina El Alamein - North Coast</span><span class="ar">مارينا العلمين - الساحل الشمالي</span></span>'),
    
    # Delivery section
    (r'<p class="section-subtitle">Delivery &amp; Takeaway</p>',
     r'<p class="section-subtitle"><span class="en">Delivery &amp; Takeaway</span><span class="ar">التوصيل والتيك أواي</span></p>'),
    (r'<h2 class="section-title">The sea — <span class="italic-serif text-accent">Delivered\.</span></h2>',
     r'<h2 class="section-title"><span class="en-block">The sea — <span class="italic-serif text-accent">Delivered.</span></span><span class="ar-block">البحر — <span class="italic-serif text-accent">يصلك أينما كنت.</span></span></h2>'),
    (r'<p>Our full menu, delivered across Cairo and <span class="en"><span class="en">Alexandria</span><span class="ar">الإسكندرية</span></span><span class="ar">الإسكندرية</span> via Talabat\.</p>',
     r'<p><span class="en">Our full menu, delivered across Cairo and Alexandria via Talabat.</span><span class="ar">قائمتنا الكاملة، نوصلها لك في جميع أنحاء القاهرة والإسكندرية عبر طلبات.</span></p>'),
     
    # Reviews Section
    (r'<h2 class="reviews-title">Four decades\.<br/><span class="reviews-title-italic">Thousands of tables\.</span></h2>',
     r'<h2 class="reviews-title"><span class="en-block">Four decades.<br/><span class="reviews-title-italic">Thousands of tables.</span></span><span class="ar-block">أربعة عقود.<br/><span class="reviews-title-italic">آلاف الطاولات.</span></span></h2>'),
    (r'<p class="reviews-average">Average across 18,000\+ reviews · Google &amp; TripAdvisor</p>',
     r'<p class="reviews-average"><span class="en">Average across 18,000+ reviews · Google &amp; TripAdvisor</span><span class="ar">التقييم المتوسط من ١٨,٠٠٠+ مراجعة · جوجل وتريب أدفايزور</span></p>'),
     
    # Review Cards
    (r'<div class="review-stars">★ ★ ★ ★ ★</div>',
     r'<div class="review-stars"><span class="en">★ ★ ★ ★ ★</span><span class="ar">★ ★ ★ ★ ★</span></div>'),
    (r'<p class="review-quote">"Fresh catches, professional service, and a setting right on the water\. A must-visit in Egypt\."</p>',
     r'<p class="review-quote"><span class="en">"Fresh catches, professional service, and a setting right on the water. A must-visit in Egypt."</span><span class="ar">"أسماك طازجة، خدمة احترافية، وأجواء رائعة على الماء. مكان لا بد من زيارته في مصر."</span></p>'),
    (r'<span class="author-name">Laila A\.</span>',
     r'<span class="author-name"><span class="en">Laila A.</span><span class="ar">ليلى أ.</span></span>'),
    (r'<span class="author-source">· Google Review</span>',
     r'<span class="author-source"><span class="en">· Google Review</span><span class="ar">· مراجعة جوجل</span></span>'),
    (r'<p class="review-quote">"From starters to mains everything fresh\. Decor is gorgeous, staff calm and accommodating\."</p>',
     r'<p class="review-quote"><span class="en">"From starters to mains everything fresh. Decor is gorgeous, staff calm and accommodating."</span><span class="ar">"من المقبلات إلى الأطباق الرئيسية، كل شيء طازج. الديكور رائع وطاقم العمل هادئ ومتعاون."</span></p>'),
    (r'<span class="author-name">Ahmed K\.</span>',
     r'<span class="author-name"><span class="en">Ahmed K.</span><span class="ar">أحمد ك.</span></span>'),
    (r'<span class="author-name">Omar R\.</span>',
     r'<span class="author-name"><span class="en">Omar R.</span><span class="ar">عمر ر.</span></span>'),
    (r'<p class="review-quote">"The best seafood experience I\'ve had in a long time\. Everything was cooked to perfection\."</p>',
     r'<p class="review-quote"><span class="en">"The best seafood experience I\'ve had in a long time. Everything was cooked to perfection."</span><span class="ar">"أفضل تجربة مأكولات بحرية حظيت بها منذ وقت طويل. كل شيء كان مطبوخًا بإتقان."</span></p>'),
    (r'<span class="author-name">Sara M\.</span>',
     r'<span class="author-name"><span class="en">Sara M.</span><span class="ar">سارة م.</span></span>'),
    (r'<span class="author-source">· TripAdvisor</span>',
     r'<span class="author-source"><span class="en">· TripAdvisor</span><span class="ar">· تريب أدفايزور</span></span>'),
     
    # Featured Section
    (r'<h3 class="featured-card-title">Cairo<br/><span class="italic-serif text-accent">360</span></h3>',
     r'<h3 class="featured-card-title"><span class="en">Cairo<br/><span class="italic-serif text-accent">360</span></span><span class="ar">القاهرة<br/><span class="italic-serif text-accent">٣٦٠</span></span></h3>'),
    (r'<p class="featured-quote">"Not to be missed" for lovers of all things fishy, with menus "beyond excellent\."</p>',
     r'<p class="featured-quote"><span class="en">"Not to be missed" for lovers of all things fishy, with menus "beyond excellent."</span><span class="ar">"لا ينبغي تفويته" لمحبي المأكولات البحرية، مع قوائم طعام "ممتازة حقًا."</span></p>'),
    (r'<a href="#" class="featured-link">READ THE REVIEW ⟶</a>',
     r'<a href="#" class="featured-link"><span class="en">READ THE REVIEW ⟶</span><span class="ar">اقرأ المراجعة ⟶</span></a>'),
     
    (r'<h3 class="featured-card-title">Local Guide<br/><span class="italic-serif text-accent">to Egypt</span></h3>',
     r'<h3 class="featured-card-title"><span class="en">Local Guide<br/><span class="italic-serif text-accent">to Egypt</span></span><span class="ar">الدليل المحلي<br/><span class="italic-serif text-accent">لمصر</span></span></h3>'),
    (r'<p class="featured-quote">A family favourite since 1993 - <span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\'s <span class="en"><span class="en">Zamalek</span><span class="ar">الزمالك</span></span><span class="ar">الزمالك</span>\s*branch is a docked boat across from the Cairo Tower\.</p>',
     r'<p class="featured-quote"><span class="en">A family favourite since 1993 - Seagull\'s Zamalek branch is a docked boat across from the Cairo Tower.</span><span class="ar">مفضل للعائلات منذ عام ١٩٩٣ - فرع سي جل بالزمالك عبارة عن مركب راسي مقابل برج القاهرة.</span></p>'),
    (r'<a href="#" class="featured-link">READ THE FEATURE ⟶</a>',
     r'<a href="#" class="featured-link"><span class="en">READ THE FEATURE ⟶</span><span class="ar">اقرأ المقال ⟶</span></a>'),
     
    (r'<h3 class="featured-card-title">Wander<br/><span class="italic-serif text-accent">log</span></h3>',
     r'<h3 class="featured-card-title"><span class="en">Wander<br/><span class="italic-serif text-accent">log</span></span><span class="ar">واندر<br/><span class="italic-serif text-accent">لوج</span></span></h3>'),
    (r'<a href="#" class="featured-link">VIEW THE LIST ⟶</a>',
     r'<a href="#" class="featured-link"><span class="en">VIEW THE LIST ⟶</span><span class="ar">عرض القائمة ⟶</span></a>'),
     
    # Instagram Title
    (r'<h2 class="insta-title">@<span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>RestaurantEgy</h2>',
     r'<h2 class="insta-title"><span class="en">@SeagullRestaurantEgy</span><span class="ar">@SeagullRestaurantEgy</span></h2>'),
     
    # FAQ Section
    (r'<h2 class="section-title">Before you <br/> <span class="italic-serif text-accent">drop anchor\.</span></h2>',
     r'<h2 class="section-title"><span class="en-block">Before you <br/> <span class="italic-serif text-accent">drop anchor.</span></span><span class="ar-block">قبل أن <br/> <span class="italic-serif text-accent">تلقي المرساة.</span></span></h2>'),
    (r'<button class="accordion-header">Do I need to make a reservation\?</button>',
     r'<button class="accordion-header"><span class="en">Do I need to make a reservation?</span><span class="ar">هل يجب الحجز المسبق؟</span></button>'),
    (r'<p>Walk-ins are always welcome, and on quiet weekdays you\'ll rarely wait\. That said, our Nile-side <span class="en"><span class="en">Zamalek</span><span class="ar">الزمالك</span></span><span class="ar">الزمالك</span>\s*branch, <span class="en"><span class="en">El Max</span><span class="ar">المكس</span></span><span class="ar">المكس</span>, and peak weekend nights fill quickly — we strongly recommend reserving ahead for groups of four or more, or for any holiday, Eid, or Ramadan iftar\.</p>',
     r'<p><span class="en">Walk-ins are always welcome, and on quiet weekdays you\'ll rarely wait. That said, our Nile-side Zamalek branch, El Max, and peak weekend nights fill quickly — we strongly recommend reserving ahead for groups of four or more, or for any holiday, Eid, or Ramadan iftar.</span><span class="ar">نرحب دائمًا بالضيوف بدون حجز مسبق، ونادرًا ما تضطر للانتظار في أيام الأسبوع الهادئة. ومع ذلك، فإن فرعنا في الزمالك على ضفاف النيل، وفرع المكس، وليالي عطلة نهاية الأسبوع المزدحمة تمتلئ بسرعة — نوصي بشدة بالحجز المسبق للمجموعات المكونة من أربعة أشخاص أو أكثر، أو لأي عطلة أو عيد أو إفطار في رمضان.</span></p>'),
    (r'<button class="accordion-header">Is parking available\?</button>',
     r'<button class="accordion-header"><span class="en">Is parking available?</span><span class="ar">هل تتوفر مواقف للسيارات؟</span></button>'),
    (r'<p>Yes, all our locations offer valet parking or dedicated parking areas for guests\.</p>',
     r'<p><span class="en">Yes, all our locations offer valet parking or dedicated parking areas for guests.</span><span class="ar">نعم، تتوفر خدمة صف السيارات أو مواقف مخصصة للسيارات للضيوف في جميع فروعنا.</span></p>'),
    (r'<button class="accordion-header">Do you serve alcohol\?</button>',
     r'<button class="accordion-header"><span class="en">Do you serve alcohol?</span><span class="ar">هل تقدمون المشروبات الكحولية؟</span></button>'),
    (r'<p>No, <span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\s*is an alcohol-free establishment\.</p>',
     r'<p><span class="en">No, Seagull is an alcohol-free establishment.</span><span class="ar">لا، سي جل مؤسسة خالية من المشروبات الكحولية.</span></p>'),
    (r'<button class="accordion-header">Are you family-friendly\?</button>',
     r'<button class="accordion-header"><span class="en">Are you family-friendly?</span><span class="ar">هل المكان مناسب للعائلات؟</span></button>'),
    (r'<p>Absolutely\. We welcome families and have dedicated menus and high chairs available\.</p>',
     r'<p><span class="en">Absolutely. We welcome families and have dedicated menus and high chairs available.</span><span class="ar">بالتأكيد. نرحب بالعائلات ولدينا قوائم طعام مخصصة وكراسي للأطفال.</span></p>'),
    (r'<button class="accordion-header">What is the dress code\?</button>',
     r'<button class="accordion-header"><span class="en">What is the dress code?</span><span class="ar">ما هي قواعد اللباس؟</span></button>'),
    (r'<p>Our atmosphere is relaxed and welcoming\. Smart casual is perfect for dinner, while daytime dining is strictly casual\.</p>',
     r'<p><span class="en">Our atmosphere is relaxed and welcoming. Smart casual is perfect for dinner, while daytime dining is strictly casual.</span><span class="ar">أجواؤنا مريحة وترحيبية. الملابس الكاجوال الأنيقة مثالية للعشاء، بينما الملابس الكاجوال العادية مناسبة تمامًا في النهار.</span></p>'),
    (r'<button class="accordion-header">Do you have vegetarian options\?</button>',
     r'<button class="accordion-header"><span class="en">Do you have vegetarian options?</span><span class="ar">هل لديكم خيارات نباتية؟</span></button>'),
    (r'<p>While we specialize in seafood, we offer a variety of vegetarian-friendly mezza, salads, and sides\.</p>',
     r'<p><span class="en">While we specialize in seafood, we offer a variety of vegetarian-friendly mezza, salads, and sides.</span><span class="ar">بينما نحن متخصصون في المأكولات البحرية، إلا أننا نقدم مجموعة متنوعة من المقبلات والسلطات والأطباق الجانبية المناسبة للنباتيين.</span></p>'),
    (r'<button class="accordion-header">Are you open during Ramadan\?</button>',
     r'<button class="accordion-header"><span class="en">Are you open during Ramadan?</span><span class="ar">هل تفتحون في رمضان؟</span></button>'),
    (r'<p>Yes, during Ramadan we open exclusively for Iftar and Sohour\. <span class="italic-serif text-accent">Reservations</span> are highly recommended\.</p>',
     r'<p><span class="en">Yes, during Ramadan we open exclusively for Iftar and Sohour. <span class="italic-serif text-accent">Reservations</span> are highly recommended.</span><span class="ar">نعم، خلال شهر رمضان نفتح حصريًا للإفطار والسحور. <span class="italic-serif text-accent">الحجوزات</span> يوصى بها بشدة.</span></p>'),
    (r'<button class="accordion-header">Do you deliver\?</button>',
     r'<button class="accordion-header"><span class="en">Do you deliver?</span><span class="ar">هل تتوفر خدمة التوصيل؟</span></button>'),
    (r'<p>Yes, we offer delivery and takeaway across all our locations\. You can order online or call us directly\.</p>',
     r'<p><span class="en">Yes, we offer delivery and takeaway across all our locations. You can order online or call us directly.</span><span class="ar">نعم، نقدم خدمة التوصيل والتيك أواي في جميع فروعنا. يمكنك الطلب عبر الإنترنت أو الاتصال بنا مباشرةً.</span></p>'),
    (r'<button class="accordion-header">Can I book Seagull for an event\?</button>',
     r'<button class="accordion-header"><span class="en">Can I book Seagull for an event?</span><span class="ar">هل يمكنني حجز سي جل لمناسبة خاصة؟</span></button>'),
    (r'<p>Absolutely\. We host everything from intimate family gatherings to large corporate events and weddings\. Please contact our events team\.</p>',
     r'<p><span class="en">Absolutely. We host everything from intimate family gatherings to large corporate events and weddings. Please contact our events team.</span><span class="ar">بالتأكيد. نستضيف كل شيء بدءًا من التجمعات العائلية الحميمة إلى فعاليات الشركات الكبيرة وحفلات الزفاف. يرجى التواصل مع فريق الفعاليات لدينا.</span></p>'),
     
    # Footer CTA
    (r'<h2 class="footer-cta-title">Join us at <br/><span class="italic-serif text-accent">the table\.</span></h2>',
     r'<h2 class="footer-cta-title"><span class="en-block">Join us at <br/><span class="italic-serif text-accent">the table.</span></span><span class="ar-block">انضم إلينا على <br/><span class="italic-serif text-accent">الطاولة.</span></span></h2>'),
    (r'<p class="footer-cta-desc">\s*<span class="italic-serif text-accent">\s*Open daily\s*</span>\s*for lunch, dinner, and private events across all seven <span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\s*houses\. For larger groups or full-venue bookings, please call us directly\.\s*</p>',
     r'<p class="footer-cta-desc">\n<span class="en"><span class="italic-serif text-accent">Open daily</span> for lunch, dinner, and private events across all seven Seagull houses. For larger groups or full-venue bookings, please call us directly.</span>\n<span class="ar"><span class="italic-serif text-accent">نفتح يوميًا</span> للغداء والعشاء والمناسبات الخاصة في جميع مطاعم سي جل السبعة. للمجموعات الكبيرة أو حجز المكان بالكامل، يرجى الاتصال بنا مباشرةً.</span>\n</p>'),
     
    # Footer Navigation
    (r'<a href="#">FACEBOOK</a>',
     r'<a href="#"><span class="en">FACEBOOK</span><span class="ar">فيسبوك</span></a>'),
    (r'<a href="#">INSTAGRAM</a>',
     r'<a href="#"><span class="en">INSTAGRAM</span><span class="ar">إنستغرام</span></a>'),
    (r'<a href="#">TRIP ADVISOR</a>',
     r'<a href="#"><span class="en">TRIP ADVISOR</span><span class="ar">تريب أدفايزور</span></a>'),
    (r'<a href="#">HELLO@SEAGULL\.EG</a>',
     r'<a href="#"><span class="en">HELLO@SEAGULL.EG</span><span class="ar">HELLO@SEAGULL.EG</span></a>'),
     
    # Footer Cities
    (r'<p>· Cairo · <span class="en"><span class="en">Alexandria</span><span class="ar">الإسكندرية</span></span><span class="ar">الإسكندرية</span> · <span class="en"><span class="en">North Coast</span><span class="ar">الساحل الشمالي</span></span><span class="ar">الساحل الشمالي</span> ·</p>',
     r'<p><span class="en">· Cairo · Alexandria · North Coast ·</span><span class="ar">· القاهرة · الإسكندرية · الساحل الشمالي ·</span></p>'),
     
    # Modal Strings
    (r'<p class="modal-desc">Share a few details and we\'ll confirm your table via <span class="en"><span class="en">WhatsApp</span><span class="ar">واتساب</span></span><span class="ar">واتساب</span>\s*within the hour\.</p>',
     r'<p class="modal-desc"><span class="en">Share a few details and we\'ll confirm your table via WhatsApp within the hour.</span><span class="ar">شارك بضع تفاصيل وسنؤكد طاولتك عبر واتساب خلال ساعة.</span></p>'),
    (r'<button type="button" class="btn-dark full-width mt-large" onclick="submitReservation\(\)">Send Via Whatsapp</button>',
     r'<button type="button" class="btn-dark full-width mt-large" onclick="submitReservation()"><span class="en">Send Via Whatsapp</span><span class="ar">إرسال عبر واتساب</span></button>'),
    (r'<p class="form-note text-center">Your details open a pre-filled <span class="en"><span class="en">WhatsApp</span><span class="ar">واتساب</span></span><span class="ar">واتساب</span>\s*message to our reservations team\.</p>',
     r'<p class="form-note text-center"><span class="en">Your details open a pre-filled WhatsApp message to our reservations team.</span><span class="ar">بياناتك ستفتح رسالة واتساب معدة مسبقًا لفريق الحجوزات لدينا.</span></p>'),
     
    (r'<h2 class="section-title">Host with <span class="italic-serif text-accent"><span class="en"><span class="en">Seagull</span><span class="ar">سي جل</span></span><span class="ar">سي جل</span>\.</span></h2>',
     r'<h2 class="section-title"><span class="en-block">Host with <span class="italic-serif text-accent">Seagull.</span></span><span class="ar-block">استضف مع <span class="italic-serif text-accent">سي جل.</span></span></h2>'),
    (r'<button type="button" class="btn-dark full-width mt-large" onclick="submitEvents\(\)">Submit Inquiry</button>',
     r'<button type="button" class="btn-dark full-width mt-large" onclick="submitEvents()"><span class="en">Submit Inquiry</span><span class="ar">إرسال الاستفسار</span></button>'),
    (r'<label>Role of Interest</label>',
     r'<label><span class="en">Role of Interest</span><span class="ar">الدور الوظيفي</span></label>')
]

for pat, rep in replacements:
    html = re.sub(pat, rep, html, flags=re.IGNORECASE)

with open("index.html", "w") as f:
    f.write(html)
print("Done")
'
