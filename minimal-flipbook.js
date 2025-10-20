// Configurazione PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class MinimalFlipbook {
    constructor(pdfUrl) {
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.totalPages = 0;
        this.currentPage = 1;
        
        this.book = $('#book');
        this.prevBtn = $('#prevBtn');
        this.nextBtn = $('#nextBtn');
        this.pageInfo = $('#pageInfo');
        
        this.init();
    }
    
    async init() {
        try {
            this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
            this.totalPages = this.pdfDoc.numPages;
            
            await this.initializeTurnJS();
            this.setupControls();
            this.updatePageInfo();
            
        } catch (error) {
            console.error('Errore:', error);
        }
    }
    
    async initializeTurnJS() {
        this.book.html('');
        
        for (let i = 1; i <= this.totalPages; i++) {
            this.book.append(`<div class="turn-page" data-page="${i}"></div>`);
        }
        
        const viewportWidth = window.innerWidth - 40;
        const viewportHeight = window.innerHeight - 150;
        
        let bookWidth = viewportWidth;
        let bookHeight = viewportHeight;
        
        const targetRatio = 2 / 1.414;
        const currentRatio = bookWidth / bookHeight;
        
        if (currentRatio > targetRatio) {
            bookWidth = bookHeight * targetRatio;
        } else {
            bookHeight = bookWidth / targetRatio;
        }
        
        this.book.turn({
            width: bookWidth,
            height: bookHeight,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            duration: 600,
            pages: this.totalPages,
            display: 'double',
            page: 2, // Inizia dalla pagina 2 per mostrare doppia pagina (1-2)
            when: {
                turned: (event, page) => {
                    this.currentPage = page;
                    this.updatePageInfo();
                    this.preloadPages(page);
                }
            }
        });
        
        // Imposta pagina corrente a 1 per l'indicatore
        this.currentPage = 1;
        
        this.preloadAllPages();
    }
    
    async renderPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;
        
        const pageDiv = $(`.turn-page[data-page="${pageNum}"]`);
        if (!pageDiv.length || pageDiv.find('canvas').length > 0) return;
        
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1 });
            
            const canvas = $('<canvas>')[0];
            const context = canvas.getContext('2d', { alpha: false });
            
            const containerWidth = this.book.turn('size').width / 2;
            const containerHeight = this.book.turn('size').height;
            
            const scaleX = containerWidth / viewport.width;
            const scaleY = containerHeight / viewport.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledViewport = page.getViewport({ scale: scale });
            
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            pageDiv.html('');
            pageDiv.css({
                'background': 'white',
                'overflow': 'hidden',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center'
            });
            
            $(canvas).css({
                'width': '100%',
                'height': '100%',
                'object-fit': 'cover',
                'display': 'block'
            });
            
            pageDiv.append(canvas);
            
        } catch (error) {
            console.error(`Errore rendering pagina ${pageNum}:`, error);
        }
    }
    
    async preloadPages(currentPage) {
        const pagesToLoad = [
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2
        ];
        
        for (let p of pagesToLoad) {
            if (p >= 1 && p <= this.totalPages) {
                this.renderPage(p);
            }
        }
    }
    
    async preloadAllPages() {
        for (let i = 1; i <= this.totalPages; i++) {
            setTimeout(() => {
                this.renderPage(i);
            }, i * 100);
        }
    }
    
    updatePageInfo() {
        this.pageInfo.text(`${this.currentPage} / ${this.totalPages}`);
        this.prevBtn.prop('disabled', this.currentPage === 1);
        this.nextBtn.prop('disabled', this.currentPage === this.totalPages);
    }
    
    setupControls() {
        this.prevBtn.on('click', () => {
            this.book.turn('previous');
        });
        
        this.nextBtn.on('click', () => {
            this.book.turn('next');
        });
        
        $(document).on('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.book.turn('previous');
            if (e.key === 'ArrowRight') this.book.turn('next');
        });
    }
}

$(document).ready(() => {
    const pdfUrl = 'remflipbook-copertina.pdf';
    const flipbook = new MinimalFlipbook(pdfUrl);
    window.flipbook = flipbook;
});
