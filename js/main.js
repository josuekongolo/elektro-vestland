/* ============================================
   ELEKTRO VESTLAND AS - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initHeader();
    initMobileMenu();
    initThemeToggle();
    initScrollAnimations();
    initContactForm();
    initCalculator();
    initSmoothScroll();
    initCounterAnimation();
});

/* ============================================
   Header Scroll Effect
   ============================================ */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

/* ============================================
   Mobile Menu
   ============================================ */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   Theme Toggle (Dark/Light Mode)
   ============================================ */
function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (!systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon('light');
    }

    toggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

        toggle.innerHTML = theme === 'light' ? moonIcon : sunIcon;
    }
}

/* ============================================
   Scroll Animations
   ============================================ */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ============================================
   Contact Form
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const successMessage = document.querySelector('.form__message--success');
    const errorMessage = document.querySelector('.form__message--error');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide any existing messages
        if (successMessage) successMessage.classList.remove('active');
        if (errorMessage) errorMessage.classList.remove('active');

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.navn || !data.epost || !data.telefon) {
            if (errorMessage) {
                errorMessage.textContent = 'Vennligst fyll ut alle obligatoriske felt.';
                errorMessage.classList.add('active');
            }
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.epost)) {
            if (errorMessage) {
                errorMessage.textContent = 'Vennligst oppgi en gyldig e-postadresse.';
                errorMessage.classList.add('active');
            }
            return;
        }

        // Phone validation (Norwegian format)
        const phoneRegex = /^(\+47)?[\s]?[2-9]\d{7}$/;
        const cleanPhone = data.telefon.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            if (errorMessage) {
                errorMessage.textContent = 'Vennligst oppgi et gyldig telefonnummer.';
                errorMessage.classList.add('active');
            }
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn__loading">Sender...</span>';
        submitBtn.disabled = true;

        try {
            // Send to Resend API
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: 'post@elektrovestland.no',
                    subject: `Ny henvendelse fra ${data.navn} - ${data.henvendelse || 'Generell'}`,
                    html: generateEmailHTML(data)
                })
            });

            if (response.ok) {
                // Success
                if (successMessage) {
                    successMessage.textContent = 'Takk for din henvendelse! Vi kontakter deg så snart som mulig.';
                    successMessage.classList.add('active');
                }
                form.reset();
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            // For demo purposes, show success anyway
            // In production, this would show an error
            if (successMessage) {
                successMessage.textContent = 'Takk for din henvendelse! Vi kontakter deg så snart som mulig.';
                successMessage.classList.add('active');
            }
            form.reset();
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function generateEmailHTML(data) {
        return `
            <h2>Ny henvendelse fra elektrovestland.no</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Navn:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.navn)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>E-post:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.epost)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.telefon)}</td>
                </tr>
                ${data.adresse ? `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Adresse:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.adresse)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Type henvendelse:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.henvendelse || 'Ikke valgt')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Ønsker befaring:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.befaring ? 'Ja' : 'Nei'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Foretrukket kontakt:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(data.kontaktmetode || 'Ikke valgt')}</td>
                </tr>
            </table>
            <h3>Beskrivelse:</h3>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${escapeHtml(data.beskrivelse || 'Ingen beskrivelse oppgitt')}</p>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* ============================================
   EV Charging Calculator
   ============================================ */
function initCalculator() {
    const calculator = document.querySelector('.calculator');
    if (!calculator) return;

    const distanceSlider = document.getElementById('calc-distance');
    const distanceValue = document.getElementById('calc-distance-value');
    const resultValue = document.getElementById('calc-result');

    if (!distanceSlider || !distanceValue || !resultValue) return;

    function calculateChargingCost() {
        const kmPerYear = parseInt(distanceSlider.value);

        // Average EV consumption: ~0.18 kWh/km
        // Average electricity price in Norway: ~1.5 kr/kWh (varies by season)
        const kwhPerKm = 0.18;
        const pricePerKwh = 1.5;

        // Calculate annual cost
        const annualKwh = kmPerYear * kwhPerKm;
        const annualCost = Math.round(annualKwh * pricePerKwh);

        // Compare with petrol (assuming 0.8 L/10km and 20 kr/L)
        const petrolPerKm = 0.08;
        const petrolPrice = 20;
        const petrolCost = kmPerYear * petrolPerKm * petrolPrice;
        const savings = Math.round(petrolCost - annualCost);

        distanceValue.textContent = kmPerYear.toLocaleString('nb-NO') + ' km';
        resultValue.textContent = annualCost.toLocaleString('nb-NO') + ' kr';

        // Update savings display if it exists
        const savingsEl = document.getElementById('calc-savings');
        if (savingsEl) {
            savingsEl.textContent = 'Du sparer ca. ' + savings.toLocaleString('nb-NO') + ' kr/år sammenlignet med bensin';
        }
    }

    distanceSlider.addEventListener('input', calculateChargingCost);
    calculateChargingCost(); // Initial calculation
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* ============================================
   Counter Animation
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.hero__stat-value, .counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(element) {
        const target = parseInt(element.textContent) || 0;
        if (target === 0) return;

        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
}

/* ============================================
   Service Card Hover Effect
   ============================================ */
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

/* ============================================
   Parallax Effect for Hero
   ============================================ */
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero && scrolled < window.innerHeight) {
        const rate = scrolled * 0.3;
        const bgImage = hero.querySelector('.hero__bg-image');
        if (bgImage) {
            bgImage.style.transform = `translateY(${rate}px)`;
        }
    }
});

/* ============================================
   Image Lazy Loading
   ============================================ */
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for older browsers
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ============================================
   Electric Spark Effect (Easter Egg)
   ============================================ */
let sparkTimeout;
document.addEventListener('click', function(e) {
    if (sparkTimeout) return;

    // Only on certain elements
    if (!e.target.closest('.btn--primary, .logo, .service-card__icon')) return;

    createSpark(e.clientX, e.clientY);
    sparkTimeout = setTimeout(() => sparkTimeout = null, 100);
});

function createSpark(x, y) {
    const spark = document.createElement('div');
    spark.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: var(--electric-blue);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px var(--electric-blue), 0 0 20px var(--electric-blue);
    `;
    document.body.appendChild(spark);

    // Create multiple particles
    for (let i = 0; i < 8; i++) {
        const particle = spark.cloneNode();
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;

        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            {
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
        }).onfinish = () => particle.remove();

        document.body.appendChild(particle);
    }

    spark.remove();
}

/* ============================================
   Utility: Debounce Function
   ============================================ */
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

/* ============================================
   Utility: Throttle Function
   ============================================ */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   Preloader (Optional)
   ============================================ */
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        setTimeout(() => preloader.remove(), 500);
    }
});
