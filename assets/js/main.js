/**
 * Salih Camcı Portfolio - Main JavaScript
 * Modern, interactive portfolio functionality
 */

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport (triggers when element starts entering the viewport)
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * 0.92 && rect.bottom >= 0;
}

const TRANSLATIONS = {
    en: {
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.experience': 'Experience',
        'nav.projects': 'Projects',
        'nav.skills': 'Skills',
        'nav.education': 'Education',
        'nav.activities': 'Activities',
        'nav.contact': 'Contact',
        'cta.viewProjects': 'View Projects',
        'cta.requestCv': 'Request CV'
    },
    tr: {
        'nav.home': 'Ana Sayfa',
        'nav.about': 'Hakkımda',
        'nav.experience': 'Deneyim',
        'nav.projects': 'Projeler',
        'nav.skills': 'Yetenekler',
        'nav.education': 'Eğitim',
        'nav.activities': 'Etkinlikler',
        'nav.contact': 'İletişim',
        'cta.viewProjects': 'Projeleri Gör',
        'cta.requestCv': 'CV Talep Et'
    }
};

const LANGUAGE_STORAGE_KEY = 'portfolioLanguage';

function getLanguageFromPath() {
    return window.location.pathname.split('/').includes('tr') ? 'tr' : 'en';
}

function getPreferredLanguage() {
    return getLanguageFromPath();
}

function resolveTargetLanguagePath(targetLanguage) {
    const desiredLanguage = targetLanguage === 'tr' ? 'tr' : 'en';
    const pathname = window.location.pathname;
    const hash = window.location.hash || '';
    const segments = pathname.split('/').filter(Boolean);
    const isCurrentTr = segments.includes('tr');
    const currentLeaf = segments[segments.length - 1] || '';
    const hasFile = currentLeaf.includes('.html');
    const fileName = hasFile ? currentLeaf : 'index.html';
    const safeFileName = fileName.endsWith('.html') ? fileName : 'index.html';

    if (desiredLanguage === 'tr') {
        const target = isCurrentTr ? safeFileName : `tr/${safeFileName}`;
        return safeFileName === 'index.html' ? `${target}${hash}` : target;
    }

    const target = isCurrentTr ? `../${safeFileName}` : safeFileName;
    return safeFileName === 'index.html' ? `${target}${hash}` : target;
}

function getTypingTexts(language) {
    return language === 'tr'
        ? ['Yazılım Mühendisi', 'Full Stack Geliştirici', 'Makine Öğrenmesi Meraklısı']
        : ['Software Engineer', 'Full Stack Developer', 'Machine Learning Enthusiast'];
}

function applyLanguage(language) {
    const selectedLanguage = language === 'tr' ? 'tr' : 'en';
    const translationSet = TRANSLATIONS[selectedLanguage];

    document.documentElement.lang = selectedLanguage;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);

    document.querySelectorAll('[data-i18n-key]').forEach((element) => {
        const key = element.getAttribute('data-i18n-key');
        if (key && translationSet[key]) {
            element.textContent = translationSet[key];
        }
    });

    document.querySelectorAll('[data-lang-switch]').forEach((button) => {
        button.classList.toggle('active', button.getAttribute('data-lang-switch') === selectedLanguage);
    });

    if (window.portfolioState?.typingElement) {
        window.portfolioState.typingEffect?.stop();
        window.portfolioState.typingElement.textContent = '';
        window.portfolioState.typingEffect = new TypingEffect(
            window.portfolioState.typingElement,
            getTypingTexts(selectedLanguage),
            100
        );
    }
}

function initLanguageSwitcher() {
    const buttons = document.querySelectorAll('[data-lang-switch]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const language = button.getAttribute('data-lang-switch') || 'en';
            const selectedLanguage = language === 'tr' ? 'tr' : 'en';
            localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);

            const targetPath = resolveTargetLanguagePath(selectedLanguage) || (selectedLanguage === 'tr' ? 'tr/index.html' : 'index.html');
            window.location.href = targetPath;
        });
    });
}

// ============================================
// Navigation
// ============================================

