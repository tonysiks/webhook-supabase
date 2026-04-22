import sys
print("Python version:", sys.version, flush=True)
print("Starting imports...", flush=True)

import requests
print("imported requests", flush=True)

SUPABASE_URL = "https://awzbegybkjfyobilvpgc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk2MzcyNywiZXhwIjoyMDkxNTM5NzI3fQ.5KuxLYIcZIk9y7wChd2cLxV8lx5zBxUH_x6C5sfQ1SA"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Chaque entrée : (liste de mots-clés EN à détecter, liste de traductions FR/ES/IT/DE/PT/EN)
WORD_TRANSLATIONS = [
    # Saisons
    (["SPRING"],      ["spring", "printemps", "primavera", "primavera", "Frühling", "primavera"]),
    (["SUMMER"],      ["summer", "été", "verano", "estate", "Sommer", "verão"]),
    (["AUTUMN", "FALL"], ["autumn", "fall", "automne", "otoño", "autunno", "Herbst", "outono"]),
    (["WINTER"],      ["winter", "hiver", "invierno", "inverno", "Winter", "inverno"]),
    # Couleurs
    (["BLACK"],       ["black", "noir", "negro", "nero", "schwarz", "preto"]),
    (["WHITE"],       ["white", "blanc", "blanco", "bianco", "weiß", "branco"]),
    (["GREY", "GRAY"], ["grey", "gray", "gris", "gris", "grigio", "grau", "cinza"]),
    (["BLUE"],        ["blue", "bleu", "azul", "blu", "blau", "azul"]),
    (["RED"],         ["red", "rouge", "rojo", "rosso", "rot", "vermelho"]),
    (["GREEN"],       ["green", "vert", "verde", "verde", "grün", "verde"]),
    (["BROWN"],       ["brown", "marron", "marrón", "marrone", "braun", "marrom"]),
    (["BEIGE"],       ["beige", "beige", "beige", "beige", "beige", "bege"]),
    (["ORANGE"],      ["orange", "orange", "naranja", "arancione", "orange", "laranja"]),
    (["YELLOW"],      ["yellow", "jaune", "amarillo", "giallo", "gelb", "amarelo"]),
    (["PINK"],        ["pink", "rose", "rosa", "rosa", "rosa", "rosa"]),
    (["PURPLE"],      ["purple", "violet", "morado", "viola", "lila", "roxo"]),
    (["NAVY"],        ["navy", "marine", "azul marino", "blu navy", "marine", "azul marinho"]),
    (["KHAKI"],       ["khaki", "kaki", "caqui", "kaki", "khaki", "caqui"]),
    # Styles / occasions
    (["CASUAL"],      ["casual", "casual", "casual", "casual", "casual", "casual"]),
    (["SPORT", "ATHLETIC"], ["sport", "sportswear", "sport", "deportivo", "sportivo", "Sport", "esportivo"]),
    (["STREETWEAR"],  ["streetwear", "street", "streetwear", "streetwear", "streetwear", "streetwear"]),
    (["WORKWEAR"],    ["workwear", "travail", "trabajo", "lavoro", "Arbeitskleidung", "trabalho"]),
    (["OUTDOOR"],     ["outdoor", "plein air", "exterior", "outdoor", "outdoor", "outdoor"]),
    (["GRAPHIC"],     ["graphic", "graphique", "gráfico", "grafico", "grafisch", "gráfico"]),
    (["OVERSIZED"],   ["oversized", "oversize", "grande taille", "talla grande", "oversize", "Übergröße", "tamanho grande"]),
    (["EMBROIDERED", "EMBROIDERY"], ["embroidered", "brodé", "bordado", "ricamato", "bestickt", "bordado"]),
    (["PATCHWORK"],   ["patchwork", "patchwork", "patchwork", "patchwork", "patchwork", "patchwork"]),
    (["STRIPED"],     ["striped", "rayé", "a rayas", "a righe", "gestreift", "listrado"]),
    (["PLAID", "CHECKED", "CHECKERED"], ["plaid", "checked", "carreaux", "cuadros", "quadri", "kariert", "xadrez"]),
    (["FLORAL"],      ["floral", "fleuri", "floral", "floreale", "geblümt", "floral"]),
    (["WASHED"],      ["washed", "délavé", "lavado", "lavato", "gewaschen", "lavado"]),
    (["DISTRESSED"],  ["distressed", "usé", "desgastado", "consumato", "verwaschen", "desgastado"]),
    # Matières
    (["COTTON"],      ["cotton", "coton", "algodón", "cotone", "Baumwolle", "algodão"]),
    (["WOOL"],        ["wool", "laine", "lana", "lana", "Wolle", "lã"]),
    (["SILK"],        ["silk", "soie", "seda", "seta", "Seide", "seda"]),
    (["NYLON"],       ["nylon", "nylon", "nylon", "nylon", "Nylon", "nylon"]),
    (["POLYESTER"],   ["polyester", "polyester", "poliéster", "poliestere", "Polyester", "poliéster"]),
    # Formats
    (["BUNDLE", "LOT", "PACK"], ["bundle", "lot", "lote", "lotto", "Paket", "lote"]),
    (["BALE"],        ["bale", "balle", "fardo", "balla", "Ballen", "fardo"]),
    (["GRADE"],       ["grade", "qualité", "calidad", "qualità", "Qualität", "qualidade"]),
    (["WHOLESALE"],   ["wholesale", "gros", "mayoreo", "ingrosso", "Großhandel", "atacado"]),
    (["DEADSTOCK"],   ["deadstock", "stock mort", "deadstock", "deadstock", "deadstock", "deadstock"]),
    (["SECOND HAND", "SECONDHAND", "USED"], ["second hand", "seconde main", "segunda mano", "seconda mano", "secondhand", "segunda mão"]),
]

