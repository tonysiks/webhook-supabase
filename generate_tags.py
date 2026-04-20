import requests

SUPABASE_URL = "https://awzbegybkjfyobilvpgc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk2MzcyNywiZXhwIjoyMDkxNTM5NzI3fQ.5KuxLYIcZIk9y7wChd2cLxV8lx5zBxUH_x6C5sfQ1SA"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def generate_tags(title):
    t = title.upper()
    tags = []

    # === T-SHIRTS ===
    if any(x in t for x in ["T-SHIRT", "TSHIRT", "T SHIRT", "TEE"]):
        tags += ["tshirt", "t-shirt", "tee",
                 "camiseta", "remera",       # ES
                 "maglietta", "t-shirt",     # IT
                 "t-shirt", "shirt",         # DE
                 "camisola", "t-shirt"]      # PT

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
            tags += ["chemise", "shirt",
                     "camisa",               # ES
                     "camicia",              # IT
                     "hemd",                 # DE
                     "camisa"]               # PT

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

    return " ".join(sorted(set(tags)))

# Récupérer uniquement les produits où tags IS NULL, par batch de 1000
FETCH_BATCH = 1000
print("Récupération des produits sans tags...")

all_products = []
offset = 0

while True:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/produits"
        f"?select=id,title&tags=is.null&limit={FETCH_BATCH}&offset={offset}",
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

print(f"   Total: {len(all_products)} produits sans tags")

# Générer et mettre à jour les tags
BATCH_SIZE = 50
total = 0
errors = 0

rows = []
for p in all_products:
    rows.append({"id": p['id'], "tags": generate_tags(p['title'])})

print(f"   Tags générés, mise à jour en cours...")

for p in rows:
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/produits?id=eq.{p['id']}",
        headers=headers,
        json={"tags": p['tags']}
    )
    if resp.status_code == 204:
        total += 1
        if total % 200 == 0:
            print(f"   ✅ {total}/{len(rows)} produits mis à jour...")
    else:
        errors += 1

print(f"\n🎉 Terminé: {total} tags générés, {errors} erreurs")
