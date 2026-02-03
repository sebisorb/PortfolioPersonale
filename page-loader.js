/**
 * Page Loader Orchestrator
 * Ensures stable, predictable page loading sequence
 * Prevents flickering and layout shifts
 */

class PageLoader {
    constructor() {
        this.imagesReady = false;
        this.dimensionsApplied = false;
        this.componentsLoaded = false;
        this.minimumDelayMet = false;
        
        // Minimum delay to prevent flash (200ms)
        this.minimumDelay = 200;
        this.startTime = performance.now();
        
        this.init();
    }
    
    init() {
        // Add loading class to body immediately
        document.documentElement.classList.add('page-loading');
        document.body?.classList.add('page-loading');
        
        // Listen for dimension application complete
        document.addEventListener('dimensionsApplied', () => {
            this.dimensionsApplied = true;
            this.checkReady();
        });
        
        // Listen for components loaded
        document.addEventListener('componentsLoaded', () => {
            this.componentsLoaded = true;
            this.checkReady();
        });
        
        // Wait for critical images to load
        this.waitForCriticalImages();
        
        // Set minimum delay timer
        setTimeout(() => {
            this.minimumDelayMet = true;
            this.checkReady();
        }, this.minimumDelay);
        
        // Fallback timeout - show page after 3 seconds no matter what
        setTimeout(() => {
            if (document.documentElement.classList.contains('page-loading')) {
                console.warn('Page loader timeout - forcing display');
                this.forceReady();
            }
        }, 3000);
    }
    
    waitForCriticalImages() {
        // Get all images that are above the fold or in first carousel
        const criticalImages = this.getCriticalImages();
        
        if (criticalImages.length === 0) {
            this.imagesReady = true;
            this.checkReady();
            return;
        }
        
        let loadedCount = 0;
        const totalCount = criticalImages.length;
        
        const imageLoaded = () => {
            loadedCount++;
            if (loadedCount >= totalCount) {
                this.imagesReady = true;
                this.checkReady();
            }
        };
        
        criticalImages.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                imageLoaded();
            } else {
                img.addEventListener('load', imageLoaded, { once: true });
                img.addEventListener('error', imageLoaded, { once: true });
            }
        });
        
        // Fallback for images - don't wait forever
        setTimeout(() => {
            if (!this.imagesReady) {
                console.warn(`Only ${loadedCount}/${totalCount} critical images loaded, proceeding anyway`);
                this.imagesReady = true;
                this.checkReady();
            }
        }, 2000);
    }
    
    getCriticalImages() {
        const images = [];
        
        // Hero image if present
        const heroImg = document.querySelector('.hero-image img, .hero-container img');
        if (heroImg) images.push(heroImg);
        
        // First 3 images in any gallery carousel
        const carouselImages = document.querySelectorAll('.gallery-carousel-container .gallery-photo img');
        carouselImages.forEach((img, index) => {
            if (index < 3) images.push(img);
        });
        
        // First 6 images in any grid gallery
        const gridImages = document.querySelectorAll('.gallery-grid-item img');
        gridImages.forEach((img, index) => {
            if (index < 6) images.push(img);
        });
        
        // Profile image if present
        const profileImg = document.querySelector('.profile-container img, .about-container img');
        if (profileImg) images.push(profileImg);
        
        return images;
    }
    
    checkReady() {
        // All conditions must be met
        if (
            this.dimensionsApplied &&
            this.componentsLoaded &&
            this.imagesReady &&
            this.minimumDelayMet
        ) {
            this.makePageReady();
        }
    }
    
    forceReady() {
        this.dimensionsApplied = true;
        this.componentsLoaded = true;
        this.imagesReady = true;
        this.minimumDelayMet = true;
        this.makePageReady();
    }
    
    makePageReady() {
        // Small delay to ensure all rendering is complete
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Remove loading classes
                document.documentElement.classList.remove('page-loading');
                document.body.classList.remove('page-loading');
                
                // Add ready class
                document.documentElement.classList.add('page-ready');
                document.body.classList.add('page-ready');
                
                // Dispatch ready event for other scripts
                document.dispatchEvent(new CustomEvent('pageReady', {
                    detail: {
                        loadTime: performance.now() - this.startTime
                    }
                }));
                
            });
        });
    }
}

// Initialize immediately (before DOMContentLoaded to catch everything)
if (document.readyState === 'loading') {
    // Create loader as soon as script runs
    window.pageLoader = new PageLoader();
} else {
    // DOM already loaded
    window.pageLoader = new PageLoader();
}
