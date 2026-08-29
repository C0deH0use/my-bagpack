# Mój Plecaczek 🎒

Aplikacja dla rodzica i dziecka do wspólnego pakowania: lista rzeczy do zabrania
z obrazkami, ilościami i odhaczaniem. Napisana w **React + TypeScript + Vite +
Tailwind CSS**, hostowana jako statyczna strona na **GitHub Pages** — bez żadnego
serwera.

## Jak to działa

- 📦 **Katalog** (zakładka „Wszystkie rzeczy”) to przestrzeń ze wszystkimi
  stworzonymi rzeczami. Rzecz to **grafika + nazwa** — nic więcej.
- 🗂️ **Kategorie komponujemy z katalogu**: na zakładce kategorii klikasz
  „Dodaj z katalogu” i zaznaczasz, co ma się w niej znaleźć. Jedna rzecz może
  należeć do wielu kategorii naraz (np. bluza → Lato + Zima + Spacer).
- 🔢 **Ilość ustawia się tylko na głównym ekranie** kategorii — przyciskami
  +/− na karcie rzeczy (osobno dla każdej kategorii).
- ✅ Pakowanie odhaczamy w ramach kategorii; pasek postępu i dźwięki.
- 🎉 Po spakowaniu całej kategorii: deszcz emoji, wielkie „SPAKOWANE!”
  i zielona odznaka ✓ na zakładce.
- 🖨️ Drukowanie checklisty.
- 💾 **Pamięć**: wszystko zapisuje się samo (w przeglądarce + opcjonalnie
  w chmurze GitHub Gist).
- 🕰️ **Historia**: można podejrzeć i przywrócić każdą starszą wersję listy.

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

## Publikacja na GitHub Pages

Repo zawiera gotowy workflow (`.github/workflows/deploy.yml`), który sam buduje
i publikuje stronę po każdym `git push` do gałęzi `main`.

Jednorazowo włącz: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. Strona będzie pod `https://<twoja-nazwa>.github.io/my-bagpack/`.

> Jeśli zmienisz nazwę repozytorium, popraw `base` w `vite.config.ts`.

## Struktura

```
src/
  data/            # kategorie, domyślne rzeczy, rysunki SVG, emoji
  lib/             # storage (localStorage), gist (chmura + historia), sounds
  hooks/           # usePackingList — stan listy i synchronizacja
  components/      # Header, CategoryTabs, ProgressCard, ItemCard, modale…
```
