# 🚀 Deploy PDF Flipbook su GitHub Pages

## 📋 Passo 1: Crea Repository GitHub

1. Vai su [github.com](https://github.com) e fai login
2. Clicca su **"New repository"** (o `+` in alto a destra)
3. Nome repository: `pdf-flipbook` (o quello che preferisci)
4. Descrizione: `Interactive PDF Flipbook for LearnWorlds`
5. Scegli **Public**
6. **NON** aggiungere README, .gitignore, o license
7. Clicca **"Create repository"**

## 📤 Passo 2: Carica i File

Apri il terminale nella cartella `pdf-flipbook` ed esegui:

```bash
# Inizializza git
git init

# Aggiungi tutti i file
git add .

# Commit
git commit -m "Initial commit - PDF Flipbook"

# Collega al repository (SOSTITUISCI con il tuo username)
git remote add origin https://github.com/TUO-USERNAME/pdf-flipbook.git

# Push
git branch -M main
git push -u origin main
```

## 🌐 Passo 3: Attiva GitHub Pages

1. Vai sul tuo repository GitHub
2. Clicca su **"Settings"** (in alto)
3. Nel menu laterale, clicca su **"Pages"**
4. In **"Source"**, seleziona **"main"** branch
5. Clicca **"Save"**
6. Aspetta 1-2 minuti

Il tuo flipbook sarà disponibile su:
```
https://TUO-USERNAME.github.io/pdf-flipbook/
```

## 📝 Passo 4: Embed su LearnWorlds

Copia questo codice nel tuo corso LearnWorlds (elemento Custom HTML):

```html
<div style="width: 100%; max-width: 1400px; margin: 0 auto;">
    <iframe 
        src="https://TUO-USERNAME.github.io/pdf-flipbook/index.html"
        style="width: 100%; height: 800px; border: none; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
        allowfullscreen>
    </iframe>
</div>
```

**Sostituisci `TUO-USERNAME` con il tuo username GitHub!**

## 🔄 Aggiornare il PDF

Quando vuoi cambiare il PDF:

1. Sostituisci il file `remflipbook-copertina.pdf` con il nuovo PDF
2. Esegui:
```bash
git add .
git commit -m "Update PDF"
git push
```

3. Aspetta 1-2 minuti per il deploy automatico

## ✅ Checklist

- [ ] Repository GitHub creato
- [ ] File caricati con git push
- [ ] GitHub Pages attivato
- [ ] URL funzionante (https://username.github.io/pdf-flipbook/)
- [ ] Embed testato su LearnWorlds
- [ ] PDF caricato correttamente

## 🆘 Problemi Comuni

### Il sito non si carica
- Aspetta 2-3 minuti dopo il push
- Controlla che GitHub Pages sia attivo in Settings > Pages
- Verifica che il branch sia "main"

### PDF non trovato
- Assicurati che il file PDF sia nella root della cartella
- Controlla il nome del file in `flipbook-turn.js` (riga 284)

### CORS Error
- GitHub Pages gestisce automaticamente CORS
- Se usi un PDF esterno, deve avere CORS abilitato

## 📞 Supporto

Per problemi, controlla:
1. Console del browser (F12)
2. GitHub Actions (tab Actions nel repository)
3. README.md principale per documentazione completa
