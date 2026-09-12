# Mój Plecaczek 🎒

Aplikacja dla całej rodziny do wspólnego pakowania: lista rzeczy do zabrania
z obrazkami, ilościami i odhaczaniem. Napisana w **React + TypeScript + Vite +
Tailwind CSS**, hostowana jako statyczna strona na **GitHub Pages** — bez żadnego
serwera.

## Jak to działa

- 👥 **Osoba to kontekst pracy** („Kto pakuje"): każdy członek rodziny
  (Marek, Aga, Ania, Tymek) pakuje się **samodzielnie**, a „Wspólne" trzyma
  rzeczy wspólne dla wszystkich (namiot, apteczka…). Widok „Wszyscy" pokazuje
  wszystko naraz, z plakietką właściciela na każdej karcie. Tymczasowo (do
  czasu obrazków AI) rysunki rzeczy mają kolory lekko przesunięte zależnie
  od właściciela — dzięki temu np. skarpetki Marka i Ani łatwo odróżnić.
- 📦 **Katalog** (zakładka „Wszystkie przedmioty") to przestrzeń ze wszystkimi
  stworzonymi rzeczami. Rzecz to **grafika + nazwa + właściciel** — nic więcej.
- 🗂️ **Kategorie komponujemy z katalogu**: na zakładce kategorii klikasz
  „Dodaj z katalogu" i zaznaczasz, co ma się w niej znaleźć. Jedna rzecz może
  należeć do wielu kategorii naraz (np. bluza → Ogólne + Zima). Kategorie to
  typy wyjazdów z rodzinnego spisu (Ogólne, Wyjazdy turystyczne, Wyjazdy za
  granicę, Samolot, Rowery, Zima, Leki, Gospodarcze) plus wyjścia na co dzień
  (Lato, Basen, Spacer…).
- 🔢 **Ilość ustawia się tylko na głównym ekranie** kategorii — przyciskami
  +/− na karcie rzeczy (osobno dla każdej kategorii).
- ✅ Pakowanie odhaczamy w ramach kategorii; pasek postępu, odznaka ✓ na
  osobie i dźwięki. Po spakowaniu całej swojej części: deszcz emoji,
  wielkie „SPAKOWANE!" i zielona odznaka ✓.
- 🖨️ Drukowanie checklisty (z osobą i kategorią w nagłówku).
- 💾 **Pamięć**: wszystko zapisuje się samo (w przeglądarce + opcjonalnie
  w chmurze GitHub Gist).
- 🕰️ **Historia**: można podejrzeć i przywrócić każdą starszą wersję listy.
- ✨ **Obrazki AI** *(na razie wyłączone — włączenie jedną linijką)*: przy
  dodawaniu rzeczy Gemini sam narysuje obrazek — logowanie przez Google
  (OAuth), bez żadnych kluczy API w przeglądarce.

## Praca lokalna

```bash
npm install     # raz, instaluje zależności
npm run dev     # serwer deweloperski (podgląd na żywo)
npm run build   # sprawdza typy (tsc) i buduje statyczną wersję do dist/
npm run preview # podgląd zbudowanej wersji
```

## Jak działa pamięć

1. **Zawsze**: `localStorage` przeglądarki (działa od razu, offline).
2. **Opcjonalnie — chmura GitHub (Gist)**: tajny Gist z plikiem
   `moj-plecaczek.json`. Gist automatycznie pamięta **wszystkie wersje** pliku,
   więc dostajemy historię i synchronizację między telefonem a komputerem.

> Token **nie jest** zapisany w kodzie strony — każdy wpisuje go raz na swoim
> urządzeniu (trafia tylko do localStorage tej przeglądarki).

### Konfiguracja chmury (raz, ~3 minuty)

Wystarczy **sam token (PAT)** — aplikacja sama znajdzie chmurkę na koncie
albo utworzy nową, jeśli jej nie ma.

1. Utwórz **token (classic)**:
   [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
   → nadaj nazwę (np. „Mój Plecaczek”) → zaznacz **tylko** uprawnienie
   **`gist`** → *Generate token*.
   (Tokeny fine-grained nie mają dziś dostępu do gistów, dlatego classic.)
2. Na stronie kliknij pastylkę statusu (np. „Tylko to urządzenie”), wklej token
   i kliknij **Połącz chmurkę** — gotowe.
3. Na drugim urządzeniu (np. telefonie córki): wklej **ten sam token** —
   aplikacja sama odnajdzie wspólną chmurkę.

> Ręczne wpisywanie ID chmurki jest dostępne w sekcji „Zaawansowane” — potrzebne
> tylko wtedy, gdy chmurka ma być współdzielona między **różnymi** kontami GitHub.

## ✨ Obrazki AI (Gemini) — logowanie przez Google, bez kluczy

> **Status: na razie wyłączone.** Wystarczy ustawić `AI_FEATURE_ENABLED = true`
> w `src/lib/ai/config.ts` — cała funkcja wraca (opis i konfiguracja poniżej
> pozostają aktualne).

Przy dodawaniu nowej rzeczy możesz kliknąć **„✨ Narysuj z nazwy”** — obrazek
stworzy model obrazkowy Gemini (Nano Banana). Cała droga (prompt → rysowanie →
zmniejszenie do ~192 px PNG) to mały graf **LangGraph.js** w `src/lib/ai/`.

Najważniejsze: aplikacja **nie używa żadnego klucza API**. Logujesz się przez
Google (OAuth), a krótkotrwały token dostępu (~1 h) trzymamy **wyłącznie w
pamięci** przeglądarki — nie ląduje ani w localStorage, ani w chmurce. Obrazki
zapisują się razem z rzeczami i synchronizują przez GitHub Gist jak wszystko;
ta sama nazwa rzeczy nie rysuje się drugi raz (cache w przeglądarce).

### Jednorazowa konfiguracja (~5 minut)

1. Wejdź na [console.cloud.google.com](https://console.cloud.google.com) →
   utwórz (lub wybierz) projekt.
2. Włącz **Generative Language API**
   ([bezpośredni link](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)).
3. **APIs & Services → OAuth consent screen**: typ *External*, tryb
   *Testing*, dodaj własne konto Google jako **test user**.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   typ **Web application**. W *Authorized JavaScript origins* wpisz adresy, na
   których działa aplikacja, np. `http://localhost:5173` (dev) i
   `https://<twoja-nazwa>.github.io` (produkcja).
5. Skopiuj **Client ID** (kształt `…apps.googleusercontent.com`) oraz **ID
   projektu**.
6. W aplikacji: **⚙️ → Obrazki AI** → wklej oba pola → **Zaloguj przez Google**.

Przy pierwszym logowaniu Google ostrzeże, że „aplikacja nie jest
zweryfikowana” — to normalne dla prywatnych aplikacji w trybie *Testing*;
kliknij *Continue*. Token wygasa po ~godzinie i odnawia się po cichu, póki
żyje sesja Google. „Wyloguj i cofnij zgodę” usuwa dostęp całkowicie.

> **Dlaczego nie Z.ai (GLM)?** Konto Z.ai uwierzytelnia się wyłącznie kluczem
> API — nie ma OAuth — więc w aplikacji bez serwera klucz musiałby leżeć w
> przeglądarce, czyli dokładnie tego, czego unikamy. Kod w `src/lib/ai/` jest
> przygotowany tak, że dodanie Z.ai jako „pisarza promptów” za malutkim
> backendem to podmiana jednej funkcji (`writeImagePrompt` w `gemini.ts`).

## Publikacja na GitHub Pages

Repo zawiera gotowy workflow (`.github/workflows/deploy.yml`), który sam buduje
i publikuje stronę po każdym `git push` do gałęzi `main`.

Jednorazowo włącz: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. Strona będzie pod `https://<twoja-nazwa>.github.io/my-bagpack/`.

> Jeśli zmienisz nazwę repozytorium, popraw `base` w `vite.config.ts`.

## Struktura

```
src/
  data/            # osoby, kategorie, domyślne rzeczy, rysunki SVG, emoji
  lib/             # storage (localStorage), gist (chmura + historia), sounds
  lib/ai/          # obrazki AI: OAuth Google (token tylko w pamięci), klient Gemini, potok LangGraph
  hooks/           # usePackingList — stan listy i synchronizacja
  components/      # Header, PersonTabs, CategoryTabs, ProgressCard, ItemCard, modale…
```
