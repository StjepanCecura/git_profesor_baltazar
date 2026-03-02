# Osnovne upute

## Pokretanje servera

npm install - instaliranje node paketa
npm run dev - pokretanje servera

## Pull request

Obavezno dodati "Stjepan Čečura" (StjepanCecura) za review

## Postavke prikaza pri testiranju

Pri testiranju obavezno testirati na zaslonu rezolucije 2160 × 3840, na mobilnim zaslonima te monitorima horizontalne orijentacije.

## Pristup s mobilnog uređaja

1. Računalo i mobilni uređaji moraju biti spojeni s istom WiFi mrežom.
2. Nakon pokretanja servera u terminalu se ispisuje Network IP adresa (npr. [http://192.168.1.10:3000](http://192.168.1.10:3000))
3. Tu adresu je potrebno upisati u preglednik na mobilnom uređaju

Server je konfiguriran s postavkom host: '0.0.0.0' kako bi aplikacija bila dostupna i drugim uređajima na istoj lokalnoj mreži (npr. mobilnim uređajima).
U slučaju da aplikacija nije dostupna s mobilnog uređaja, potrebno je provjeriti postavke Windows Firewalla.

### Upute za postavljanje

Otvoriti DevTools (F12), pritisnuti tipku "Toggle device emulation" ili kombinaciju Ctrl + Shift + M te zatim iznad slike emulacije odabrati rezoluciju. Ako nema rezolucije kao ponuđene (a ne bi trebalo biti ako niste već dodavali), kreirati svoju rezoluciju na "Edit" i "Add custom device".

---

# Opis projekta

Profesor Baltazar je web platforma koja omogućuje upravljanje igrama s pomoću gesti ruku prepoznatih putem kamere. Sustav koristi Google MediaPipe za detekciju i praćenje pokreta ruke u stvarnom vremenu.

Cilj projekta

---

# Tehnologije

* JavaScript (frontend)
* Google MediaPipe (prepoznavanje gesti)
* HTML5 Canvas / WebGL
* Node.js razvojno okruženje
* GitHub Actions (CI/CD automatizacija)
* SSH + rsync deployment

---

# Arhitektura sustava

## Klijentska strana

* Prepoznavanje ruke u stvarnom vremenu
* Obrada koordinata i gesti
* Prosljeđivanje događaja igri
* Renderiranje grafike

## Serverska strana

* Poslužuje statičke datoteke
* Ne pohranjuje video zapis
* Ne pohranjuje biometrijske podatke
* Ne vrši analizu gesti na serveru

Sva obrada kamere odvija se lokalno u pregledniku korisnika.

---

# Privatnost i sigurnost

* Kamera se koristi isključivo lokalno u pregledniku.
* Video zapis se ne šalje na server.
* Podaci o gestama se ne pohranjuju.
* Ne koristi se praćenje korisnika.

Za prijavu sigurnosnih propusta pogledati SECURITY.md.

---

# Razvoj

## Instalacija

```
npm install
```

## Pokretanje u razvojnom načinu

```
npm run dev
```

## Build za produkciju

```
npm run build
```

---

# Deployment

Deploy se vrši automatski putem GitHub Actions workflowa nakon mergea u main granu na [staging okruženje](https://igre-staging.baltazargrad.com/) i nakon objave novog releasea na [produkcijsko okruženje](https://igre.baltazargrad.com/).

Proces uključuje:

* Instalaciju paketa
* Statičku analizu koda
* Build aplikacije
* Sigurni prijenos datoteka putem SSH i rsync

Rollback procedura nalazi se u:
docs/rollback-procedure.md

---

# Struktura projekta

Dodati nakon reorganizacije strukture projekta.

---

# Doprinosi

Vanjski doprinosi su dobrodošli.

Prije slanja izmjena:

* Kreirati novu granu nazvanu prema igrici, featureu ili popravku koji se implementira
* Koristiti jasne commit poruke
* Testirati funkcionalnost lokalno
* Osigurati da nema console.log ispisa
* Proći lint provjeru

Detaljne upute nalaze se u CONTRIBUTING.md.

---

# Verzije

Obavezno je korištenje semantičkog verzioniranja:

v1.0.0
v1.1.0

Objašnjenje semantičkog verzioniranja se može pronaći na [specifikaciji semantičkog verzioniranja](https://semver.org/)

Tagiranje stabilnih verzija:

```
git tag v1.0.0
git push origin v1.0.0
```

---

# Licenca

Projekt je licenciran pod GNU GPLv3 licencom.

Pogledati [LICENSE.md] datoteku za detalje.
