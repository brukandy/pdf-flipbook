# 📚 PDF Flipbook Interattivo

Un componente flipbook moderno e interattivo per sfogliare PDF con effetto 3D tipo Issuu, completamente embeddabile su LearnWorlds e altri siti.

![Flipbook Demo](https://img.shields.io/badge/Status-Ready-success)

## ✨ Caratteristiche

- **Effetto Flip 3D Realistico** - Animazioni fluide con effetto pagina che si gira
- **Controlli Completi** - Frecce, input pagina, miniature, zoom, fullscreen
- **Responsive** - Funziona perfettamente su desktop, tablet e mobile
- **Touch Support** - Swipe per sfogliare le pagine su dispositivi touch
- **Keyboard Navigation** - Frecce, Home, End per navigare velocemente
- **Miniature** - Pannello laterale con preview di tutte le pagine
- **Zoom** - Ingrandisci e riduci il contenuto
- **Download** - Scarica il PDF originale
- **Embeddabile** - Facile integrazione su LearnWorlds e altri siti

## 🚀 Installazione

### Metodo 1: Uso Diretto

1. Scarica tutti i file nella cartella `pdf-flipbook`
2. Metti il tuo PDF nella stessa cartella (es. `sample.pdf`)
3. Modifica `flipbook.js` alla riga 235:
   ```javascript
   const pdfUrl = 'il-tuo-file.pdf'; // <-- Metti qui il nome del tuo PDF
   ```
4. Apri `index.html` nel browser

### Metodo 2: Embed su LearnWorlds

Crea un file HTML con questo codice:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Flipbook</title>
</head>
<body>
    <div id="flipbook-container"></div>
    
    <script>
        // Funzione per embeddare il flipbook
        function embedFlipbook(containerId, pdfUrl) {
            const container = document.getElementById(containerId);
            const iframe = document.createElement('iframe');
            
            // URL del tuo flipbook hostato
            iframe.src = 'https://tuo-sito.com/pdf-flipbook/index.html';
            iframe.style.width = '100%';
            iframe.style.height = '800px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
            
            container.appendChild(iframe);
        }
        
        // Inizializza
        embedFlipbook('flipbook-container', 'path/to/your.pdf');
    </script>
</body>
</html>
```

## 📖 Utilizzo

### Controlli Base

- **Frecce Laterali** - Clicca per sfogliare avanti/indietro
- **Frecce Tastiera** - `←` `→` per navigare
- **Home/End** - Vai alla prima/ultima pagina
- **Input Pagina** - Digita il numero per saltare a una pagina specifica
- **Miniature** - Clicca sull'icona griglia per vedere tutte le pagine

### Controlli Avanzati

- **Zoom In/Out** - Pulsanti `+` e `-` nella toolbar
- **Fullscreen** - Pulsante fullscreen per visualizzazione a schermo intero
- **Download** - Scarica il PDF originale
- **Touch/Swipe** - Su mobile, swipe left/right per sfogliare

## 🎨 Personalizzazione

### Cambiare i Colori

Modifica `flipbook.css`:

```css
/* Gradiente di sfondo */
body {
    background: linear-gradient(135deg, #TUO_COLORE_1 0%, #TUO_COLORE_2 100%);
}

/* Colore accento */
.control-btn:hover {
    border-color: #TUO_COLORE_ACCENTO;
    color: #TUO_COLORE_ACCENTO;
}
```

### Dimensioni Pagine

Modifica `flipbook.css`:

```css
.page {
    width: 400px;  /* Larghezza pagina */
    height: 600px; /* Altezza pagina */
}
```

### Velocità Animazione

Modifica `flipbook.css`:

```css
.page {
    transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
    /* Cambia 0.8s per velocità diversa */
}
```

## 🔧 API JavaScript

### Inizializzazione Personalizzata

```javascript
const flipbook = new PDFFlipbook('path/to/your.pdf');

// Vai a una pagina specifica
flipbook.goToPage(5);

// Naviga
flipbook.nextPage();
flipbook.previousPage();

// Zoom
flipbook.zoom(0.1);  // Zoom in
flipbook.zoom(-0.1); // Zoom out

// Fullscreen
flipbook.toggleFullscreen();
```

### Embed Programmatico

```javascript
embedFlipbook('container-id', 'path/to/pdf.pdf', {
    width: '100%',
    height: '800px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
});
```

## 📱 Compatibilità

- ✅ Chrome/Edge (moderno)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Tablet

## 🎯 Integrazione LearnWorlds

### Opzione 1: Custom HTML Element

1. Carica i file su un hosting (GitHub Pages, Netlify, ecc.)
2. In LearnWorlds, aggiungi un elemento "Custom HTML"
3. Incolla questo codice:

```html
<iframe 
    src="https://tuo-hosting.com/pdf-flipbook/index.html"
    style="width: 100%; height: 800px; border: none; border-radius: 12px;"
    allowfullscreen>
</iframe>
```

### Opzione 2: Embed Code

1. Crea una pagina dedicata con il flipbook
2. Usa l'elemento "Embed" in LearnWorlds
3. Incolla l'URL della tua pagina

## 🛠️ Requisiti

- Browser moderno con supporto ES6+
- PDF.js (incluso via CDN)
- Nessun server richiesto (funziona in locale)

## 📝 Note Importanti

- **CORS**: Se carichi PDF da domini esterni, assicurati che abbiano CORS abilitato
- **Dimensioni PDF**: PDF molto grandi potrebbero richiedere più tempo per caricare
- **Performance**: Ottimizzato per PDF fino a 100 pagine

## 🐛 Troubleshooting

### Il PDF non si carica

1. Controlla che il percorso del PDF sia corretto
2. Verifica che il PDF sia accessibile (controlla CORS)
3. Apri la console del browser per vedere eventuali errori

### Le animazioni sono lente

1. Riduci la scala di rendering in `flipbook.js`:
   ```javascript
   this.scale = 1.0; // Invece di 1.5
   ```
2. Ottimizza il PDF riducendo la risoluzione delle immagini

### Non funziona su mobile

1. Assicurati che il viewport sia configurato correttamente
2. Verifica che il touch sia abilitato nel browser

## 📄 Licenza

MIT License - Usa liberamente per progetti personali e commerciali

## 🤝 Supporto

Per problemi o domande, apri un issue o contattami.

---

**Fatto con ❤️ per LearnWorlds**
