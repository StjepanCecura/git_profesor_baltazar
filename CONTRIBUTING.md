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
* Uspješno proći sve korake navedene u sekciji "Provjere prije Pull Requesta"

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

## Provjere prije Pull Requesta (Testiranje)

Prije slanja izmjena i kreiranja Pull Requesta, obavezno je provesti sljedeće korake.

**VAŽNO:** Ukoliko je nešto promijenjeno tijekom jedne od provjera (poput ovisnosti tijekom `npm audit` ili koda tijekom `npm ci` / `npm run lint`), obavezno commitajte te promjene i **ponovno provjerite sve od početka**.

1. **Pravilno formatiranje**
* Formatirati sve datoteke koje su mijenjane
* Formatiranje raditi preko ekstenzije "Prettier"

2. **Sinkronizacija ovisnosti:**
* Pokrenuti `npm ci`


3. **Provjera kvalitete koda (Lint):**
* Pokrenuti `npm run lint`
* Ne smiju postojati greške u datotekama na kojima je rađeno.
* Kod ne smije sadržavati `console.log` ispise niti hardkodirane tajne podatke.


4. **Sigurnosna provjera paketa:**
* Pokrenuti `npm audit --audit-level=high`
* Ranjivosti prijaviti ili popraviti pomoću `npm audit fix`.


5. **Provjera funkcionalnosti aplikacije:**
* Provjeriti cjelokupnu funkcionalnost aplikacije lokalno i osigurati da rad ostalih funkcionalnosti nije nehotice promijenjen.
* Provjeriti ponašanje kamere i prepoznavanja gesti.
* **Provjeriti funkcionalnost na raznim ekranima.** Obavezno testirati na:
* Vertikalnim 4K ekranima (ciljna rezolucija 2160×3840)
* Horizontalnim monitorima
* Mobilnim uređajima


6. **Provjera Build procesa:**
* Uvjerite se da se aplikacija uspješno kompajlira u svim modovima rada pokretanjem sljedećih naredbi:
* `npm run build`
* `npm run build -- --mode staging`
* `npm run build -- --mode production`

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