import type { PackingItem } from '../types';

export const DEFAULT_ITEMS: PackingItem[] = [
  // Lato
  { id: '1', categoryId: 'lato', name: 'Koszulka (T-shirt)', svgKey: 'koszulka', emoji: '👕', quantity: 4, packed: false },
  { id: '2', categoryId: 'lato', name: 'Spodnie krótkie', svgKey: 'spodnie_krotkie', emoji: '🩳', quantity: 3, packed: false },
  { id: '3', categoryId: 'lato', name: 'Spodnie długie', svgKey: 'spodnie_dlugie', emoji: '👖', quantity: 2, packed: false },
  { id: '4', categoryId: 'lato', name: 'Bluza rozpinana', svgKey: 'bluza', emoji: '🦺', quantity: 2, packed: false },
  { id: '5', categoryId: 'lato', name: 'Koszulka długi rękaw', svgKey: 'koszulka_dlugi', emoji: '👕', quantity: 2, packed: false },
  { id: '6', categoryId: 'lato', name: 'Majtki', svgKey: 'majtki', emoji: '🩲', quantity: 5, packed: false },
  { id: '7', categoryId: 'lato', name: 'Skarpetki', svgKey: 'skarpetki', emoji: '🧦', quantity: 5, packed: false },
  { id: '8', categoryId: 'lato', name: 'Czapka z daszkiem', svgKey: 'czapka_daszek', emoji: '🧢', quantity: 1, packed: false },
  { id: '9', categoryId: 'lato', name: 'Okulary przeciwsłoneczne', svgKey: 'okulary', emoji: '🕶️', quantity: 1, packed: false },
  { id: '10', categoryId: 'lato', name: 'Krem do opalania', svgKey: 'krem_opalanie', emoji: '🧴', quantity: 1, packed: false },
  { id: '101', categoryId: 'lato', name: 'Piżamka do spania', svgKey: 'pizama', emoji: '🌙', quantity: 2, packed: false },
  { id: '102', categoryId: 'lato', name: 'Ulubiona maskotka', svgKey: 'maskotka', emoji: '🧸', quantity: 1, packed: false },

  // Zima
  { id: '11', categoryId: 'zima', name: 'Ciepłe spodnie', svgKey: 'cieple_spodnie', emoji: '👖', quantity: 2, packed: false },
  { id: '12', categoryId: 'zima', name: 'Sweter', svgKey: 'sweter', emoji: '🧥', quantity: 2, packed: false },
  { id: '13', categoryId: 'zima', name: 'Bluza', svgKey: 'bluza', emoji: '🦺', quantity: 2, packed: false },
  { id: '14', categoryId: 'zima', name: 'Koszulka długi rękaw', svgKey: 'koszulka_dlugi', emoji: '👕', quantity: 4, packed: false },
  { id: '15', categoryId: 'zima', name: 'Skarpetki ciepłe', svgKey: 'skarpetki', emoji: '🧦', quantity: 5, packed: false },
  { id: '16', categoryId: 'zima', name: 'Majtki', svgKey: 'majtki', emoji: '🩲', quantity: 5, packed: false },
  { id: '17', categoryId: 'zima', name: 'Gruba czapka zimowa', svgKey: 'gruba_czapka_zima', emoji: '🧶', quantity: 1, packed: false },
  { id: '18', categoryId: 'zima', name: 'Buty zimowe', svgKey: 'buty_zimowe', emoji: '🥾', quantity: 1, packed: false },
  { id: '103', categoryId: 'zima', name: 'Rękawiczki', svgKey: 'rekawiczki', emoji: '🧤', quantity: 2, packed: false },
  { id: '104', categoryId: 'zima', name: 'Szalik / Komin', svgKey: 'szalik', emoji: '🧣', quantity: 1, packed: false },

  // Kosmetyczka & Zdrowie
  { id: '301', categoryId: 'higiena', name: 'Szczoteczka do zębów', svgKey: 'szczoteczka_zebow', emoji: '🪥', quantity: 1, packed: false },
  { id: '302', categoryId: 'higiena', name: 'Pasta do zębów', svgKey: 'pasta_zebow', emoji: '🧴', quantity: 1, packed: false },
  { id: '303', categoryId: 'higiena', name: 'Pomadka ochronna', svgKey: 'pomadka', emoji: '💄', quantity: 1, packed: false },
  { id: '304', categoryId: 'higiena', name: 'Perełki (lekarstwa)', svgKey: 'lekarstwa', emoji: '💊', quantity: 1, packed: false },
  { id: '305', categoryId: 'higiena', name: 'Szczotka do włosów', svgKey: 'szczotka_wlosow', emoji: '🪮', quantity: 1, packed: false },
  { id: '306', categoryId: 'higiena', name: 'Gumki do włosów', svgKey: 'gumki_wlosow', emoji: '🎀', quantity: 3, packed: false },
  { id: '307', categoryId: 'higiena', name: 'Spinki do włosów', svgKey: 'spinki_wlosow', emoji: '✨', quantity: 4, packed: false },
  { id: '308', categoryId: 'higiena', name: 'Grzebień', svgKey: 'grzebien', emoji: '🪮', quantity: 1, packed: false },

  // Zabawa & Rysowanie
  { id: '401', categoryId: 'zabawa', name: 'Kredki', svgKey: 'kredki', emoji: '✏️', quantity: 1, packed: false },
  { id: '402', categoryId: 'zabawa', name: 'Piórnik', svgKey: 'piornik', emoji: '👝', quantity: 1, packed: false },
  { id: '403', categoryId: 'zabawa', name: 'Blok rysunkowy / Kolorowanka', svgKey: 'blok_rysunkowy', emoji: '🎨', quantity: 1, packed: false },
  { id: '404', categoryId: 'zabawa', name: 'Zabawki', svgKey: 'zabawki', emoji: '🧸', quantity: 2, packed: false },

  // Basen
  { id: '19', categoryId: 'basen', name: 'Strój kąpielowy', svgKey: 'stroje_kapielowe', emoji: '👙', quantity: 1, packed: false },
  { id: '20', categoryId: 'basen', name: 'Ręcznik', svgKey: 'recznik', emoji: '🧴', quantity: 1, packed: false },
  { id: '21', categoryId: 'basen', name: 'Klapki', svgKey: 'klapki', emoji: '🩴', quantity: 1, packed: false },
  { id: '22', categoryId: 'basen', name: 'Okularki do pływania', svgKey: 'okularki_basen', emoji: '🤿', quantity: 1, packed: false },

  // Spacer
  { id: '23', categoryId: 'spacer', name: 'Bidon z wodą', svgKey: 'bidon', emoji: '🧃', quantity: 1, packed: false },
  { id: '24', categoryId: 'spacer', name: 'Przekąski', svgKey: 'przekaski', emoji: '🍏', quantity: 2, packed: false },
  { id: '25', categoryId: 'spacer', name: 'Bluza na zmianę', svgKey: 'bluza', emoji: '🦺', quantity: 1, packed: false },
  { id: '26', categoryId: 'spacer', name: 'Czapka z daszkiem', svgKey: 'czapka_daszek', emoji: '🧢', quantity: 1, packed: false },
];
