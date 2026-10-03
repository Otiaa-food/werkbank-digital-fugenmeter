# Fugenmeter

Digitales Aufmaß für Handwerksbetriebe (Fugenabdichtung, Fliesen-/Bodenleger, Garten- & Landschaftsbau). Jeder Betrieb hat einen eigenen Login, legt Projekte an und erfasst Positionen per Formel (z. B. `4.65 x 2 + 3.86 x 2`) statt mit Zettel und Taschenrechner.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **Prisma** + **Postgres** (gedacht für Vercel Postgres / Neon)
- **NextAuth v5** (Credentials-Login, E-Mail + Passwort)
- **PWA**: installierbar auf dem Homescreen (`public/manifest.json`)

## Lokal einrichten

```bash
npm install
cp .env.example .env.local   # DATABASE_URL + AUTH_SECRET eintragen
npx prisma migrate dev --name init
npm run dev
```

`AUTH_SECRET` erzeugen: `npx auth secret` (schreibt automatisch in `.env.local`) oder manuell einen zufälligen String eintragen.

## Auf Vercel deployen

1. Repo in Vercel importieren (**New Project** → GitHub-Repo auswählen).
2. Im Projekt unter **Storage** eine **Postgres**-Datenbank hinzufügen (Vercel Postgres/Neon) — das setzt `DATABASE_URL` und `DATABASE_URL_UNPOOLED` automatisch als Umgebungsvariablen.
3. Unter **Settings → Environment Variables** zusätzlich `AUTH_SECRET` setzen (zufälliger String, z. B. per `openssl rand -base64 32`).
4. Deploy anstoßen. Beim Build läuft automatisch `prisma generate` (siehe `postinstall`-Skript); die Tabellen einmalig per `npx prisma migrate deploy` anlegen (lokal mit Produktions-`DATABASE_URL` ausführen, oder als Vercel-Build-Command ergänzen: `prisma migrate deploy && next build`).
5. Seite öffnen → **Betrieb anlegen** → einloggen → Projekt anlegen → Positionen erfassen.

### Als App installieren

Die Seite ist eine PWA: in Chrome/Safari auf dem Handy öffnen → "Zum Homescreen hinzufügen" bzw. "App installieren". Kein App-Store-Prozess nötig.

## Datenmodell

- **Organization** — ein Handwerksbetrieb (eigene Nutzer, eigene Projekte)
- **User** — Login je Organization
- **Project** — ein Bauvorhaben mit Branchen-Profil (`FUGEN` / `FLIESEN` / `GALABAU`), das Positionen und Einheiten vorbelegt
- **Entry** — eine erfasste Position (Etage/Bereich, Raum/Teilfläche, Position, Formel, Menge, Einheit)

Die Formel-Auswertung und Branchen-Profile liegen in `src/lib/branches.ts` — reines TypeScript ohne Abhängigkeiten, direkt aus dem ursprünglichen Prototyp übernommen.

## Bekannte nächste Schritte

- Mitarbeiter einladen (aktuell: ein Login pro Organization, aber jeder mit dem Account kann sich einloggen und Kürzel frei eintippen)
- Projekte bearbeiten/löschen
- PDF-Export für den Rechnungsabschluss
