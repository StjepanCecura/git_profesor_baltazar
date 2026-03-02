# Smjernice za doprinos

Zahvaljujemo na interesu za doprinos projektu.
Cilj ovih smjernica je osigurati kvalitetu, sigurnost i konzistentnost koda.

---

## Opća pravila

* Sve izmjene moraju prolaziti kroz Pull Request proces.
* Sve izmjene prvo se spajaju na `devel` granu.
* Izravni commitovi u `main` granu nisu dopušteni.
* Svaka promjena mora biti tehnički opravdana i testirana.

---

## Struktura grana

* Za izradu nove funkcionalnosti ili popravljanja problema, kreirati novu granu iz `devel` grane.
* Granu imenovati prema funkcionalnosti ili problemu.
* Nakon kompletiranog rada, testirati projekt.
* Ako svi testovi uspješno prolaze, napraviti Pull Request prema `devel` grani.

---

## Commit poruke

Preporučuje se korištenje konvencije:

* `feat:` – nova funkcionalnost
* `fix:` – ispravak greške
* `refactor:` – promjena strukture bez promjene ponašanja
* `docs:` – izmjene dokumentacije
* `chore:` – tehničke promjene bez utjecaja na funkcionalnost

Primjer:

```
feat: dodana detekcija pinch geste
fix: ispravljen problem s renderiranjem na 4K rezoluciji
```

---

## Pull Request proces

Svaki Pull Request mora:

* Imati jasan opis promjena
* Biti povezan s postojećim issueom (ako postoji)
* Proći automatske CI provjere
* Biti pregledan od strane "Stjepan Čečura"
* Biti pregledan od strane mentora
* Nemati konflikt s `devel` granom

Obavezna provjera prije slanja:

* Nema `console.log` ispisa
* Nema hardkodiranih tajnih podataka
* `npm audit` ne prijavljuje kritične ranjivosti
* Kod prolazi lint provjeru
* Funkcionalnost testirana lokalno
* Rad ostalih funkcionalnosti nije nehotice promijenjen 

---

## Standardi koda

### JavaScript pravila

* Koristiti striktno uspoređivanje (`===`)
* Izbjegavati globalne varijable
* Ne koristiti `eval()`
* Ne koristiti nesanitizirani `innerHTML`
* Ukloniti sav debug kod prije mergea

### Sigurnosne smjernice

* Ne vjerovati izravno podacima dobivenim iz gesti
* Validirati promjene stanja igre
* Izolirati logiku gesti od logike igre
* Ne izlagati interne konfiguracije u klijentskom kodu

---

## Testiranje

Prije slanja izmjena potrebno je:

1. Pokrenuti aplikaciju lokalno (`npm run dev`)
2. Testirati funkcionalnost na ciljnoj rezoluciji 2160×3840
3. Testirati funkcionalnost na mobilnim uređajima
4. Testirati funkcionalnost na horizontalnim monitorima
5. Provjeriti ponašanje kamere i prepoznavanja gesti
6. Pokrenuti aplikaciju za produkciju (`npm run build`)
7. Provjeriti da testovi prolaze

---

## Sigurnosne ranjivosti

Sigurnosne ranjivosti se ne prijavljuju putem javnih issuea.
Postupak prijave opisan je u `SECURITY.md`.

---

## Verzije i stabilna izdanja

Stabilne verzije označavaju se Git tagovima (npr. `v1.0.0`).
Tagirati isključivo verzije koje su testirane i spremne za produkciju.
Kada želimo sve promjene koje su nastale od posljednje verzije pustiti u produkciju,
napravi se Pull Request na `main` granu. Pull Request može odobriti samo administrator,
a merge se radi prema strategiji "squash & merge".

---

## Završna napomena

Cilj projekta je održiv, siguran i tehnički kvalitetan sustav.
Svi doprinosi moraju podržavati tu svrhu.
