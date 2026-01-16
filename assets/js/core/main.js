// ========================================
// LAR PRIME - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavbar();
    initSearchTabs();
    initFavorites();
    initAnimations();
    initMobileMenu();
    initFormValidation();
});

// ========================================
// NAVBAR
// ========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// SEARCH TABS
// ========================================
function initSearchTabs() {
    const tabs = document.querySelectorAll('.search-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ========================================
// FAVORITES
// ========================================
function initFavorites() {
    const favoriteButtons = document.querySelectorAll('.property-favorite');
    
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.background = 'var(--color-error)';
                
                // Show notification
                showNotification('Imóvel adicionado aos favoritos!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.style.background = 'rgba(0, 0, 0, 0.5)';
                
                showNotification('Imóvel removido dos favoritos', 'info');
            }
        });
    });
}

// ========================================
// NOTIFICATIONS
// ========================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.property-card, .benefit-card, .testimonial-card, .section-header'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Add animation class styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(animationStyles);

// ========================================
// MOBILE MENU
// ========================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (!mobileMenuBtn) return;

    // Create mobile menu container
    const mobileMenu = document.createElement('div');
    // Detect base path (root or pages/)
    const isInPages = window.location.pathname.includes('/pages/');
    const basePath = isInPages ? '../' : '';
    const pagesPath = isInPages ? '' : 'pages/';
    
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <div class="mobile-menu-content">
            <ul class="mobile-nav-links">
                <li><a href="${basePath}index.html">Início</a></li>
                <li><a href="${basePath}${pagesPath}imoveis.html">Imóveis</a></li>
                <li><a href="${basePath}${pagesPath}sobre.html">Sobre Nós</a></li>
                <li><a href="${basePath}${pagesPath}contato.html">Contato</a></li>
            </ul>
            <div class="mobile-nav-actions">
                <a href="tel:+5511999999999" class="mobile-phone">
                    <i class="fas fa-phone"></i> (11) 99999-9999
                </a>
                <a href="${basePath}${pagesPath}contato.html" class="btn btn-primary">Fale Conosco</a>
            </div>
        </div>
    `;

    // Add mobile menu styles
    const mobileMenuStyles = document.createElement('style');
    mobileMenuStyles.textContent = `
        .mobile-menu {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 10, 10, 0.98);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .mobile-menu.active {
            opacity: 1;
            visibility: visible;
        }
        .mobile-menu-content {
            text-align: center;
        }
        .mobile-nav-links {
            list-style: none;
            padding: 0;
            margin: 0 0 40px 0;
        }
        .mobile-nav-links li {
            margin-bottom: 24px;
        }
        .mobile-nav-links a {
            font-size: 1.5rem;
            font-weight: 500;
            color: #fff;
            transition: color 0.3s ease;
        }
        .mobile-nav-links a:hover {
            color: #c9a962;
        }
        .mobile-nav-actions {
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-items: center;
        }
        .mobile-phone {
            color: #c9a962;
            font-size: 1.1rem;
        }
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    `;
    document.head.appendChild(mobileMenuStyles);
    document.body.appendChild(mobileMenu);

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ========================================
// FORM VALIDATION
// ========================================
function initFormValidation() {
    const form = document.querySelector('.contact-form form');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simple validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        if (isValid) {
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            form.reset();
        } else {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        }
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// GALLERY (for property detail page)
// ========================================
function initGallery() {
    const mainImage = document.querySelector('.gallery-main img');
    const thumbs = document.querySelectorAll('.gallery-thumb');

    if (!mainImage || !thumbs.length) return;

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const newSrc = thumb.querySelector('img').src;
            mainImage.style.opacity = '0';
            
            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.style.opacity = '1';
            }, 200);
        });
    });
}

// Initialize gallery if on detail page
if (document.querySelector('.property-gallery')) {
    initGallery();
}

// ========================================
// FILTERS (for properties listing page)
// ========================================
function initFilters() {
    const filterSelects = document.querySelectorAll('.filters-bar select');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            // Simulate filtering
            const cards = document.querySelectorAll('.property-card');
            cards.forEach(card => {
                card.style.opacity = '0.5';
                card.style.transform = 'scale(0.98)';
            });

            setTimeout(() => {
                cards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                });
                showNotification('Filtros aplicados!', 'info');
            }, 500);
        });
    });
}

// Initialize filters if on listing page
if (document.querySelector('.filters-bar')) {
    initFilters();
}

// ========================================
// COUNTER ANIMATION
// ========================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString('pt-BR');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('pt-BR') + (element.dataset.suffix || '');
        }
    }
    
    updateCounter();
}

// Animate stats on scroll
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.includes('%') ? '%' : text.includes('+') ? '+' : '';
                stat.dataset.suffix = suffix;
                animateCounter(stat, number);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

