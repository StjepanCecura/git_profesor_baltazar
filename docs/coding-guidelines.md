# Smjernice za pisanje koda (Coding Guidelines)

Cilj ovog dokumenta je osigurati konzistentnost, sigurnost i dugoročnu održivost projekta.

---

# 1. Opća načela

* Kod mora biti čitljiv i razumljiv bez dodatnih objašnjenja.
* Funkcionalnost ima prednost nad kompleksnošću.
* Svaka funkcija mora imati jasno definiranu odgovornost.
* Izbjegavati dupliranje logike (DRY princip).
* Sigurnost ima prioritet nad brzinom implementacije.

---

# 2. JavaScript standardi

## Sintaksa i stil

* Koristiti `const` i `let`, nikada `var`.
* Koristiti striktno uspoređivanje (`===` i `!==`).
* Koristiti arrow funkcije gdje je primjereno.
* Izbjegavati duboko ugniježđene strukture.
* Svaka funkcija treba imati jednu odgovornost.

## Zabranjeno

* `eval()`
* Nesanitizirani `innerHTML`
* Direktna manipulacija DOM-a bez validacije
* Globalne varijable bez opravdanja
* Hardkodirani API ključevi ili tajne vrijednosti

---

# 3. Sigurnosne smjernice

Projekt koristi kameru i obradu gesti, stoga je sigurnost kritična.

## Obrada unosa

* Ne vjerovati podacima dobivenim iz gesti bez validacije.
* Validirati prijelaze stanja igre.
* Spriječiti neautorizirane manipulacije logikom igre.

## DOM manipulacija

* Izbjegavati ubacivanje HTML-a putem template stringova.
* Sanitizirati dinamički sadržaj.
* Ne oslanjati se na implicitne pretpostavke o korisničkom unosu.

## Ovisnosti

* Redovito pokretati `npm audit`.
* Ne dodavati nepotrebne pakete.
* Provjeriti sigurnost novih ovisnosti prije uvođenja.

---

# 4. Upravljanje stanjem

* Stanje igre mora biti centralizirano.
* Ne mijenjati stanje direktno iz UI komponente.
* Koristiti jasne funkcije za prijelaz stanja.
* Onemogućiti nekonzistentne prijelaze (npr. pokretanje igre dok je već pokrenuta).

---

# 5. Performanse

Budući da aplikacija koristi real-time obradu slike:

* Minimizirati nepotrebne re-render pozive.
* Izbjegavati kompleksne izračune unutar render petlje.
* Koristiti debounce/throttle gdje je potrebno.
* Ne blokirati glavni thread dugotrajnim operacijama.

---

# 6. Debug i logiranje

* Privremeni `console.log` dozvoljen je samo tijekom razvoja.
* Svi debug ispisi moraju biti uklonjeni prije merge-a.
* Ne ispisivati osjetljive podatke u konzolu.

---

# 7. Komentiranje koda

* Komentirati *zašto*, ne *što*.
* Objasniti složenije algoritme ili matematičke izračune.
* Ne ostavljati zastarjele komentare.

Primjer:

```javascript
// Validacija prijelaza stanja kako bi se spriječilo višestruko pokretanje igre
if (gameState !== "running") {
    startGame();
}
```

---

# 8. Testiranje prije slanja izmjena

Prije slanja Pull Request-a potrebno je:

1. Pokrenuti aplikaciju lokalno (`npm run dev`)
2. Testirati na rezoluciji 2160×3840
3. Testirati pristup s mobilnog uređaja
4. Provjeriti ispravno prepoznavanje gesti
5. Provjeriti da lint i sigurnosne provjere prolaze

---

# 9. Verzije i stabilnost

* Stabilne verzije označavaju se Git tagovima (npr. `v1.0.0`).
* Ne mijenjati postojeće tagove.
* Veće arhitekturne promjene moraju biti jasno dokumentirane.

---

# 10. Dugoročna održivost

Kod mora biti:

* Predvidljiv
* Modularan
* Lako proširiv novim igrama
* Lako prilagodljiv novim tipovima gesti

Arhitektura mora omogućiti dodavanje nove igre bez izmjene postojećih modula za prepoznavanje gesti.

---

Ove smjernice mogu se ažurirati sukladno razvoju projekta i promjenama arhitekture.
