"""Single source of truth for the editable site content.

Mirrors EXACTLY what the site rendered before the Studio was introduced, so seeding
the database (or hitting "reset to defaults") never changes the visual result.

Every user-facing string is a bilingual object: {"el": "...", "en": "..."}.
"""

from copy import deepcopy


def T(el: str, en: str) -> dict:
    return {"el": el, "en": en}


DEFAULT_CONTENT = {
    "seo": {
        "title": T(
            "SocialGrowth — Social Media & Video Agency",
            "SocialGrowth — Social Media & Video Agency",
        ),
        "description": T(
            "Παράγουμε short-form videos που πουλάνε. TikTok, Instagram, Facebook & YouTube.",
            "Short-form video that actually sells. TikTok, Instagram, Facebook & YouTube.",
        ),
    },
    "brand": {
        "name": "Social",
        "nameAccent": "Growth",
        "logo": "/logo.png",
        "heroImage": "/logo.png",
        "email": "socialstartupagency@gmail.com",
        "phone": "",
        "location": "",
        "socials": {"ig": "", "tt": "", "fb": "", "yt": ""},
    },
    "theme": {
        "accent": "#60d6ff",
        "accentDeep": "#2563eb",
        "accentSoft": "#a8ecff",
        "grain": True,
        "glows": True,
        "gridLines": True,
        "bg": "#050505",
        "surface": "#0a0a0c",
        "cardRadius": 24,
        "borderColor": "#ffffff",
        "borderOpacity": 8,
        "containerWidth": 1240,
        "fonts": {
            "display": "Bricolage Grotesque",
            "body": "Manrope",
            "scale": 100,
            "headingWeight": 800,
        },
        "buttons": {
            "shape": "pill",
            "size": "md",
            "primaryBg": "#ffffff",
            "primaryText": "#000000",
            "secondaryStyle": "outline",
            "showIcons": True,
        },
        "icons": {"style": "soft", "size": 100},
    },
    "nav": {
        "cta": T("Ξεκίνα τώρα", "Get started"),
        "showLangSwitch": True,
        "showCta": True,
        "logoPosition": "left",
        "linksAlign": "center",
        "sticky": True,
        "blur": True,
        "items": [
            {"id": "n1", "label": T("Υπηρεσίες", "Services"), "type": "section", "target": "services", "url": "", "visible": True},
            {"id": "n2", "label": T("Αποτελέσματα", "Results"), "type": "section", "target": "results", "url": "", "visible": True},
            {"id": "n3", "label": T("Συνεργασίες", "Clients"), "type": "section", "target": "clients", "url": "", "visible": True},
            {"id": "n4", "label": T("Επικοινωνία", "Contact"), "type": "section", "target": "contact", "url": "", "visible": True},
        ],
    },
    "hero": {
        "badge": T("Social Media & Video Agency", "Social Media & Video Agency"),
        "showBadge": True,
        "titleA": T("Κάνουμε τα μαγαζιά", "We make local brands"),
        "titleB": T("viral.", "go viral."),
        "sub": T(
            "Παράγουμε short-form videos που πουλάνε. TikTok, Instagram, Facebook & YouTube — από την ιδέα μέχρι τα εκατομμύρια προβολές.",
            "Short-form video that actually sells. TikTok, Instagram, Facebook & YouTube — from concept to millions of views.",
        ),
        "primary": T("Ζήτα προσφορά", "Get a quote"),
        "primaryTarget": "contact",
        "secondary": T("Δες συνεργασίες", "See our clients"),
        "secondaryTarget": "clients",
        "platformsLabel": T("Δουλεύουμε σε", "We work on"),
        "showImage": True,
        "floatImage": True,
        "align": "left",
        "imageSide": "right",
        "buttonsAlign": "left",
        "padding": "normal",
        "bgImage": "",
        "bgOverlay": 60,
        "platforms": [
            {"id": "tiktok", "network": "TikTok", "label": "TikTok", "visible": True},
            {"id": "instagram", "network": "Instagram", "label": "Instagram", "visible": True},
            {"id": "facebook", "network": "Facebook", "label": "Facebook", "visible": True},
            {"id": "youtube", "network": "YouTube", "label": "YouTube", "visible": True},
        ],
    },
    "stats": {
        "overline": T("Τα νούμερα μιλάνε", "The numbers talk"),
        "title": T("Αποτελέσματα, όχι υποσχέσεις", "Results, not promises"),
        "note": T(
            "Συνολικά νούμερα από όλες τις συνεργασίες μας σε TikTok, Instagram, Facebook και YouTube.",
            "Combined figures across every collaboration on TikTok, Instagram, Facebook and YouTube.",
        ),
        "align": "left",
        "padding": "normal",
        "columns": 4,
        "items": [
            {
                "id": "s1", "value": 100, "suffix": "M+", "accent": "#60d6ff", "visible": True,
                "autoClients": False, "label": T("Προβολές συνολικά", "Total views"),
            },
            {
                "id": "s2", "value": 26, "suffix": "+", "accent": "#facc15", "visible": True,
                "autoClients": True, "label": T("Brands & μαγαζιά", "Brands & shops"),
            },
            {
                "id": "s3", "value": 1200, "suffix": "+", "accent": "#4ade80", "visible": True,
                "autoClients": False, "label": T("Videos παραγωγής", "Videos produced"),
            },
            {
                "id": "s4", "value": 4, "suffix": "", "accent": "#f87171", "visible": True,
                "autoClients": False, "label": T("Πλατφόρμες", "Platforms"),
            },
        ],
    },
    "services": {
        "overline": T("Υπηρεσίες", "Services"),
        "title": T("Ό,τι χρειάζεται το brand σου", "Everything your brand needs"),
        "sub": T(
            "Ένα στούντιο, όλη η δουλειά. Στρατηγική, γύρισμα, montage, δημοσίευση και ads.",
            "One studio, the whole job. Strategy, shooting, editing, publishing and ads.",
        ),
        "columns": 3,
        "align": "left",
        "padding": "normal",
        "items": [
            {
                "id": "sv1", "icon": "Video", "accent": "#60d6ff", "visible": True,
                "title": T("Short-Form Video", "Short-Form Video"),
                "desc": T(
                    "Reels, TikToks & Shorts με hook στα πρώτα 2 δευτερόλεπτα. Γύρισμα επί τόπου στο μαγαζί σου.",
                    "Reels, TikToks & Shorts hooked in the first 2 seconds. Filmed on location at your place.",
                ),
            },
            {
                "id": "sv2", "icon": "CalendarCheck", "accent": "#facc15", "visible": True,
                "title": T("Social Media Διαχείριση", "Social Media Management"),
                "desc": T(
                    "Πλάνο περιεχομένου, captions, hashtags, προγραμματισμός και καθημερινή παρουσία.",
                    "Content plan, captions, hashtags, scheduling and daily presence.",
                ),
            },
            {
                "id": "sv3", "icon": "Target", "accent": "#4ade80", "visible": True,
                "title": T("Paid Ads", "Paid Ads"),
                "desc": T(
                    "Meta & TikTok καμπάνιες με στόχευση σε πελάτες που είναι δίπλα σου.",
                    "Meta & TikTok campaigns targeting customers right around the corner.",
                ),
            },
            {
                "id": "sv4", "icon": "Camera", "accent": "#f87171", "visible": True,
                "title": T("Food & Product Videography", "Food & Product Videography"),
                "desc": T(
                    "Cinematic πλάνα φαγητού και προϊόντων που ανοίγουν την όρεξη και κλείνουν πωλήσεις.",
                    "Cinematic food and product shots that build appetite and close sales.",
                ),
            },
            {
                "id": "sv5", "icon": "Users", "accent": "#a78bfa", "visible": True,
                "title": T("Influencer Collabs", "Influencer Collabs"),
                "desc": T(
                    "Συνεργασίες με creators που ταιριάζουν στο κοινό και στον προϋπολογισμό σου.",
                    "Creator partnerships matched to your audience and your budget.",
                ),
            },
            {
                "id": "sv6", "icon": "Palette", "accent": "#fb923c", "visible": True,
                "title": T("Branding & Design", "Branding & Design"),
                "desc": T(
                    "Λογότυπα, μενού, αφίσες και οπτική ταυτότητα που δείχνει premium.",
                    "Logos, menus, posters and a visual identity that looks premium.",
                ),
            },
        ],
    },
    "clients": {
        "overline": T("Συνεργασίες", "Clients"),
        "title": T("Μαγαζιά & εταιρίες που μας εμπιστεύτηκαν", "Shops & companies that trusted us"),
        "sub": T(
            "Από καφετέριες και ψητοπωλεία μέχρι concept stores και εταιρίες αυτοκινήτων.",
            "From cafes and grill houses to concept stores and car dealers.",
        ),
        "rows": 3,
        "speed": 54,
        "pauseOnHover": True,
        "showNames": True,
        "showSocials": True,
        "align": "left",
        "padding": "normal",
        "cardSize": "md",
        "cardRadius": 22,
        "socialsPosition": "below",
        "logoMax": 100,
        "items": [
            {"id": "crats", "name": "Crats", "nameEn": "", "icon": "Drumstick", "logo": "/logos/crats.png", "tile": False, "accent": "#e49343", "site": "https://crats.gr", "visible": True, "social": {"ig": "crats.gr", "tt": "crats.gr", "fb": "cratsfriedchicken", "yt": ""}},
            {"id": "blysscafe", "name": "BlyssCafe", "nameEn": "", "icon": "Coffee", "logo": "/logos/blysscafe.png", "tile": False, "accent": "#d69351", "site": "https://blysscafe.gr", "visible": True, "social": {"ig": "blysscafe_official", "tt": "blysscafe_official", "fb": "", "yt": ""}},
            {"id": "papastavrou", "name": "Papastavrou Shops", "nameEn": "", "icon": "Bike", "logo": "/logos/papastavrou.png", "tile": False, "accent": "#f63162", "site": "https://www.papastavroushops.gr", "visible": True, "social": {"ig": "papastavrou_shops", "tt": "papastavroushops", "fb": "PapastavrouShops", "yt": ""}},
            {"id": "guru", "name": "Guru of Taste", "nameEn": "", "icon": "Utensils", "logo": "/logos/guru.png", "tile": True, "accent": "#e49343", "site": "https://wolt.com/el/grc/athens/restaurant/guru-of-taste", "visible": True, "social": {"ig": "Guru_oftaste", "tt": "", "fb": "", "yt": ""}},
            {"id": "pantheon", "name": "Pantheon Grill", "nameEn": "", "icon": "Flame", "logo": "/logos/pantheon.png", "tile": False, "accent": "#e1b283", "site": "", "visible": True, "social": {"ig": "pantheon.grill", "tt": "", "fb": "", "yt": ""}},
            {"id": "funkytokyo", "name": "Funky Tokyo", "nameEn": "", "icon": "Fish", "logo": "/logos/funkytokyo.png", "tile": True, "accent": "#d651b5", "site": "", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "yakuza", "name": "Yakuza", "nameEn": "", "icon": "Soup", "logo": "/logos/yakuza.png", "tile": False, "accent": "#d6b551", "site": "", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "tocashop", "name": "TocaShop", "nameEn": "", "icon": "Printer", "logo": "/logos/tocashop.png", "tile": False, "accent": "#4393e4", "site": "https://tocashop.gr", "visible": True, "social": {"ig": "tocashop.gr", "tt": "tocashop.gr", "fb": "toca.advertising", "yt": ""}},
            {"id": "ildesto", "name": "il Desto", "nameEn": "", "icon": "Pizza", "logo": "/logos/ildesto.png", "tile": False, "accent": "#60d6ff", "site": "", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "ypourgeio", "name": "Υπουργείο Γεύσεων", "nameEn": "Ministry of Flavors", "icon": "ChefHat", "logo": "/logos/ypourgeio.png", "tile": False, "accent": "#60d6ff", "site": "https://wolt.com/el/grc/athens/restaurant/ypourgeio-gefseon", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "doncarlito", "name": "Don Carlito", "nameEn": "", "icon": "Martini", "logo": "/logos/doncarlito.png", "tile": True, "accent": "#e49343", "site": "https://wolt.com/el/grc/athens/restaurant/cocktails-and-more", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "euthimiou", "name": "Efthimiou Cars", "nameEn": "", "icon": "CarFront", "logo": "/logos/euthimiou.png", "tile": False, "accent": "#f8d56c", "site": "", "visible": True, "social": {"ig": "efthimiou.cars", "tt": "", "fb": "", "yt": ""}},
            {"id": "xara", "name": "Ζαχαροπλαστείο Χαρά", "nameEn": "Xara Patisserie", "icon": "Cake", "logo": "/logos/xara.png", "tile": False, "accent": "#eb79b2", "site": "", "visible": True, "social": {"ig": "xarapatisserie", "tt": "", "fb": "", "yt": ""}},
            {"id": "ovegan", "name": "OVegan269", "nameEn": "O Vegan 269", "icon": "Leaf", "logo": "/logos/ovegan.png", "tile": False, "accent": "#e19a83", "site": "https://ovegan269.gr", "visible": True, "social": {"ig": "ovegan269", "tt": "ovegan269", "fb": "ovegan269", "yt": ""}},
            {"id": "kiboko", "name": "Kiboko", "nameEn": "", "icon": "Umbrella", "logo": "/logos/kiboko.png", "tile": False, "accent": "#60d6ff", "site": "https://www.kiboko.gr", "visible": True, "social": {"ig": "kiboko.gr", "tt": "kiboko", "fb": "kiboko", "yt": ""}},
            {"id": "araw", "name": "Araw Supermarket", "nameEn": "", "icon": "ShoppingCart", "logo": "/logos/araw.png", "tile": False, "accent": "#e46b43", "site": "https://arawsupermarket.gr", "visible": True, "social": {"ig": "arawsupermarket", "tt": "arawsupermarket.official", "fb": "arawsupermarket.official", "yt": ""}},
            {"id": "nadu", "name": "Nadu Men", "nameEn": "", "icon": "Shirt", "logo": "/logos/nadu.png", "tile": False, "accent": "#f8f86c", "site": "https://nadu-men.gr", "visible": True, "social": {"ig": "nadumenclothing", "tt": "", "fb": "nadumenclothing", "yt": ""}},
            {"id": "fiftyways", "name": "50ways", "nameEn": "", "icon": "Footprints", "logo": "/logos/fiftyways.png", "tile": False, "accent": "#60d6ff", "site": "https://50ways.com.gr", "visible": True, "social": {"ig": "50.ways", "tt": "", "fb": "50ways", "yt": ""}},
            {"id": "onedeal", "name": "OneDeal RentCar", "nameEn": "", "icon": "CarFront", "logo": "/logos/onedeal.png", "tile": False, "accent": "#60d6ff", "site": "https://onedeal.gr", "visible": True, "social": {"ig": "onedeal36", "tt": "", "fb": "onedealathens", "yt": ""}},
            {"id": "barbathimios", "name": "Μπαρμπαθύμιος", "nameEn": "Barbathimios", "icon": "Fish", "logo": "/logos/barbathimios.png", "tile": False, "accent": "#e4bc43", "site": "https://wolt.com/el/grc/athens/restaurant/mparmpathimios-nikaia", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "hairway", "name": "Hairway", "nameEn": "", "icon": "Scissors", "logo": "/logos/hairway.png", "tile": False, "accent": "#f63131", "site": "https://hairway.gr", "visible": True, "social": {"ig": "hairwaygrofficial", "tt": "", "fb": "hairwaygr", "yt": ""}},
            {"id": "tolis", "name": "Τόλης Ζαχαροπλαστείο", "nameEn": "Tolis Patisserie", "icon": "CakeSlice", "logo": "/logos/tolis.png", "tile": False, "accent": "#ebb279", "site": "https://tolissweets.gr", "visible": True, "social": {"ig": "tolissweets", "tt": "", "fb": "", "yt": ""}},
            {"id": "twisteast", "name": "Twist East", "nameEn": "", "icon": "Salad", "logo": "/logos/twisteast.png", "tile": False, "accent": "#e1ca83", "site": "", "visible": True, "social": {"ig": "", "tt": "", "fb": "", "yt": ""}},
            {"id": "scorpios", "name": "Scorpios Music Club", "nameEn": "", "icon": "Martini", "logo": "/logos/scorpios.png", "tile": False, "accent": "#d65151", "site": "", "visible": True, "social": {"ig": "scorpios_musicbar_athens", "tt": "scorpiosmusicbarathens", "fb": "", "yt": ""}},
            {"id": "kantinarxis", "name": "Καντινάρχης", "nameEn": "Kantinarxis", "icon": "Sandwich", "logo": "/logos/kantinarxis.png", "tile": False, "accent": "#f6f631", "site": "https://kantinarxis.gr", "visible": True, "social": {"ig": "kantinarxis", "tt": "kantinarxis", "fb": "", "yt": ""}},
        ],
    },
    "process": {
        "overline": T("Πώς δουλεύουμε", "How we work"),
        "title": T("Τέσσερα βήματα", "Four steps"),
        "align": "left",
        "padding": "normal",
        "items": [
            {"id": "p1", "accent": "#60d6ff", "visible": True, "title": T("Γνωριμία", "Discovery"), "desc": T("Μαθαίνουμε το μαγαζί, το κοινό και τους στόχους.", "We learn your shop, audience and goals.")},
            {"id": "p2", "accent": "#facc15", "visible": True, "title": T("Στρατηγική", "Strategy"), "desc": T("Χτίζουμε content plan με concepts και ημερολόγιο.", "We build a content plan with concepts and a calendar.")},
            {"id": "p3", "accent": "#4ade80", "visible": True, "title": T("Παραγωγή", "Production"), "desc": T("Ερχόμαστε, γυρίζουμε, κάνουμε montage.", "We show up, we shoot, we edit.")},
            {"id": "p4", "accent": "#f87171", "visible": True, "title": T("Ανάπτυξη", "Growth"), "desc": T("Δημοσίευση, ads, μέτρηση και βελτιστοποίηση.", "Publishing, ads, measuring and optimising.")},
        ],
    },
    "contact": {
        "overline": T("Επικοινωνία", "Contact"),
        "title": T("Ας μεγαλώσουμε το μαγαζί σου", "Let's grow your business"),
        "sub": T(
            "Στείλε μας δύο γραμμές για το brand σου και απαντάμε εντός 24 ωρών.",
            "Send us two lines about your brand and we reply within 24 hours.",
        ),
        "showEmail": True,
        "align": "left",
        "padding": "normal",
        "formSide": "right",
        "points": [
            T("Απάντηση εντός 24 ωρών", "Reply within 24 hours"),
            T("Δωρεάν πρώτη συμβουλευτική", "Free first consultation"),
            T("Χωρίς δέσμευση συμβολαίου", "No long-term contract"),
        ],
        "labels": {
            "name": T("Ονοματεπώνυμο", "Full name"),
            "email": T("Email", "Email"),
            "business": T("Μαγαζί / Εταιρία", "Business name"),
            "message": T("Πες μας τι θέλεις", "Tell us what you need"),
            "send": T("Αποστολή", "Send message"),
            "sending": T("Αποστολή...", "Sending..."),
            "ok": T("Ευχαριστούμε! Το μήνυμα στάλθηκε.", "Thank you! Your message was sent."),
            "err": T("Κάτι πήγε λάθος. Δοκίμασε ξανά.", "Something went wrong. Please try again."),
        },
    },
    "footer": {
        "tagline": T("Social media & video production agency.", "Social media & video production agency."),
        "rights": T("Όλα τα δικαιώματα κατοχυρωμένα.", "All rights reserved."),
        "showSocials": True,
        "layout": "spread",
        "links": [],
    },
    "layout": {
        "order": ["hero", "clients", "stats", "services", "process", "contact"],
        "hidden": [],
    },
}


def fresh_defaults() -> dict:
    return deepcopy(DEFAULT_CONTENT)
