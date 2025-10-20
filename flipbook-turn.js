// Configurazione PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFFlipbookTurn {
    constructor(pdfUrl) {
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.totalPages = 0;
        this.scale = 1.5;
        this.pageCache = {};
        
        // Elementi DOM
        this.book = $('#book');
        this.prevBtn = $('#prevPage');
        this.nextBtn = $('#nextPage');
        this.firstBtn = $('#firstPage');
        this.lastBtn = $('#lastPage');
        this.pageInput = $('#pageInput');
        this.pageTotal = $('#pageTotal');
        this.loadingOverlay = $('#loadingOverlay');
        
        this.init();
    }
    
    async init() {
        try {
            console.log('📥 Caricamento PDF...');
            
            this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
            this.totalPages = this.pdfDoc.numPages;
            
            console.log('✅ PDF caricato! Pagine:', this.totalPages);
            
            this.pageTotal.text(`/ ${this.totalPages}`);
            this.pageInput.attr('max', this.totalPages);
            
            // Inizializza Turn.js
            await this.initializeTurnJS();
            
            // Setup controlli
            this.setupControls();
            
            this.loadingOverlay.addClass('hidden');
            console.log('✨ Flipbook pronto!');
            
        } catch (error) {
            console.error('❌ Errore:', error);
            alert('Errore nel caricamento del PDF');
        }
    }
    
    async initializeTurnJS() {
        console.log('🎨 Inizializzazione Turn.js...');
        
        // Svuota il book
        this.book.html('');
        
        // Aggiungi solo le pagine reali (no pagine bianche)
        for (let i = 1; i <= this.totalPages; i++) {
            this.book.append(`<div class="turn-page" data-page="${i}"></div>`);
        }
        
        // Stile ISSUU: riempie tutto lo spazio disponibile
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 100; // Spazio minimo per header
        
        // Calcola dimensioni per riempire al massimo (stile Issuu)
        let bookWidth = viewportWidth;
        let bookHeight = viewportHeight;
        
        // Mantieni proporzioni A4 per doppia pagina (2:1.414)
        const targetRatio = 2 / 1.414;
        const currentRatio = bookWidth / bookHeight;
        
        if (currentRatio > targetRatio) {
            // Troppo largo, riduci larghezza
            bookWidth = bookHeight * targetRatio;
        } else {
            // Troppo alto, riduci altezza
            bookHeight = bookWidth / targetRatio;
        }
        
        console.log('📐 Dimensioni libro (sempre orizzontale):', bookWidth, 'x', bookHeight);
        
        // Inizializza Turn.js
        this.book.turn({
            width: bookWidth,
            height: bookHeight,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            duration: 600,
            pages: this.totalPages,
            display: 'double', // SEMPRE doppia pagina
            when: {
                turning: (event, page, view) => {
                    console.log('🔄 Girando verso pagina', page);
                    // Non bloccare l'animazione
                    this.preloadPages(page);
                },
                turned: (event, page) => {
                    console.log('✅ Pagina', page);
                    this.updateControls(page);
                    // Pre-carica pagine adiacenti
                    this.preloadPages(page);
                }
            }
        });
        
        console.log('🎨 Pre-rendering tutte le pagine...');
        // Renderizza TUTTE le pagine in background
        this.preloadAllPages();
        
        console.log('✅ Turn.js inizializzato');
    }
    
    async renderPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) {
            console.log(`⚠️ Pagina ${pageNum} fuori range (1-${this.totalPages})`);
            return;
        }
        
        const pageDiv = $(`.turn-page[data-page="${pageNum}"]`);
        
        if (!pageDiv.length) {
            console.log(`⚠️ Div per pagina ${pageNum} non trovato`);
            return;
        }
        
        // Se già renderizzata, skip
        if (pageDiv.find('canvas').length > 0) {
            console.log(`📦 Pagina ${pageNum} già in cache`);
            return;
        }
        
        console.log(`🎨 Rendering pagina ${pageNum}...`);
        
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1 });
            
            const canvas = $('<canvas>')[0];
            const context = canvas.getContext('2d', { alpha: false });
            
            // Ottieni dimensioni del container Turn.js
            const containerWidth = this.book.turn('size').width / 2; // Metà per doppia pagina
            const containerHeight = this.book.turn('size').height;
            
            // Calcola scala per riempire il più possibile
            const scaleX = containerWidth / viewport.width;
            const scaleY = containerHeight / viewport.height;
            const scale = Math.min(scaleX, scaleY); // Usa min per contenere tutto
            
            const scaledViewport = page.getViewport({ scale: scale });
            
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            // Svuota e aggiungi canvas SENZA padding
            pageDiv.html('');
            pageDiv.css({
                'background': 'white',
                'overflow': 'hidden',
                'padding': '0',
                'margin': '0'
            });
            
            // Forza canvas a riempire tutto
            $(canvas).css({
                'width': '100%',
                'height': '100%',
                'object-fit': 'cover', // Riempie tutto senza spazi bianchi
                'display': 'block'
            });
            
            pageDiv.append(canvas);
            
            // Aggiungi numero pagina
            pageDiv.append(`<div class="page-number">${pageNum}</div>`);
            
            console.log(`✅ Pagina ${pageNum} renderizzata (${canvas.width}x${canvas.height})`);
            
        } catch (error) {
            console.error(`❌ Errore rendering pagina ${pageNum}:`, error);
            // Mostra pagina di errore invece di bianca
            pageDiv.html(`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Errore caricamento pagina ${pageNum}</div>`);
        }
    }
    
    async preloadPages(currentPage) {
        // Pre-carica pagina corrente e adiacenti
        const pagesToLoad = [
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
            currentPage + 3
        ];
        
        for (let p of pagesToLoad) {
            if (p >= 1 && p <= this.totalPages) {
                this.renderPage(p); // Non await - carica in background
            }
        }
    }
    
    async preloadAllPages() {
        // Carica tutte le pagine in background senza bloccare
        for (let i = 1; i <= this.totalPages; i++) {
            // Usa setTimeout per non bloccare UI
            setTimeout(() => {
                this.renderPage(i);
            }, i * 100); // 100ms di delay tra ogni pagina
        }
    }
    
    updateControls(currentPage) {
        this.pageInput.val(currentPage);
        
        this.prevBtn.prop('disabled', currentPage === 1);
        this.nextBtn.prop('disabled', currentPage === this.totalPages);
        this.firstBtn.prop('disabled', currentPage === 1);
        this.lastBtn.prop('disabled', currentPage === this.totalPages);
    }
    
    setupControls() {
        // Navigazione
        this.prevBtn.on('click', () => {
            this.book.turn('previous');
        });
        
        this.nextBtn.on('click', () => {
            this.book.turn('next');
        });
        
        this.firstBtn.on('click', () => {
            this.book.turn('page', 1);
        });
        
        this.lastBtn.on('click', () => {
            this.book.turn('page', this.totalPages);
        });
        
        // Input pagina
        this.pageInput.on('change', (e) => {
            const pageNum = parseInt($(e.target).val());
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.book.turn('page', pageNum);
            }
        });
        
        // Keyboard
        $(document).on('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.book.turn('previous');
            if (e.key === 'ArrowRight') this.book.turn('next');
            if (e.key === 'Home') this.book.turn('page', 1);
            if (e.key === 'End') this.book.turn('page', this.totalPages);
        });
        
        // Zoom
        $('#zoomIn').on('click', () => {
            const currentZoom = this.book.css('transform');
            const scale = currentZoom === 'none' ? 1 : parseFloat(currentZoom.split('(')[1]);
            this.book.css('transform', `scale(${Math.min(scale + 0.1, 2)})`);
        });
        
        $('#zoomOut').on('click', () => {
            const currentZoom = this.book.css('transform');
            const scale = currentZoom === 'none' ? 1 : parseFloat(currentZoom.split('(')[1]);
            this.book.css('transform', `scale(${Math.max(scale - 0.1, 0.5)})`);
        });
        
        // Fullscreen
        $('#fullscreen').on('click', () => {
            const elem = document.querySelector('.flipbook-container');
            if (!document.fullscreenElement) {
                elem.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
        
        // Download
        $('#downloadPdf').on('click', () => {
            const link = document.createElement('a');
            link.href = this.pdfUrl;
            link.download = 'document.pdf';
            link.click();
        });
        
        // Thumbnails
        $('#toggleThumbnails').on('click', () => {
            $('#thumbnailsPanel').toggleClass('open');
        });
        
        $('#closeThumbnails').on('click', () => {
            $('#thumbnailsPanel').removeClass('open');
        });
    }
}

// Inizializza quando pronto
$(document).ready(() => {
    const pdfUrl = 'remflipbook-copertina.pdf';
    const flipbook = new PDFFlipbookTurn(pdfUrl);
    window.flipbook = flipbook;
});
