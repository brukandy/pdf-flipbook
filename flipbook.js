// Configurazione PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFFlipbook {
    constructor(pdfUrl) {
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.2; // Ridotto da 1.5 a 1.2 per caricamento più veloce
        this.isFlipping = false;
        this.pages = [];
        
        // Elementi DOM
        this.book = document.getElementById('book');
        this.prevBtn = document.getElementById('prevPage');
        this.nextBtn = document.getElementById('nextPage');
        this.firstBtn = document.getElementById('firstPage');
        this.lastBtn = document.getElementById('lastPage');
        this.pageInput = document.getElementById('pageInput');
        this.pageTotal = document.getElementById('pageTotal');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.fullscreenBtn = document.getElementById('fullscreen');
        this.downloadBtn = document.getElementById('downloadPdf');
        this.toggleThumbnailsBtn = document.getElementById('toggleThumbnails');
        this.closeThumbnailsBtn = document.getElementById('closeThumbnails');
        this.thumbnailsPanel = document.getElementById('thumbnailsPanel');
        this.thumbnailsGrid = document.getElementById('thumbnailsGrid');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.init();
    }
    
    async init() {
        try {
            console.log('📥 Caricamento PDF da:', this.pdfUrl);
            
            // Carica il PDF
            this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
            this.totalPages = this.pdfDoc.numPages;
            
            console.log('✅ PDF caricato! Pagine totali:', this.totalPages);
            
            // Aggiorna UI
            this.pageTotal.textContent = `/ ${this.totalPages}`;
            this.pageInput.max = this.totalPages;
            
            console.log('🎨 Generazione pagine...');
            // Genera le pagine
            await this.generatePages();
            
            console.log('🖼️ Generazione miniature...');
            // Genera le miniature
            await this.generateThumbnails();
            
            console.log('🎮 Setup event listeners...');
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('📖 Mostra prima pagina...');
            // Mostra la prima pagina
            this.updateView();
            
            console.log('🎉 Flipbook pronto! Nascondo loading...');
            // Nascondi loading
            this.loadingOverlay.classList.add('hidden');
            
            console.log('✨ TUTTO COMPLETATO! Il flipbook è pronto all\'uso.');
            
        } catch (error) {
            console.error('Errore nel caricamento del PDF:', error);
            alert('Errore nel caricamento del PDF. Controlla la console per i dettagli.');
        }
    }
    
    async generatePages() {
        console.log('🎨 Inizio generazione pagine - NON genero tutte, solo al bisogno');
        // Non generiamo più tutte le pagine in anticipo
        // Le renderizzeremo on-demand quando servono
        this.pages = new Array(this.totalPages).fill(null);
        console.log('✅ Array pagine preparato:', this.pages.length);
    }
    
    async renderPage(pageNum) {
        console.log(`🎨 Rendering pagina ${pageNum}...`);
        
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.scale });
        
        console.log(`📐 Dimensioni viewport:`, viewport.width, 'x', viewport.height);
        
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.dataset.pageNum = pageNum;
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        console.log(`🖼️ Canvas:`, canvas.width, 'x', canvas.height);
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        console.log(`✅ Pagina ${pageNum} renderizzata!`);
        
        pageContent.appendChild(canvas);
        
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = pageNum;
        pageContent.appendChild(pageNumber);
        
        pageElement.appendChild(pageContent);
        
        return pageElement;
    }
    
    async generateThumbnails() {
        for (let i = 1; i <= this.totalPages; i++) {
            const page = await this.pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            thumbnail.dataset.pageNum = i;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            thumbnail.appendChild(canvas);
            
            const thumbnailNumber = document.createElement('div');
            thumbnailNumber.className = 'thumbnail-number';
            thumbnailNumber.textContent = i;
            thumbnail.appendChild(thumbnailNumber);
            
            thumbnail.addEventListener('click', () => {
                this.goToPage(i);
                this.closeThumbnails();
            });
            
            this.thumbnailsGrid.appendChild(thumbnail);
        }
    }
    
    setupEventListeners() {
        // Navigazione
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.firstBtn.addEventListener('click', () => this.goToPage(1));
        this.lastBtn.addEventListener('click', () => this.goToPage(this.totalPages));
        
        // Input pagina
        this.pageInput.addEventListener('change', (e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.goToPage(pageNum);
            } else {
                this.pageInput.value = this.currentPage;
            }
        });
        
        // Zoom
        this.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        
        // Fullscreen
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Download
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // Miniature
        this.toggleThumbnailsBtn.addEventListener('click', () => this.toggleThumbnails());
        this.closeThumbnailsBtn.addEventListener('click', () => this.closeThumbnails());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousPage();
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === 'Home') this.goToPage(1);
            if (e.key === 'End') this.goToPage(this.totalPages);
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true }); // Fix per warning touchstart
        
        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) this.nextPage();
            if (touchEndX > touchStartX + 50) this.previousPage();
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    async updateView(animate = false, direction = 'next') {
        console.log('📖 updateView chiamato - Pagina corrente:', this.currentPage, 'Animate:', animate);
        
        if (!animate) {
            // Senza animazione - mostra direttamente doppia pagina
            this.book.innerHTML = '';
            
            try {
                // Pagina sinistra (pari)
                if (this.currentPage > 1 && this.currentPage % 2 === 0) {
                    const leftPage = await this.renderPage(this.currentPage - 1);
                    leftPage.classList.add('left-page');
                    this.book.appendChild(leftPage);
                }
                
                // Pagina destra (dispari) o singola
                const rightPage = await this.renderPage(this.currentPage);
                rightPage.classList.add('right-page');
                this.book.appendChild(rightPage);
                
                // Pagina successiva se siamo su dispari
                if (this.currentPage < this.totalPages && this.currentPage % 2 === 1) {
                    const nextPage = await this.renderPage(this.currentPage + 1);
                    nextPage.classList.add('right-page');
                    this.book.appendChild(nextPage);
                }
                
                console.log('✅ Doppia pagina mostrata');
            } catch (error) {
                console.error('❌ Errore nel rendering:', error);
            }
        }
        
        // Aggiorna controlli
        this.pageInput.value = this.currentPage;
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
        this.firstBtn.disabled = this.currentPage === 1;
        this.lastBtn.disabled = this.currentPage >= this.totalPages;
        
        // Aggiorna miniature attive
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (parseInt(thumb.dataset.pageNum) === this.currentPage) {
                thumb.classList.add('active');
            }
        });
        
        console.log('📊 Stato finale - Elementi nel book:', this.book.children.length);
    }
    
    async flipPage(direction) {
        if (this.isFlipping) return;
        
        this.isFlipping = true;
        
        const pages = this.book.querySelectorAll('.page');
        
        if (direction === 'next' && pages[1]) {
            pages[1].classList.add('flipping');
            
            setTimeout(() => {
                pages[1].classList.add('flipped');
                pages[1].classList.remove('flipping');
                this.currentPage++;
                this.updateView();
                this.isFlipping = false;
            }, 800);
            
        } else if (direction === 'prev' && pages[0]) {
            pages[0].classList.add('flipping');
            
            setTimeout(() => {
                pages[0].classList.remove('flipped');
                pages[0].classList.remove('flipping');
                this.currentPage--;
                this.updateView();
                this.isFlipping = false;
            }, 800);
        } else {
            this.isFlipping = false;
        }
    }
    
    async nextPage() {
        if (this.currentPage >= this.totalPages || this.isFlipping) {
            console.log('⏸️ Navigazione bloccata - isFlipping:', this.isFlipping);
            return;
        }
        
        this.isFlipping = true;
        console.log('▶️ Avanti - Da pagina', this.currentPage, 'a', this.currentPage + 1);
        
        // Cambia pagina immediatamente
        this.currentPage++;
        
        // Aggiorna vista con transizione CSS
        this.book.style.transition = 'opacity 0.3s ease';
        this.book.style.opacity = '0';
        
        setTimeout(async () => {
            await this.updateView(false);
            this.book.style.opacity = '1';
            
            setTimeout(() => {
                this.isFlipping = false;
                console.log('✅ Navigazione completata');
            }, 300);
        }, 300);
    }
    
    async previousPage() {
        if (this.currentPage <= 1 || this.isFlipping) {
            console.log('⏸️ Navigazione bloccata - isFlipping:', this.isFlipping);
            return;
        }
        
        this.isFlipping = true;
        console.log('◀️ Indietro - Da pagina', this.currentPage, 'a', this.currentPage - 1);
        
        // Cambia pagina immediatamente
        this.currentPage--;
        
        // Aggiorna vista con transizione CSS
        this.book.style.transition = 'opacity 0.3s ease';
        this.book.style.opacity = '0';
        
        setTimeout(async () => {
            await this.updateView(false);
            this.book.style.opacity = '1';
            
            setTimeout(() => {
                this.isFlipping = false;
                console.log('✅ Navigazione completata');
            }, 300);
        }, 300);
    }
    
    async goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages && pageNum !== this.currentPage) {
            this.currentPage = pageNum;
            await this.updateView();
        }
    }
    
    zoom(delta) {
        this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
        this.book.style.transform = `scale(${this.scale})`;
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.flipbook-container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Errore fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    downloadPDF() {
        const link = document.createElement('a');
        link.href = this.pdfUrl;
        link.download = 'document.pdf';
        link.click();
    }
    
    toggleThumbnails() {
        this.thumbnailsPanel.classList.toggle('open');
    }
    
    closeThumbnails() {
        this.thumbnailsPanel.classList.remove('open');
    }
}