def generate_tags(title):
    t = title.upper()
    tags = []

    # === T-SHIRTS ===
    if any(x in t for x in ["T-SHIRT", "TSHIRT", "T SHIRT", "TEE"]):
        tags += ["tshirt", "t-shirt", "tee",
                 "camiseta", "remera",       # ES
                 "maglietta",               # IT
                 "camisola"]               # PT

    # === SWEATS / HOODIES ===
    if any(x in t for x in ["SWEATSHIRT", "SWEAT-SHIRT", "CREWNECK"]):
        tags += ["sweat", "sweatshirt", "pull", "haut",
                 "sudadera",                 # ES
                 "felpa",                    # IT
                 "sweatshirt", "pullover",   # DE
                 "moletom", "suéter"]        # PT

    if any(x in t for x in ["HOODIE", "HOODY", "HOODED"]):
        tags += ["hoodie", "sweat", "pull", "capuche",
                 "sudadera con capucha", "hoodie",  # ES
                 "felpa con cappuccio",             # IT
                 "kapuzenpullover", "hoodie",       # DE
                 "moletom com capuz"]               # PT

    # === PULLS / TRICOTS ===
    if any(x in t for x in ["SWEATER", "JUMPER", "PULLOVER", "KNITWEAR", "KNIT"]):
        tags += ["pull", "tricot", "pullover",
                 "jersey", "suéter",         # ES
                 "maglione", "pullover",     # IT
                 "pullover", "strickjacke",  # DE
                 "suéter", "malha"]          # PT

    if any(x in t for x in ["FLEECE", "POLAR"]):
        tags += ["polaire", "fleece",
                 "polar",                    # ES
                 "pile",                     # IT
                 "fleece",                   # DE
                 "fleece", "polar"]          # PT

    # === CHEMISES ===
    if any(x in t for x in ["SHIRT", "CHEMISE", "FLANNEL", "WESTERN"]):
        if not any(x in t for x in ["SWEATSHIRT", "T-SHIRT", "TSHIRT"]):
            tags += ["chemise",
                     "camisa",               # ES
                     "camicia",              # IT
                     "hemd"]                 # DE

    # === VESTES ===
    if any(x in t for x in ["JACKET", "BOMBER", "ANORAK", "WINDBREAKER", "BLAZER"]):
        tags += ["veste", "blouson", "jacket",
                 "chaqueta", "cazadora",     # ES
                 "giacca", "giubbotto",      # IT
                 "jacke", "blazer",          # DE
                 "jaqueta", "casaco"]        # PT

    if any(x in t for x in ["COAT", "PARKA", "MANTEAU"]):
        tags += ["manteau", "parka", "veste",
                 "abrigo", "parka",          # ES
                 "cappotto", "parka",        # IT
                 "mantel", "parka",          # DE
                 "casaco", "sobretudo"]      # PT

    # === JEANS ===
    if any(x in t for x in ["JEAN", "DENIM"]):
        tags += ["jean", "jeans", "denim", "pantalon", "bas",
                 "vaquero", "vaqueros", "jeans",  # ES
                 "jeans", "denim",                # IT
                 "jeans", "denim",                # DE
                 "jeans", "calça jeans"]          # PT

    # === PANTALONS ===
    if any(x in t for x in ["TROUSER", "PANT", "CHINO", "CARGO"]):
        tags += ["pantalon", "pantalons", "bas",
                 "pantalón", "pantalones",   # ES
                 "pantaloni", "pantalone",   # IT
                 "hose", "chino",            # DE
                 "calça", "calças"]          # PT

    if any(x in t for x in ["JOGGER", "TRACKSUIT", "TRACK PANT", "JOGGING"]):
        tags += ["jogging", "survêtement", "pantalon",
                 "chándal", "jogging",       # ES
                 "tuta", "jogger",           # IT
                 "jogginghose", "trainingsanzug",  # DE
                 "calça de moletom", "agasalho"]   # PT

    # === SHORTS ===
    if "SHORT" in t:
        tags += ["short", "shorts",
                 "short", "pantalón corto",  # ES
                 "short", "pantaloncini",    # IT
                 "shorts", "kurze hose",     # DE
                 "short", "bermuda"]         # PT

    # === ROBES ===
    if any(x in t for x in ["DRESS", "ROBE"]):
        tags += ["robe", "dress",
                 "vestido",                  # ES
                 "vestito", "abito",         # IT
                 "kleid",                    # DE
                 "vestido"]                  # PT

    # === CUIR ===
    if any(x in t for x in ["LEATHER", "CUIR"]):
        tags += ["cuir", "leather",
                 "cuero", "piel",            # ES
                 "pelle", "cuoio",           # IT
                 "leder",                    # DE
                 "couro"]                    # PT

    # === CHAUSSURES ===
    if any(x in t for x in ["SHOE", "BOOT", "SNEAKER", "TRAINER"]):
        tags += ["chaussure", "chaussures", "basket", "baskets",
                 "zapato", "zapatilla",      # ES
                 "scarpa", "scarpe",         # IT
                 "schuh", "schuhe",          # DE
                 "sapato", "tênis"]          # PT

    # === GENRE ===
    if any(x in t for x in ["WOMEN", "LADIES", "FEMME", "GIRL", "FEMALE"]):
        tags += ["femme", "femmes",
                 "mujer", "mujeres",         # ES
                 "donna", "donne",           # IT
                 "damen", "frau",            # DE
                 "mulher", "feminino"]       # PT

    if any(x in t for x in ["MEN", "HOMME", "MALE", "MENS"]):
        tags += ["homme", "hommes",
                 "hombre", "hombres",        # ES
                 "uomo", "uomini",           # IT
                 "herren", "mann",           # DE
                 "homem", "masculino"]       # PT

    # === MARQUES ===
    if "RALPH LAUREN" in t or ("RALPH" in t and "LAUREN" in t):
        tags += ["ralph lauren", "ralph", "lauren", "polo"]
    if "TOMMY" in t:
        tags += ["tommy", "tommy hilfiger"]
    if "NIKE" in t:
        tags += ["nike"]
    if "ADIDAS" in t:
        tags += ["adidas"]
    if "CARHARTT" in t:
        tags += ["carhartt"]
    if "LEVI" in t:
        tags += ["levi", "levis", "levi's"]
    if "WRANGLER" in t:
        tags += ["wrangler"]
    if "CHAMPION" in t:
        tags += ["champion"]
    if "NORTH FACE" in t:
        tags += ["north face", "the north face"]
    if "PATAGONIA" in t:
        tags += ["patagonia"]
    if "DICKIES" in t:
        tags += ["dickies"]
    if "LACOSTE" in t:
        tags += ["lacoste"]
    if "MONCLER" in t:
        tags += ["moncler"]
    if "CANADA GOOSE" in t:
        tags += ["canada goose"]
    if "HARLEY" in t:
        tags += ["harley davidson", "harley"]
    if "NASCAR" in t:
        tags += ["nascar"]
    if "NFL" in t:
        tags += ["nfl"]
    if "WOOLRICH" in t:
        tags += ["woolrich"]
    if "VINTAGE" in t:
        tags += ["vintage"]
    if "Y2K" in t:
        tags += ["y2k"]
    if "MIX" in t:
        tags += ["mix", "mélange", "mezcla", "misto"]
    if "POLO" in t:
        tags += ["polo"]
    if "BAND" in t or "MUSIC" in t:
        tags += ["band", "music", "rock", "vintage", "musique", "música", "musica"]

    # === TRADUCTIONS MULTILINGUES (EN → FR/ES/IT/DE/PT) ===
    for keywords, translations in WORD_TRANSLATIONS:
        if any(kw in t for kw in keywords):
            tags += translations

    return " ".join(sorted(set(tags)))

