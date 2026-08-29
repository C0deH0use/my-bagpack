import type { PackingItem } from '../types';

/** Skrót do tworzenia wpisów: klucze assignments = kategorie, wartości = ilości */
function item(
  id: string,
  name: string,
  svgKey: string,
  emoji: string,
  assignments: Record<string, number>,
): PackingItem {
  return {
    id,
    name,
    svgKey,
    emoji,
    categoryIds: Object.keys(assignments),
    quantities: assignments,
    packedIn: [],
  };
}

/**
 * Katalog dostępnych rzeczy — jedna rzecz = jeden wpis.
 * Kategorie są przypisaniami, a ilość wybierana jest osobno dla każdej z nich,
 * np. bluza: Lato 2 szt., Zima 2 szt., Spacer 1 szt.
 */
export const DEFAULT_ITEMS: PackingItem[] = [
  // Ubrania uniwersalne
  item('1', 'Koszulka (T-shirt)', 'koszulka', '👕', { lato: 4, zima: 4 }),
  item('2', 'Koszulka długi rękaw', 'koszulka_dlugi', '👕', { lato: 2, zima: 4 }),
  item('3', 'Spodnie krótkie', 'spodnie_krotkie', '🩳', { lato: 3 }),
  item('4', 'Spodnie długie', 'spodnie_dlugie', '👖', { lato: 2, zima: 1 }),
  item('5', 'Bluza rozpinana', 'bluza', '🦺', { lato: 2, zima: 2, spacer: 1 }),
  item('6', 'Majtki', 'majtki', '🩲', { lato: 5, zima: 5 }),
  item('7', 'Skarpetki', 'skarpetki', '🧦', { lato: 5, zima: 5 }),
  item('8', 'Piżamka do spania', 'pizama', '🌙', { lato: 2, zima: 2 }),
  item('9', 'Ulubiona maskotka', 'maskotka', '🧸', { lato: 1, zima: 1, wycieczka: 1 }),

  // Lato / słońce
  item('10', 'Czapka z daszkiem', 'czapka_daszek', '🧢', { lato: 1, spacer: 1 }),
  item('11', 'Okulary przeciwsłoneczne', 'okulary', '🕶️', { lato: 1, spacer: 1 }),
  item('12', 'Krem do opalania', 'krem_opalanie', '🧴', { lato: 1, basen: 1 }),

  // Zima
  item('13', 'Ciepłe spodnie', 'cieple_spodnie', '👖', { zima: 2 }),
  item('14', 'Sweter', 'sweter', '🧥', { zima: 2 }),
  item('15', 'Gruba czapka zimowa', 'gruba_czapka_zima', '🧶', { zima: 1 }),
  item('16', 'Buty zimowe', 'buty_zimowe', '🥾', { zima: 1 }),
  item('17', 'Rękawiczki', 'rekawiczki', '🧤', { zima: 2 }),
  item('18', 'Szalik / Komin', 'szalik', '🧣', { zima: 1 }),

  // Kosmetyczka & Zdrowie
  item('19', 'Szczoteczka do zębów', 'szczoteczka_zebow', '🪥', { higiena: 1 }),
  item('20', 'Pasta do zębów', 'pasta_zebow', '🧴', { higiena: 1 }),
  item('21', 'Pomadka ochronna', 'pomadka', '💄', { higiena: 1, zima: 1 }),
  item('22', 'Perełki (lekarstwa)', 'lekarstwa', '💊', { higiena: 1 }),
  item('23', 'Szczotka do włosów', 'szczotka_wlosow', '🪮', { higiena: 1 }),
  item('24', 'Gumki do włosów', 'gumki_wlosow', '🎀', { higiena: 3 }),
  item('25', 'Spinki do włosów', 'spinki_wlosow', '✨', { higiena: 4 }),
  item('26', 'Grzebień', 'grzebien', '🪮', { higiena: 1 }),

  // Zabawa & Rysowanie
  item('27', 'Kredki', 'kredki', '✏️', { zabawa: 1, wycieczka: 1 }),
  item('28', 'Piórnik', 'piornik', '👝', { zabawa: 1, wycieczka: 1 }),
  item('29', 'Blok rysunkowy / Kolorowanka', 'blok_rysunkowy', '🎨', { zabawa: 1, wycieczka: 1 }),
  item('30', 'Zabawki', 'zabawki', '🧸', { zabawa: 2 }),

  // Basen
  item('31', 'Strój kąpielowy', 'stroje_kapielowe', '👙', { basen: 1 }),
  item('32', 'Ręcznik', 'recznik', '🧴', { basen: 1 }),
  item('33', 'Klapki', 'klapki', '🩴', { basen: 1 }),
  item('34', 'Okularki do pływania', 'okularki_basen', '🤿', { basen: 1 }),

  // Spacer / Wycieczka
  item('35', 'Bidon z wodą', 'bidon', '🧃', { spacer: 1, wycieczka: 1 }),
  item('36', 'Przekąski', 'przekaski', '🍏', { spacer: 2, wycieczka: 2 }),
];
