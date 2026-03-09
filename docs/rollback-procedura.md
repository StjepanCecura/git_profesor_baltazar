# Rollback procedura

Ovaj dokument opisuje postupak vraćanja aplikacije na prethodnu stabilnu verziju u slučaju kritične greške u produkciji.

Rollback mora biti brz, kontroliran i dokumentiran.

---

# 1. Kada pokrenuti rollback

Rollback se pokreće u slučaju:

* Kritične greške u produkciji
* Neispravnog rada prepoznavanja gesti
* Rušenja aplikacije
* Sigurnosne ranjivosti
* Neispravnog builda koji je deployan

Manji vizualni problemi ne zahtijevaju rollback.

---

# 2. Preduvjeti

Prije rollbacka potrebno je:

* Identificirati zadnju stabilnu verziju (Git tag)
* Potvrditi da je ta verzija prethodno radila ispravno
* Evidentirati razlog rollbacka

Stabilne verzije označavaju se Git tagovima (npr. `v1.0.0`).

---

# 3. Standardni rollback putem Git-a (preporučeno)

## Korak 1 – Identifikacija stabilnog taga

Prikaz dostupnih tagova:

```bash
git tag
```

Odabrati zadnju stabilnu verziju (npr. `v1.0.0`).

---

## Korak 2 – Kreiranje rollback grane

```bash
git checkout -b rollback/v1.0.0 v1.0.0
```

---

## Korak 3 – Merge u main

```bash
git checkout main
git merge rollback/v1.0.0
git push origin main
```

Time se automatski pokreće CI/CD pipeline i redeploya stabilna verzija.

---

# 4. Alternativni rollback (bez merge-a)

Ako nije poželjno raditi merge:

```bash
git checkout v1.0.0
git push origin HEAD:main --force
```

Upozorenje:
Force push koristiti samo u iznimnim situacijama.

---

# 5. Hitni ručni rollback na serveru

Ako CI/CD nije dostupan:

1. SSH pristupiti produkcijskom serveru.
2. Otići u direktorij deploymenta.
3. Ručno vratiti prethodni build artefakt (ako postoji backup).
4. Ponovno pokrenuti servis (ako je primjenjivo).

Ovaj postupak koristiti samo kao zadnju opciju.

---

# 6. Post-rollback postupak

Nakon uspješnog rollbacka:

1. Potvrditi da aplikacija radi ispravno.
2. Testirati ključne funkcionalnosti:

   * Prepoznavanje gesti
   * Pokretanje igre
   * Prikaz na rezoluciji 2160×3840
   * Mobilni pristup
3. Otvoriti issue s opisom problema.
4. Analizirati uzrok (root cause analysis).
5. Implementirati ispravak u zasebnoj grani.

---

# 7. Prevencija budućih rollbackova

* Tagirati svaku stabilnu verziju prije većih promjena.
* Testirati na produkcijskoj rezoluciji.
* Provjeriti `npm audit` prije deploya.
* Ne deployati nepotvrđene eksperimentalne funkcionalnosti.
* Koristiti staging okruženje ako je dostupno.

---

# 8. Verzije i stabilnost

Stabilna verzija je ona koja:

* Prolazi sve CI provjere
* Testirana je lokalno
* Testirana je na mobilnim uređajima
* Nema poznatih kritičnih grešaka

Preporučuje se semantičko verzioniranje:

* MAJOR – velike promjene
* MINOR – nove funkcionalnosti
* PATCH – ispravci grešaka

Primjer:

```bash
git tag -a v1.0.0 -m "Stabilna produkcijska verzija"
git push origin v1.0.0
```

---

# 9. Evidencija rollbacka

Svaki rollback mora biti dokumentiran:

* Datum
* Verzija na koju je vraćeno
* Razlog
* Osoba koja je pokrenula rollback
* Plan daljnjih koraka

---

Ova procedura osigurava kontrolirano i sigurno vraćanje aplikacije bez dugotrajnih prekida rada.