class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.mobileNav = document.querySelector('.mobile-nav');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        // Scroll effect on navbar
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 50) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
        }, 10));
        
        // Mobile menu toggle
        this.mobileMenuBtn?.addEventListener('click', () => {
            this.mobileNav?.classList.toggle('active');
        });
        
        // Active nav link based on scroll position
        window.addEventListener('scroll', debounce(() => {
            this.updateActiveNavLink();
        }, 100));
        
        // Smooth scroll to sections
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Close mobile menu if open
                        this.mobileNav?.classList.remove('active');
                    }
                }
            });
        });
    }
    
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ============================================
// Scroll Animations
// ============================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in');
        this.init();
    }
    
    init() {
        // Initial check with slight delay to allow layout to settle
        this.checkElements();
        setTimeout(() => this.checkElements(), 100);
        
        // Check on scroll
        window.addEventListener('scroll', () => {
            this.checkElements();
        });

        // Also check on resize
        window.addEventListener('resize', debounce(() => {
            this.checkElements();
        }, 100));
    }
    
    checkElements() {
        this.elements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }
}

// ============================================
// Project Filtering
// ============================================

class ProjectFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        this.init();
    }
    
    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterProjects(filter);
                
                // Update active button
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
}

// ============================================
// Skill Bars Animation
// ============================================

class SkillBars {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                }
            });
        }, { threshold: 0.5 });
        
        this.skillBars.forEach(bar => {
            observer.observe(bar);
        });
    }
}

// ============================================
// Typing Effect
// ============================================

class TypingEffect {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.timeoutId = null;
        
        if (this.element) {
            this.type();
        }
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.speed;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        this.timeoutId = setTimeout(() => this.type(), typeSpeed);
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

// ============================================
// Form Validation
// ============================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.submitForm();
            }
        });
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearError(input);
                
                // Email validation
                if (input.type === 'email' && !this.isValidEmail(input.value)) {
                    this.showError(input, 'Please enter a valid email');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showError(input, message) {
        const formGroup = input.parentElement;
        const error = formGroup.querySelector('.error-message') || document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        error.style.color = 'var(--red)';
        error.style.fontSize = '0.875rem';
        error.style.marginTop = '0.25rem';
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(error);
        }
        
        input.style.borderColor = 'var(--red)';
    }
    
    clearError(input) {
        const formGroup = input.parentElement;
        const error = formGroup.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        input.style.borderColor = '';
    }
    
    submitForm() {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
        successMessage.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(successMessage);
        
        // Reset form
        this.form.reset();
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
}

// ============================================
// Request CV Function
// ============================================

function downloadCV() {
    const isTurkish = document.documentElement.lang === 'tr';
    const subject = encodeURIComponent(isTurkish ? 'CV Talebi - Portfolyo Web Sitesi' : 'CV Request - Portfolio Website');
    const body = encodeURIComponent(
        isTurkish
            ? 'Merhaba Salih,\n\nPortfolyonu inceledim ve CV\'ni talep etmek istiyorum.\n\nİyi çalışmalar,'
            : 'Hi Salih,\n\nI found your portfolio and would like to request your CV.\n\nBest regards,'
    );
    window.location.href = `mailto:salih.camci@bahcesehir.edu.tr?subject=${subject}&body=${body}`;
}

// ============================================
// Smooth Scroll to Section
// ============================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// Back to Top Button
// ============================================

class BackToTop {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        this.init();
    }
    
    init() {
        if (!this.button) return;
        
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 300) {
                this.button.style.display = 'flex';
            } else {
                this.button.style.display = 'none';
            }
        }, 100));
        
        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const selectedLanguage = getLanguageFromPath();

    // Initialize navigation
    new Navigation();

    // Initialize language switcher
    initLanguageSwitcher();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize project filter if on projects page
    if (document.querySelector('.filter-btn')) {
        new ProjectFilter();
    }
    
    // Initialize skill bars if present
    if (document.querySelector('.skill-progress')) {
        new SkillBars();
    }
    
    // Initialize typing effect if present
    const typingElement = document.querySelector('.typing-text');
    window.portfolioState = { typingElement: null, typingEffect: null };

    if (typingElement) {
        window.portfolioState.typingElement = typingElement;
        window.portfolioState.typingEffect = new TypingEffect(
            typingElement,
            getTypingTexts(selectedLanguage),
            100
        );
    }

    applyLanguage(selectedLanguage);
    
    // Initialize form validation if contact form exists
    if (document.getElementById('contact-form')) {
        new FormValidator('contact-form');
    }
    
    // Initialize back to top button
    new BackToTop();
    
    // Add year to footer
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ============================================
// Export functions for global use
// ============================================

window.portfolioFunctions = {
    downloadCV,
    scrollToSection,
    applyLanguage
};