CATEGORY_KEYWORDS = [
    # T-shirts — avant "shirt" pour éviter les faux positifs
    (["t-shirt", "tshirt", "t shirt", "tee shirt", " tee"], "T-Shirt"),
    # Sweats / hoodies — avant "pull" et "sweater"
    (["sweatshirt", "sweat shirt", "hoodie", "hoody", "hooded sweat", "crewneck"], "Sweatshirt"),
    # Vestes — avant "coat" et "blazer" génériques
    (["jacket", "veste", "bomber", "blazer", "anorak", "windbreaker", "gilet", "waistcoat", "bodywarmer"], "Veste"),
    # Manteaux
    (["coat", "manteau", "parka", "overcoat", "trench"], "Manteau"),
    # Pulls / tricots
    (["knitwear", "knit", "pullover", "sweater", "jumper", "sweter", "pull "], "Pull"),
    # Chemises
    (["shirt", "chemise", "flannel", "blouse", "overshirt"], "Chemise"),
    # Pantalons — jean/shorts séparés après
    (["trouser", "pant", "jean", "denim", "chino", "cargo pant", "jogger", "legging"], "Pantalon"),
    # Shorts
    (["short"], "Short"),
    # Robes
    (["dress", "robe"], "Robe"),
    # Jupes
    (["skirt", "jupe"], "Jupe"),
    # Chaussures
    (["shoe", "boot", "sneaker", "trainer", "footwear", "chaussure", "basket"], "Chaussures"),
    # Mix / lots
    (["bundle", "mix", "lot ", "kilo", "bale", "sack", "bag of", "pack of", "assort"], "Mix"),
    # Accessoires (casquettes, chapeaux…) — en dernier
    (["cap", "hat", "beanie", "bonnet", "casquette", "chapeau", "scarf", "echarpe", "glove", "gant"], "Accessoire"),
]

