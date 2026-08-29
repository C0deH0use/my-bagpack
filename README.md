# Mój Plecaczek 🎒

Aplikacja dla rodzica i dziecka do wspólnego pakowania: lista rzeczy do zabrania
z obrazkami, ilościami i odhaczaniem. Napisana w **React + TypeScript + Vite +
Tailwind CSS**, hostowana jako statyczna strona na **GitHub Pages** — bez żadnego
serwera.

## Co potrafi

- 🗂️ Listy podzielone na kategorie (lato, zima, higiena, basen, spacer…)
- 🖼️ Każda rzecz ma obrazek (rysunek SVG albo emoji) i **ilość** do zabrania
- ✅ Odznaczanie spakowanych rzeczy, pasek postępu, konfetti i dźwięki
- 🖨️ Drukowanie checklisty
- 💾 **Pamięć**: wszystko zapisuje się samo (w przeglądarce + opcjonalnie w chmurze)
- 🕰️ **Historia**: można podejrzeć i przywrócić każdą starszą wersję listy

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

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token (classic)**.
2. Zaznacz **tylko** uprawnienie **`gist`** i wygeneruj token.
3. Na stronie kliknij pastylkę statusu (np. „Tylko to urządzenie”), wklej token
   i kliknij **Zapisz i połącz** — aplikacja sama utworzy chmurkę.
4. Na drugim urządzeniu: wklej ten sam token **oraz ID chmurki** (do skopiowania
   w tym samym oknie ustawień) → wspólna lista i historia gotowe.

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
standalone.html    # stara, jednoplikowa wersja strony (kopia, nieużywana)
```