// Inizializza il flipbook quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Flipbook: Inizializzazione...');
    
    // IMPORTANTE: Sostituisci questo URL con il percorso del tuo PDF
    // Può essere un URL relativo o assoluto
    const pdfUrl = 'remflipbook-copertina.pdf'; // <-- MODIFICA QUESTO con il nome del tuo PDF
    
    console.log('📄 Flipbook: Caricamento PDF:', pdfUrl);
    
    // Se vuoi usare un PDF di esempio, puoi usare questo:
    // const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
    
    try {
        const flipbook = new PDFFlipbook(pdfUrl);
        console.log('✅ Flipbook: Istanza creata con successo');
    } catch (error) {
        console.error('❌ Flipbook: Errore durante l\'inizializzazione:', error);
    }
});

// Funzione helper per embeddare su LearnWorlds o altri siti
function embedFlipbook(containerId, pdfUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container con id "${containerId}" non trovato`);
        return;
    }
    
    // Crea iframe
    const iframe = document.createElement('iframe');
    iframe.src = `flipbook.html?pdf=${encodeURIComponent(pdfUrl)}`;
    iframe.style.width = options.width || '100%';
    iframe.style.height = options.height || '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = options.borderRadius || '12px';
    iframe.style.boxShadow = options.boxShadow || '0 10px 40px rgba(0,0,0,0.2)';
    
    container.appendChild(iframe);
}

// Esporta per uso globale
window.PDFFlipbook = PDFFlipbook;
window.embedFlipbook = embedFlipbook;
