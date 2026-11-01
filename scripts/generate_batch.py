#!/usr/bin/env python3
"""
Generator wsadowy grafik 2D Cartoon dla aplikacji "Mój Plecaczek"
Wymaga: pip install google-genai pillow
Uruchomienie:
    export GEMINI_API_KEY="AIzaSy..."
    python scripts/generate_batch.py
"""

import os
import sys
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Brak biblioteki google-genai. Zainstaluj:")
    print("pip install google-genai pillow")
    sys.exit(1)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("BŁĄD: Ustaw zmienną środowiskową GEMINI_API_KEY:")
    print("export GEMINI_API_KEY='Twój_Klucz_Gemini'")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "items"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPTS = [
    # Narzędzia & Akcesoria
    {
        "filename": "scyzoryk.jpg",
        "prompt": "A classic red Swiss army multi-tool pocket knife (scyzoryk turystyczny) resting angled in a dynamic 3/4 perspective view, in a charming 2D cartoon cel-shaded animation series style (aesthetic of Bluey and Gravity Falls). Features: Iconic glossy cherry-red rounded handle scales with a subtle clean white shield cross emblem on the side. The main stainless-steel knife blade is neatly unfolded, along with a small pair of folding scissors and a tiny can opener/corkscrew partially visible. Bold clean dark ink outlines, smooth flat cel-shading with bright shiny metallic blade highlights and reflections. Centered composition isolated on a pure flat solid white background (#ffffff) with a soft subtle grey drop shadow underneath. No human hands, no text, no watermark."
    },

    # Grupa A: Obuwie
    {
        "filename": "buty_trekkingowe.jpg",
        "prompt": "A pair of modern mountain trekking hiking shoes angled in 3/4 view in a charming 2D cartoon cel-shaded animation series style. Features: charcoal grey and olive green technical body, black protective rubber toe cap (otok), athletic ergonomic lugged rubber sole, vibrant safety orange trekking laces with speed hooks, and a heel pull loop. Clean bold dark ink outlines, flat cel-shading with crisp highlights, Bluey and Gravity Falls aesthetic. Isolated on pure solid flat white background (#ffffff) with a soft subtle grey drop shadow underneath. No feet, no human, no text, no watermark."
    },
    {
        "filename": "klapki.jpg",
        "prompt": "A pair of lightweight summer pool and beach slide sandals (klapki) laid out side by side in a charming 2D cartoon cel-shaded animation series style. Features: flexible molded EVA foam, ergonomically contoured footbed with subtle non-slip texture, broad comfortable strap across the midfoot. Color: cheerful ocean azure blue or summer turquoise. Clean bold dark ink outlines, smooth cel-shading, pure solid flat white background (#ffffff) with soft drop shadow underneath. No feet, no text, no watermark."
    },
    {
        "filename": "kapcie.jpg",
        "prompt": "A pair of cozy, fluffy indoor house slippers (papucie domowe) with fully enclosed rounded toes and closed back for a young child, placed side by side angled in 3/4 view in a charming 2D cartoon cel-shaded animation series style. NOT sandals, NOT flip-flops, NOT open toes. Features: ultra-soft plush pink fleece material with white faux-fur fleece lining around the ankle opening, a cute little embroidered golden sleeping star on the top of each slipper, and a thick flat soft non-slip sole. Clean bold dark ink outlines, smooth flat cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow. No feet, no human, no watermark."
    },
    {
        "filename": "kapcie_dorosli.jpg",
        "prompt": "A pair of comfortable classic slip-on mule house slippers for adults laid side by side in 3/4 view in a charming 2D cartoon cel-shaded animation series style. Features: dark navy blue felt upper with soft cream fleece lining and piped collar, a small subtle silver embroidered star motif, and a durable flat indoor foam rubber sole. Clean bold dark ink outlines, smooth cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No feet, no text, no watermark."
    },
    {
        "filename": "skarpetki.jpg",
        "prompt": "A cheerful pair of clean, folded cotton crew socks laid side-by-side at a cozy 3/4 perspective angle, in a 2D cartoon cel-shaded animation series style (aesthetic of Bluey and Gravity Falls). Features: High-quality soft woven combed cotton in warm heather-grey fabric, with vibrant contrasting sunny-yellow or turquoise-blue reinforced heel cups, toe caps, and ribbed top cuffs. Subtle ribbed texture along the ankles, gentle organic fabric curves and folds. Bold dark ink outlines, smooth flat cel-shading with soft highlights, centered composition isolated on a pure flat solid white background (#ffffff) with a soft subtle grey drop shadow underneath. Empty socks (no human feet), no text, no watermark."
    },
    {
        "filename": "skarpety_narciarskie.jpg",
        "prompt": "A pair of technical high-cut thermal ski snow socks standing upright side-by-side at a 3/4 angle, in a 2D cartoon cel-shaded animation series style. Features: Thick warm merino-wool knit in deep navy and cobalt blue with protective ergonomic padded zones on the shins, heels, and toes in bright neon-lime green. Bold dark ink outlines, flat cel-shading, pure solid flat white background (#ffffff) with soft drop shadow. No feet, no text."
    },

    # Grupa B: Koce
    {
        "filename": "koc_pleciony.jpg",
        "prompt": "A cozy, luxurious wool tartan plaid throw blanket (pled) neatly folded with soft fringe tassels draping down on one side, tied with a decorative fabric ribbon, in a charming 2D cartoon cel-shaded animation series style. Pattern: rich classic tartan plaid in deep forest green, navy blue, and warm burgundy lines. Clean bold dark ink outlines, smooth flat cel-shading, soft fabric drape. Centered on a pure solid flat white background (#ffffff) with a soft subtle drop shadow underneath. No text, no watermark."
    },
    {
        "filename": "koc_czarny.jpg",
        "prompt": "A cozy, thick solid deep jet-black fleece travel and car blanket, neatly folded in a clean rectangular stack in a charming 2D cartoon cel-shaded animation series style. Features: rich jet black soft fleece fabric with visible plush thickness and cozy rounded fabric folds, subtle charcoal grey highlights along the folded edges so the black form and depth are clearly visible and defined. Clean bold dark ink outlines, smooth cel-shading, Bluey and Gravity Falls aesthetic. Centered on a pure solid flat white background (#ffffff) with a soft subtle grey drop shadow underneath. No patterns, no stripes, no text, no watermark."
    },
    {
        "filename": "kocyk_tymek.jpg",
        "prompt": "A tender and soft baby knit blanket neatly laid out with one corner gently folded over, in a charming 2D cartoon cel-shaded animation series style. Features: delicate honeycomb waffle knit texture, soft soothing pastel sage mint or warm oatmeal cream cotton. Clean bold dark ink outlines, gentle fabric folds, cozy and sweet Bluey aesthetic. Isolated on a pure solid flat white background (#ffffff) with a soft subtle drop shadow underneath. No baby, no text, no watermark."
    },

    # Grupa C: Napoje, Higiena & Apteczka
    {
        "filename": "bidon.jpg",
        "prompt": "A modern translucent tritan sports water bottle standing upright in a charming 2D cartoon cel-shaded animation series style. Features: clear water level visible inside with subtle volume measurement lines, leakproof flip-top cap with drinking spout, safety latch, and a flexible silicone carrying loop strap. Color: smoky seafoam teal body with a coral-pink accent push button. Clean bold dark ink outlines, smooth flat cel-shading with shiny reflections. Centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No text, no logo, no watermark."
    },
    {
        "filename": "krem_opalanie.jpg",
        "prompt": "A sunny bottle of high-protection sun lotion sunscreen with a dispenser pump, in a charming 2D cartoon cel-shaded animation series style. Bottle color: warm canary yellow and bright orange with a soft sky-blue cap. Features a cute smiling sun icon badge on the front and a clear 'SPF 50' text label. Next to the bottle is a tiny dollop of smooth white moisturizing sunscreen cream. Clean bold dark ink outlines, flat cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow. No gibberish words, no watermark."
    },
    {
        "filename": "lekarstwa.jpg",
        "prompt": "A compact travel first-aid medical kit pouch with pills, in a charming 2D cartoon cel-shaded animation series style. Features: a vibrant red zippered canvas pouch with a clean bold white medical first-aid cross on the front. Sitting neatly next to the pouch is a silver foil blister pack with colorful capsules (half blue, half white). Clean bold dark ink outlines, smooth cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No text, no brand, no watermark."
    },
    {
        "filename": "pomadka.jpg",
        "prompt": "A moisturizing cosmetic lip balm stick for kids standing upright with its cap placed neatly beside it, in a charming 2D cartoon cel-shaded animation series style. The twist-up tube reveals the smooth, slanted tip of glossy peach-honey colored lip balm. Pastel coral and mint container. Clean bold dark ink outlines, smooth cel-shading with soft highlights, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No text, no watermark."
    },

    # Grupa D: Ubrania i Akcesoria dla Ani
    {
        "filename": "spodnie_dlugie.jpg",
        "prompt": "A pair of comfortable classic blue denim jeans for a girl neatly laid out flat, in a charming 2D cartoon cel-shaded animation series style. Features: elastic comfort waistband, copper rivet details, front pockets, yellow contrast stitching, and neatly cuffed hems at the ankles. Clean bold dark ink outlines, smooth cel-shading with soft denim highlights, Bluey cartoon aesthetic. Centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No human wearing them, flat lay, no text, no watermark."
    },
    {
        "filename": "spodnie_krotkie.jpg",
        "prompt": "A pair of cheerful summer cotton sweat shorts for a girl laid out flat, in a charming 2D cartoon cel-shaded animation series style. Color: sunny pastel coral-salmon or peach with white drawstrings at the elastic waist and rounded retro white piping along the hems. Clean bold dark ink outlines, smooth flat cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. Empty garment flat lay, no text, no watermark."
    },
    {
        "filename": "cieple_spodnie.jpg",
        "prompt": "A pair of warm insulated winter ski snow pants (salopettes) for a girl laid out flat, in a charming 2D cartoon cel-shaded animation series style. Features: adjustable elastic shoulder suspender straps, reinforced darker knee patches, zippered side pockets, and elastic snow gaiters at the ankles. Color: deep berry plum with pastel lilac accents. Clean bold dark ink outlines, smooth cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. Empty garment, no text, no watermark."
    },
    {
        "filename": "gruba_czapka_zima.jpg",
        "prompt": "A cozy chunky cable-knit winter beanie hat for a girl in a charming 2D cartoon cel-shaded animation series style. Features: thick ribbed folded brim and a large, fluffy, soft yarn pom-pom on top. Color: soft lavender lilac with cream yarn accents. Clean bold dark ink outlines, smooth cel-shading, soft woven texture. Centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No mannequin, no head, no text, no watermark."
    },
    {
        "filename": "pizama_ania.jpg",
        "prompt": "A cozy two-piece children's pajama sleep set laid out flat, in a charming 2D cartoon cel-shaded animation series style. Includes: a soft short-sleeve cotton crewneck shirt and matching pajama shorts. Color: pastel sky-blue fabric adorned with a subtle, delicate pattern of smiling sleeping stars and tiny crescent moons. Clean bold dark ink outlines, smooth cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. Empty garments flat lay, no text, no watermark."
    },
    {
        "filename": "blok_rysunkowy.jpg",
        "prompt": "A spiral-bound artists' sketchbook and coloring pad lying flat at a slight angle, in a charming 2D cartoon cel-shaded animation series style. Features: a silver wire spiral binding along the top edge, cover is gently curled back revealing a crisp white page with a cute hand-drawn miniature colorful rainbow and small red heart sketched in the corner. Clean bold dark ink outlines, smooth cel-shading, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No text, no watermark."
    },
    {
        "filename": "kredki.jpg",
        "prompt": "A cheerful pencil case with a colorful fan of freshly sharpened wooden colored pencils, in a charming 2D cartoon cel-shaded animation series style. Features: a fabric zippered pencil pouch in teal and yellow, with sharp colored pencils peeking out in a neat spread (red, yellow, blue, green, orange, purple). Clean bold dark ink outlines, smooth cel-shading with soft highlights, centered on pure solid flat white background (#ffffff) with soft drop shadow underneath. No text, no watermark."
    },
    {
        "filename": "piornik.jpg",
        "prompt": "A charming children's zippered pencil case (piórnik szkolny) lying closed at a pleasant 3/4 angle, in a 2D cartoon cel-shaded animation series style (aesthetic of Bluey and Gravity Falls). Features: High-quality durable fabric pencil pouch in cheerful pastel teal-mint and sunny yellow colors, with a smooth lilac zipper and a cute rubber zipper pull shaped like a smiling cloud. Pouch is neatly zipped shut, showing its stylish rounded rectangular barrel shape, clean contrast stitching, and a small front mesh pocket. Bold dark ink outlines, clean flat cel-shading with soft highlights, centered composition isolated on a pure flat solid white background (#ffffff) with soft subtle drop shadow underneath. No pencils sticking out, no text, no watermark."
    }
]

