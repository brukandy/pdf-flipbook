# 🚀 Setup Rapido - PDF Flipbook

## Passo 1: Preparare il PDF

Per testare il flipbook, hai bisogno di un file PDF. Ecco le opzioni:

### Opzione A: Usa il tuo PDF
1. Copia il tuo file PDF nella cartella `pdf-flipbook`
2. Rinominalo in `sample.pdf` (oppure ricorda il nome)

### Opzione B: Scarica un PDF di esempio
Puoi usare uno di questi PDF gratuiti per testare:

1. **PDF di esempio Mozilla**
   - URL: `https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf`
   - Piccolo e veloce da caricare

2. **PDF di esempio più complesso**
   - Cerca su Google "sample pdf download"
   - Oppure crea un PDF da un documento Word/Google Docs

## Passo 2: Configurare il Flipbook

Apri il file `flipbook.js` e trova questa riga (circa riga 235):

```javascript
const pdfUrl = 'sample.pdf'; // <-- MODIFICA QUESTO
```

Cambiala in base alla tua scelta:

### Se usi un PDF locale:
```javascript
const pdfUrl = 'nome-del-tuo-file.pdf';
```

### Se usi un PDF online:
```javascript
const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
```

## Passo 3: Aprire il Flipbook

### Metodo 1: Doppio click
Fai doppio click su `index.html` - si aprirà nel browser

### Metodo 2: Server locale (consigliato)
Se hai problemi con CORS, usa un server locale:

**Con Python 3:**
```bash
cd pdf-flipbook
python3 -m http.server 8000
```
Poi apri: `http://localhost:8000`

**Con Node.js:**
```bash
cd pdf-flipbook
npx http-server -p 8000
```
Poi apri: `http://localhost:8000`

**Con PHP:**
```bash
cd pdf-flipbook
php -S localhost:8000
```
Poi apri: `http://localhost:8000`

## Passo 4: Testare le Funzionalità

Una volta aperto, prova:

- ✅ **Frecce laterali** - Clicca per sfogliare
- ✅ **Tastiera** - Usa ← → per navigare
- ✅ **Miniature** - Clicca l'icona griglia in basso
- ✅ **Zoom** - Pulsanti + e - in alto
- ✅ **Fullscreen** - Pulsante fullscreen in alto
- ✅ **Input pagina** - Digita un numero per saltare a quella pagina

## Troubleshooting

### ❌ "Failed to load PDF"
**Problema:** Il PDF non si carica

**Soluzioni:**
1. Verifica che il nome del file in `flipbook.js` sia corretto
2. Assicurati che il PDF sia nella stessa cartella di `index.html`
3. Usa un server locale invece di aprire direttamente il file
4. Se usi un URL esterno, verifica che sia accessibile

### ❌ Pagina bianca
**Problema:** Il flipbook non appare

**Soluzioni:**
1. Apri la Console del browser (F12) e controlla gli errori
2. Verifica che tutti i file (HTML, CSS, JS) siano nella stessa cartella
3. Controlla che la connessione internet funzioni (per PDF.js CDN)

### ❌ Animazioni lente
**Problema:** Le animazioni sono scattose

**Soluzioni:**
1. Riduci la scala in `flipbook.js`:
   ```javascript
   this.scale = 1.0; // Invece di 1.5
   ```
2. Usa un PDF con meno pagine o risoluzione più bassa
3. Chiudi altre schede del browser

### ❌ Non funziona su mobile
**Problema:** Il flipbook non risponde su smartphone

**Soluzioni:**
1. Assicurati di usare un browser moderno (Chrome, Safari)
2. Verifica che il touch sia abilitato
3. Prova a ricaricare la pagina

## Prossimi Passi

### 📤 Pubblicare Online

Per usare il flipbook su LearnWorlds, devi prima hostarlo online:

1. **GitHub Pages** (Gratuito, consigliato)
   - Crea un repository su GitHub
   - Carica i file
   - Abilita GitHub Pages nelle impostazioni
   - URL: `https://tuo-username.github.io/repo-name/`

2. **Netlify** (Gratuito, semplicissimo)
   - Vai su netlify.com
   - Drag & drop la cartella
   - URL automatico generato

3. **Vercel** (Gratuito, veloce)
   - Vai su vercel.com
   - Importa il progetto
   - Deploy automatico

### 🎓 Integrare su LearnWorlds

Una volta hostato, usa questo codice in LearnWorlds:

```html
<iframe 
    src="https://tuo-hosting.com/pdf-flipbook/index.html"
    style="width: 100%; height: 800px; border: none; border-radius: 12px;"
    allowfullscreen>
</iframe>
```

Incolla questo codice in un elemento "Custom HTML" nel tuo corso.

## 🎨 Personalizzazione

### Cambiare i Colori

Apri `flipbook.css` e modifica:

```css
/* Sfondo principale */
body {
    background: linear-gradient(135deg, #TUO_COLORE_1 0%, #TUO_COLORE_2 100%);
}

/* Colore accento (hover, attivo) */
.control-btn:hover {
    border-color: #TUO_COLORE_ACCENTO;
    color: #TUO_COLORE_ACCENTO;
}
```

### Cambiare Dimensioni Pagine

Apri `flipbook.css` e modifica:

```css
.page {
    width: 400px;  /* Larghezza */
    height: 600px; /* Altezza */
}

.page.left {
    left: -400px; /* Deve essere uguale a -width */
}
```

### Cambiare Velocità Animazione

Apri `flipbook.css` e modifica:

```css
.page {
    transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
    /* Cambia 0.8s in 0.5s per più veloce, 1.2s per più lento */
}
```

## 📞 Supporto

Se hai problemi:

1. Controlla la Console del browser (F12)
2. Verifica che tutti i file siano presenti
3. Leggi il README.md per documentazione completa
4. Controlla che il PDF sia valido e accessibile

## ✅ Checklist Finale

Prima di pubblicare, verifica:

- [ ] Il PDF si carica correttamente
- [ ] Tutte le pagine sono visibili
- [ ] La navigazione funziona (frecce, tastiera, miniature)
- [ ] Lo zoom funziona
- [ ] Il fullscreen funziona
- [ ] Funziona su mobile (se necessario)
- [ ] I colori e lo stile sono come li vuoi
- [ ] Hai testato su diversi browser

## 🎉 Fatto!

Il tuo flipbook è pronto! Ora puoi:
- Hostarlo online
- Embeddarlo su LearnWorlds
- Personalizzarlo come preferisci
- Condividerlo con i tuoi studenti

Buon lavoro! 📚✨
