// Configurazione PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFFlipbookV2 {
    constructor(pdfUrl) {
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.2;
        this.isFlipping = false;
        this.pageCache = {}; // Cache per le pagine renderizzate
        
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
            
            this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
            this.totalPages = this.pdfDoc.numPages;
            
            console.log('✅ PDF caricato! Pagine totali:', this.totalPages);
            
            this.pageTotal.textContent = `/ ${this.totalPages}`;
            this.pageInput.max = this.totalPages;
            
            console.log('🖼️ Generazione miniature...');
            await this.generateThumbnails();
            
            console.log('🎮 Setup event listeners...');
            this.setupEventListeners();
            
            console.log('📖 Mostra prima pagina...');
            await this.showPage(this.currentPage);
            
            this.loadingOverlay.classList.add('hidden');
            console.log('✨ TUTTO COMPLETATO!');
            
        } catch (error) {
            console.error('Errore nel caricamento del PDF:', error);
            alert('Errore nel caricamento del PDF. Controlla la console per i dettagli.');
        }
    }
    
    async renderPageToCanvas(pageNum) {
        // Controlla cache
        if (this.pageCache[pageNum]) {
            console.log(`📦 Pagina ${pageNum} dalla cache`);
            return this.pageCache[pageNum].cloneNode(true);
        }
        
        console.log(`🎨 Rendering pagina ${pageNum}...`);
        
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false }); // Performance boost
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Salva in cache
        this.pageCache[pageNum] = canvas.cloneNode(true);
        
        return canvas;
    }
    
    async showPage(pageNum) {
        console.log(`📖 Mostra pagina ${pageNum}`);
        
        this.book.innerHTML = '';
        this.book.style.opacity = '1';
        
        // Crea container per doppia pagina
        const leftContainer = document.createElement('div');
        leftContainer.className = 'page left-page';
        
        const rightContainer = document.createElement('div');
        rightContainer.className = 'page right-page';
        
        // Pagina sinistra (se non è la prima)
        if (pageNum > 1 && pageNum % 2 === 0) {
            const leftCanvas = await this.renderPageToCanvas(pageNum - 1);
            const leftContent = document.createElement('div');
            leftContent.className = 'page-content';
            leftContent.appendChild(leftCanvas);
            
            const leftNum = document.createElement('div');
            leftNum.className = 'page-number';
            leftNum.textContent = pageNum - 1;
            leftContent.appendChild(leftNum);
            
            leftContainer.appendChild(leftContent);
            this.book.appendChild(leftContainer);
        }
        
        // Pagina destra
        const rightCanvas = await this.renderPageToCanvas(pageNum);
        const rightContent = document.createElement('div');
        rightContent.className = 'page-content';
        rightContent.appendChild(rightCanvas);
        
        const rightNum = document.createElement('div');
        rightNum.className = 'page-number';
        rightNum.textContent = pageNum;
        rightContent.appendChild(rightNum);
        
        rightContainer.appendChild(rightContent);
        this.book.appendChild(rightContainer);
        
        // Pagina successiva se dispari
        if (pageNum < this.totalPages && pageNum % 2 === 1) {
            const nextCanvas = await this.renderPageToCanvas(pageNum + 1);
            const nextContent = document.createElement('div');
            nextContent.className = 'page-content';
            nextContent.appendChild(nextCanvas);
            
            const nextNum = document.createElement('div');
            nextNum.className = 'page-number';
            nextNum.textContent = pageNum + 1;
            nextContent.appendChild(nextNum);
            
            const nextContainer = document.createElement('div');
            nextContainer.className = 'page right-page';
            nextContainer.appendChild(nextContent);
            this.book.appendChild(nextContainer);
        }
        
        this.updateControls();
    }
    
    updateControls() {
        this.pageInput.value = this.currentPage;
        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage >= this.totalPages;
        this.firstBtn.disabled = this.currentPage === 1;
        this.lastBtn.disabled = this.currentPage >= this.totalPages;
        
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (parseInt(thumb.dataset.pageNum) === this.currentPage) {
                thumb.classList.add('active');
            }
        });
    }
    
    async nextPage() {
        if (this.isFlipping || this.currentPage >= this.totalPages) return;
        
        this.isFlipping = true;
        this.currentPage++;
        
        // Fade out/in veloce
        this.book.style.transition = 'opacity 0.2s ease';
        this.book.style.opacity = '0';
        
        setTimeout(async () => {
            await this.showPage(this.currentPage);
            this.book.style.opacity = '1';
            setTimeout(() => this.isFlipping = false, 200);
        }, 200);
    }
    
    async previousPage() {
        if (this.isFlipping || this.currentPage <= 1) return;
        
        this.isFlipping = true;
        this.currentPage--;
        
        // Fade out/in veloce
        this.book.style.transition = 'opacity 0.2s ease';
        this.book.style.opacity = '0';
        
        setTimeout(async () => {
            await this.showPage(this.currentPage);
            this.book.style.opacity = '1';
            setTimeout(() => this.isFlipping = false, 200);
        }, 200);
    }
    
    async goToPage(pageNum) {
        if (this.isFlipping || pageNum === this.currentPage) return;
        if (pageNum < 1 || pageNum > this.totalPages) return;
        
        this.isFlipping = true;
        this.currentPage = pageNum;
        
        this.book.style.transition = 'opacity 0.2s ease';
        this.book.style.opacity = '0';
        
        setTimeout(async () => {
            await this.showPage(this.currentPage);
            this.book.style.opacity = '1';
            setTimeout(() => this.isFlipping = false, 200);
        }, 200);
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
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
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
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.firstBtn.addEventListener('click', () => this.goToPage(1));
        this.lastBtn.addEventListener('click', () => this.goToPage(this.totalPages));
        
        this.pageInput.addEventListener('change', (e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.goToPage(pageNum);
            } else {
                this.pageInput.value = this.currentPage;
            }
        });
        
        this.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.toggleThumbnailsBtn.addEventListener('click', () => this.toggleThumbnails());
        this.closeThumbnailsBtn.addEventListener('click', () => this.closeThumbnails());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousPage();
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === 'Home') this.goToPage(1);
            if (e.key === 'End') this.goToPage(this.totalPages);
        });
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) this.nextPage();
            if (touchEndX > touchStartX + 50) this.previousPage();
        }, { passive: true });
    }
    
    zoom(delta) {
        this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
        this.book.style.transform = `scale(${this.scale})`;
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.flipbook-container');
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.error('Errore fullscreen:', err));
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

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    const pdfUrl = 'remflipbook-copertina.pdf';
    const flipbook = new PDFFlipbookV2(pdfUrl);
    window.flipbook = flipbook; // Per debug
});