def main():
    client = genai.Client(api_key=API_KEY)
    
    # Obsługa argumentów z linii poleceń (np. python scripts/generate_batch.py koc_czarny.jpg kapcie.jpg --force)
    requested = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv

    prompts_to_run = PROMPTS
    if requested:
        prompts_to_run = [p for p in PROMPTS if p["filename"] in requested]
        if not prompts_to_run:
            print(f"Brak zdefiniowanych promptów dla: {requested}")
            sys.exit(1)

    print(f"🚀 Rozpoczynam generowanie {len(prompts_to_run)} grafik do: {OUTPUT_DIR}")

    success_count = 0
    for idx, item in enumerate(prompts_to_run, 1):
        filename = item["filename"]
        target_path = OUTPUT_DIR / filename
        
        if target_path.exists() and not force:
            print(f"[{idx}/{len(prompts_to_run)}] ⏩ Plik {filename} już istnieje, pomijam (użyj --force aby nadpisać).")
            success_count += 1
            continue

        print(f"[{idx}/{len(prompts_to_run)}] 🎨 Generuję: {filename}...")
        try:
            # Użycie oficjalnego modelu Imagen 3 z Google GenAI SDK
            result = client.models.generate_images(
                model="imagen-3.0-generate-002",
                prompt=item["prompt"],
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1",
                    output_mime_type="image/jpeg"
                )
            )

            if result.generated_images:
                img_bytes = result.generated_images[0].image.image_bytes
                with open(target_path, "wb") as f:
                    f.write(img_bytes)
                print(f"    ✅ Zapisano: {target_path} ({len(img_bytes)} bajtów)")
                success_count += 1
            else:
                print(f"    ⚠️ Brak obrazu w odpowiedzi dla {filename}")
        except Exception as e:
            print(f"    ❌ Błąd dla {filename}: {e}")

    print(f"\n🎉 Zakończono! Pomyślnie gotowych: {success_count}/{len(PROMPTS)} grafik.")

if __name__ == "__main__":
    main()
