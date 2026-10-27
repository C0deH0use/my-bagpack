export interface GalleryImage {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  // ——— ☕ Termosy & Naczynia termiczne ———
  { id: 'termos', name: 'Termos turystyczny', category: 'Termosy & Kuchnia', url: '/items/termos.jpg' },
  { id: 'termos_obiadowy', name: 'Termos obiadowy na zupę', category: 'Termosy & Kuchnia', url: '/items/termos_obiadowy.jpg' },
  { id: 'kubek_termiczny', name: 'Kubek termiczny z ustnikiem', category: 'Termosy & Kuchnia', url: '/items/kubek_termiczny.jpg' },

  // ——— 🍾 Korkociągi & Otwieracze ———
  { id: 'otwieracz_do_wina', name: 'Otwieracz do wina (trybuszon)', category: 'Akcesoria & Narzędzia', url: '/items/otwieracz_do_wina.jpg' },
  { id: 'korkociag_motylkowy', name: 'Korkociąg skrzydełkowy (motylkowy)', category: 'Akcesoria & Narzędzia', url: '/items/korkociag_motylkowy.jpg' },
  { id: 'korkociag_drewniany', name: 'Korkociąg tradycyjny (T-bar)', category: 'Akcesoria & Narzędzia', url: '/items/korkociag_drewniany.jpg' },
  { id: 'korkociag_kelnerski', name: 'Korkociąg kelnerski (dwustopniowy)', category: 'Akcesoria & Narzędzia', url: '/items/korkociag_kelnerski.jpg' },

  // ——— 💡 Oświetlenie & Lampki ———
  { id: 'lampka_czolowka', name: 'Lampka czołówka (outdoor)', category: 'Oświetlenie & Biwak', url: '/items/lampka_czolowka.jpg' },
  { id: 'lampka_kempingowa', name: 'Lampka kempingowa (namiotowa)', category: 'Oświetlenie & Biwak', url: '/items/lampka_kempingowa.jpg' },
  { id: 'lampka_latarka', name: 'Latarka kieszonkowa', category: 'Oświetlenie & Biwak', url: '/items/lampka_latarka.jpg' },

  // ——— 🩹 Apteczka & Pierwsza pomoc ———
  { id: 'bandaze', name: 'Bandaże medyczne (rolka)', category: 'Apteczka & Zdrowie', url: '/items/bandaze.jpg' },
  { id: 'bandaz_elastyczny', name: 'Bandaż elastyczny z zapinkami', category: 'Apteczka & Zdrowie', url: '/items/bandaz_elastyczny.jpg' },
  { id: 'bandaz_kompres', name: 'Kompres gazowy opatrunkowy', category: 'Apteczka & Zdrowie', url: '/items/bandaz_kompres.jpg' },

  // ——— 🧺 Pranie & Ogień ———
  { id: 'proszek_pudelko', name: 'Proszek do prania (pudełko z miarką)', category: 'Gospodarcze', url: '/items/proszek_pudelko.jpg' },
  { id: 'proszek_plyn', name: 'Płyn do prania (butelka)', category: 'Gospodarcze', url: '/items/proszek_plyn.jpg' },
  { id: 'zapalniczka_czerwona', name: 'Zapalniczka piezoelektryczna', category: 'Gospodarcze', url: '/items/zapalniczka_czerwona.jpg' },
  { id: 'zapalniczka_metalowa', name: 'Zapalniczka benzynowa metalowa', category: 'Gospodarcze', url: '/items/zapalniczka_metalowa.jpg' },

  // ——— 🛌 Śpiwory & Biwak ———
  { id: 'spiwor_mumia', name: 'Śpiwór trekkingowy (mumia)', category: 'Biwak & Turystyka', url: '/items/spiwor_mumia.jpg' },
  { id: 'spiwor_koldra', name: 'Śpiwór turystyczny (kołdra)', category: 'Biwak & Turystyka', url: '/items/spiwor_koldra.jpg' },
  { id: 'spiwor_kompresyjny', name: 'Śpiwór w worku kompresyjnym', category: 'Biwak & Turystyka', url: '/items/spiwor_kompresyjny.jpg' },

  // ——— 🧥 Kurtki & Peleryny ———
  { id: 'softshell_koralowy', name: 'Kurtka Softshell (koralowa)', category: 'Odzież & Przeciwdeszczowe', url: '/items/softshell_koralowy.jpg' },
  { id: 'softshell_turkusowy', name: 'Kurtka Softshell (turkusowa)', category: 'Odzież & Przeciwdeszczowe', url: '/items/softshell_turkusowy.jpg' },
  { id: 'softshell_grafitowy', name: 'Kurtka Softshell męska (grafitowa)', category: 'Odzież & Przeciwdeszczowe', url: '/items/softshell_grafitowy.jpg' },
  { id: 'peleryna_zolta', name: 'Płaszcz przeciwdeszczowy (żółty)', category: 'Odzież & Przeciwdeszczowe', url: '/items/peleryna_zolta.jpg' },
  { id: 'peleryna_oliwkowa', name: 'Peleryna poncho (oliwkowa)', category: 'Odzież & Przeciwdeszczowe', url: '/items/peleryna_oliwkowa.jpg' },
  { id: 'peleryna_przezroczysta', name: 'Peleryna przeciwdeszczowa przezroczysta', category: 'Odzież & Przeciwdeszczowe', url: '/items/peleryna_przezroczysta.jpg' },

  // ——— 🏊‍♀️ Basen & Woda ———
  { id: 'czepek_blekitny', name: 'Czepek basenowy błękitny', category: 'Basen & Pływanie', url: '/items/czepek_blekitny.jpg' },
  { id: 'czepek_rozowy', name: 'Czepek basenowy różowy', category: 'Basen & Pływanie', url: '/items/czepek_rozowy.jpg' },
  { id: 'czepek_sportowy', name: 'Czepek basenowy sportowy', category: 'Basen & Pływanie', url: '/items/czepek_sportowy.jpg' },

  // ——— 🪥 Higiena & Kosmetyczka ———
  { id: 'szczoteczki_pasty', name: 'Szczoteczki i pasty do zębów', category: 'Higiena & Kosmetyczka', url: '/items/szczoteczki_pasty.jpg' },
  { id: 'szczoteczki_pasty_etui', name: 'Etui podróżne na szczoteczkę i pastę', category: 'Higiena & Kosmetyczka', url: '/items/szczoteczki_pasty_etui.jpg' },
  { id: 'szczoteczki_pasty_kubek', name: 'Kubek ze szczoteczkami i pastą', category: 'Higiena & Kosmetyczka', url: '/items/szczoteczki_pasty_kubek.jpg' },
  { id: 'szczoteczka_elektryczna', name: 'Szczoteczka soniczna / elektryczna', category: 'Higiena & Kosmetyczka', url: '/items/szczoteczka_elektryczna.jpg' },

  // ——— 🔌 Elektronika & Ładowarki ———
  { id: 'ladowarka_usbc', name: 'Ładowarka USB-C', category: 'Elektronika & Kable', url: '/items/ladowarka_usbc.jpg' },
  { id: 'ladowarka_usbc_gan', name: 'Ładowarka wieloportowa GaN', category: 'Elektronika & Kable', url: '/items/ladowarka_usbc_gan.jpg' },
  { id: 'kabel_usbc', name: 'Kabel USB-C w oplocie', category: 'Elektronika & Kable', url: '/items/kabel_usbc.jpg' },
  { id: 'ladowarka_apple_watch', name: 'Ładowarka Apple Watch', category: 'Elektronika & Kable', url: '/items/ladowarka_apple_watch.jpg' },

  // ——— 👶 Niemowlę & Pieluchy ———
  { id: 'pieluchy', name: 'Pieluchy jednorazowe', category: 'Niemowlę & Dziecko', url: '/items/pieluchy.jpg' },
  { id: 'pielucha_tetra', name: 'Pielucha tetrowa z agrafką', category: 'Niemowlę & Dziecko', url: '/items/pielucha_tetra.jpg' },
];