def infer_category(title):
    if not title:
        return "Accessoire"
    t = title.lower()
    for keywords, category in CATEGORY_KEYWORDS:
        if any(kw in t for kw in keywords):
            return category
    return "Accessoire"

# Récupérer tous les produits (régénération complète des tags)
FETCH_BATCH = 1000
print("Récupération de tous les produits...")

all_products = []
offset = 0

while True:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/produits"
        f"?select=id,title,category&limit={FETCH_BATCH}&offset={offset}",
        headers={**headers, "Prefer": "count=none"}
    )
    resp.raise_for_status()
    batch = resp.json()
    if not batch:
        break
    all_products.extend(batch)
    print(f"   {len(all_products)} produits récupérés...")
    if len(batch) < FETCH_BATCH:
        break
    offset += FETCH_BATCH

print(f"   Total: {len(all_products)} produits")

# Générer et mettre à jour les tags
BATCH_SIZE = 50
total = 0
errors = 0

rows = []
for p in all_products:
    category = p.get('category') or None
    rows.append({
        "id": p['id'],
        "tags": generate_tags(p['title']),
        "category": category if category else infer_category(p['title']),
    })

print(f"   Tags générés, mise à jour en cours...")

for p in rows:
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/produits?id=eq.{p['id']}",
        headers=headers,
        json={"tags": p['tags'], "category": p['category']}
    )
    if resp.status_code == 204:
        total += 1
        if total % 200 == 0:
            print(f"   ✅ {total}/{len(rows)} produits mis à jour...")
    else:
        errors += 1

print(f"\n🎉 Terminé: {total} tags générés, {errors} erreurs")
