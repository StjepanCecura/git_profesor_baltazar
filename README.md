# Osnovne upute

## Pokretanje servera

npm install - instaliranje node paketa  
npm run dev - pokretanje servera

## Pull request

Obavezno dodati "Stjepan Čečura" za review

## Postavke prikaza pri testiranju

Pri testiranju postaviti prikaz na rezoluciju 2160*3840.  

## Pristup s mobilnog uređaja
1. Računalo i mobilni uređaji moraju biti spojeni s istom wifi mrežom.
2. Nakon pokretanja servera u terminalu se ispisuje Network IP adresa (npr. http://192.168.1.10:3000)
3. Tu adresu je potrebno upisati u preglednik na mobilnom uređaju

Server je konfiguriran s postavkom host: '0.0.0.0' kako bi aplikacija bila dostupna i drugim uređajima na istoj lokalnoj mreži (npr. mobilnim uređajima).
U slučaju da aplikacija nije dostupna s mobilnog uređaja, potrebno je provjeriti postavke Windows Firewall-a.

### Upute za postavljanje

Otvoriti DevTools (F12), pritisnuti tipku "Toggle device emulation" ![image](https://github.com/user-attachments/assets/2de5d110-a336-4d2e-b587-c2bda63674a4) ili kombinaciju Crtl + Shift + M te zatim iznad slike emulacije odabrati rezoluciju. Ukoliko nema rezolucije kao ponuđene (a nebi trebalo biti ako niste već dodavali), kreirati svoju rezoluciju na "Edit" i "Add custom device".
