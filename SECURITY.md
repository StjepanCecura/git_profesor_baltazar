# Security Policy

## Podržane verzije

Sigurnosna ažuriranja primjenjuju se isključivo na aktivnu produkcijsku verziju u `main` grani.

| Verzija / Grana | Podržano |
| --------------- | -------- |
| main            | Da       |
| starije verzije | Ne       |

Preporučuje se korištenje najnovije verzije projekta.

---

## Prijava sigurnosnih ranjivosti

Sigurnosne ranjivosti **ne prijavljuju se putem javnih GitHub issue-a**.

Molimo da ih prijavite privatno putem e-maila:

**[stjepan.cecura777@gmail.com](mailto:stjepan.cecura777@gmail.com)**
**[direktor@git.hr](mailto:direktor@git.hr)**

U prijavi je potrebno navesti:

* Opis ranjivosti
* Korake za reprodukciju
* Potencijalni utjecaj
* Eventualni proof-of-concept (ako postoji)

### Vrijeme odgovora

* Potvrda zaprimanja: unutar 72 sata
* Procjena i plan rješavanja: u razumnom roku, ovisno o ozbiljnosti

---

## Opseg sigurnosnih problema

Sigurnosnim ranjivostima smatraju se:

* Cross-site scripting (XSS)
* Template injection
* Neispravno sanitiziranje unosa
* Nesigurna manipulacija DOM-om
* Ranljivosti u ovisnostima (npm paketi)
* Manipulacija stanjem aplikacije putem gesti
* Neovlašteno izvršavanje koda
* Problemi vezani uz deployment konfiguraciju
* Otkrivanje osjetljivih podataka (npr. ključevi, tokeni)

---

## Privatnost i obrada podataka

Ovaj projekt koristi kameru isključivo za lokalnu obradu u pregledniku korisnika.

* Video zapis se ne pohranjuje.
* Biometrijski podaci se ne spremaju.
* Podaci o gestama se ne šalju na server.
* Ne koristi se praćenje korisnika.

Sva obrada putem MediaPipe odvija se lokalno na klijentskoj strani.

---

## Što se ne smatra sigurnosnim problemom

Sljedeće stavke nisu sigurnosne ranjivosti:

* Vizualne greške
* Problemi s rezolucijom prikaza
* Performanse na slabijim uređajima
* Razlike u ponašanju između preglednika
* Balans ili težina igre

Takve probleme potrebno je prijaviti putem standardnog issue obrasca.

---

## Odgovorno objavljivanje

* Ranjivosti se analiziraju i popravljaju prije javne objave.
* Javno objavljivanje vrši se tek nakon što je zakrpa dostupna.
* U slučaju kritične ranjivosti, prioritet je brzo izdavanje sigurnosnog ažuriranja.

---

## Preporuke za doprinositelje

Prilikom razvoja potrebno je:

* Izbjegavati korištenje `eval()`
* Ne koristiti nesanitizirani `innerHTML`
* Redovito pokretati `npm audit`
* Ne spremati tajne podatke u repozitorij
* Validirati sve dinamičke ulaze

---

Ovaj dokument može se ažurirati ovisno o promjenama arhitekture ili deployment modela projekta.
