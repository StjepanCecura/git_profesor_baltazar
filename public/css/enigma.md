 # Prilagodba stila za ikone ruke na početnoj stranici Enigme
 ## Lokacija: Početna stranica – tablica s ikonama u `.instructionsTable`
 ## Opis Na početnoj stranici igre dodane su stilizirane ikone ruke (palac gore, dolje, odabir).
  Kako bi se osigurala dobra responzivnost i centrirani prikaz, korišten je sljedeći CSS kod:
  Kod:
  .instructionsTable tr.instructionsImages img {
    max-width: 20% !important;
    height: auto !important;
    display: block;
    margin: 0 auto;
 }

