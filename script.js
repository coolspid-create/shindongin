console.log('[script.js] File loaded. window.supabase type:', typeof window.supabase);
const SUPABASE_URL = 'https://dxtjoohcoioansnjrxkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGpvb2hjb2lvYW5zbmpyeGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDIyNzUsImV4cCI6MjA5MTE3ODI3NX0.C6j2QWJX1-XsS7pdW--uxosNUyAspdhmWWvsr-qCUQA';

let supabaseClient;
try {
    // The UMD build exposes supabase.createClient on the global object
    const sb = window.supabase;
    if (sb && typeof sb.createClient === 'function') {
        supabaseClient = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (sb && typeof sb === 'function') {
        // Some UMD builds export the createClient as the default
        supabaseClient = sb(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('[script.js] window.supabase is not available or createClient not found. Keys:', sb ? Object.keys(sb) : 'undefined');
    }
    console.log('[script.js] Supabase client initialized:', !!supabaseClient);
} catch (err) {
    console.error('[script.js] Failed to initialize Supabase:', err);
}

/**
 * Portfolio — Typing + Orbital Particles (Hero Only) + Scroll Parallax
 */
document.addEventListener('DOMContentLoaded', async () => {

    // ═══════════════════════════════════════════════════════
    // 0. FETCH SUPABASE DATA
    // ═══════════════════════════════════════════════════════
    console.log('DOMContentLoaded: Starting data fetch from Supabase...');
    let contentData = null;
    let projectsData = null;

    if (supabaseClient) {
    try {
        const [contentRes, projectsRes] = await Promise.all([
            supabaseClient.from('site_content').select('*'),
            supabaseClient.from('portfolio_projects').select('*').order('project_order', { ascending: true })
        ]);
        
        console.log('Supabase Fetch Complete:', { content: contentRes.data, projects: projectsRes.data });
        
        if (contentRes.error) throw contentRes.error;
        if (projectsRes.error) throw projectsRes.error;

        contentData = contentRes.data;
        projectsData = projectsRes.data;
    } catch (e) {
        console.error("Supabase Database Error:", e);
    }
    } // end if (supabaseClient)

    // Map content to an object
    const siteContent = {};
    if (contentData) {
        contentData.forEach(item => {
            if (item.section_key) {
                siteContent[item.section_key.trim()] = item.content;
            }
        });
    }
    console.log('Site Content Mapped:', siteContent);


    // Populate Site Content
    const labelEl = document.querySelector('.label');
    const heroDescEl = document.querySelector('.hero-subtext');
    const aboutBioEl = document.querySelector('.vision-bio p');
    const aboutH2El = document.querySelector('.vision-headline');
    const aboutPhotoPlaceholder = document.querySelector('.vision-photo-placeholder');

    if (siteContent.hero_label && labelEl) labelEl.innerHTML = siteContent.hero_label;
    if (siteContent.hero_desc && heroDescEl) heroDescEl.innerHTML = siteContent.hero_desc;
    if (siteContent.about_bio && aboutBioEl) aboutBioEl.innerHTML = siteContent.about_bio;
    if (siteContent.about_h2 && aboutH2El) aboutH2El.innerHTML = siteContent.about_h2;

    const footerLocEl = document.querySelector('.copyright span:last-child');
    if (siteContent.footer_location && footerLocEl) footerLocEl.innerHTML = siteContent.footer_location;
    
    if (siteContent.about_photo && aboutPhotoPlaceholder) {
        aboutPhotoPlaceholder.innerHTML = `<img src="${siteContent.about_photo}" alt="Vision Photo">`;
    }

    // Populate Projects
    const projectsContainer = document.getElementById('dynamic-projects-container');
    console.log('Populating Projects:', { containerExists: !!projectsContainer, projectsFound: projectsData?.length });

    if (projectsContainer && projectsData && projectsData.length > 0) {
        projectsContainer.innerHTML = ''; // clear loading state
        projectsData.forEach(proj => {
            const item = document.createElement('div');
            item.className = 'project-item scroll-reveal'; // Ensure initial setup
            
            const thumbHtml = proj.image_url 
                ? `<div class="project-image-container"><div class="image-inner-wrapper"><img src="${proj.image_url}" alt="${proj.title}"></div></div>`
                : `<div class="project-image-container"><div class="image-inner-wrapper"><div style="width: 100%; height: 100%; background: #eaeaea; display:flex; align-items:center; justify-content:center; color:#888;">No Image</div></div></div>`;
                
            item.innerHTML = `
                ${thumbHtml}
                <div class="project-content">
                    <span class="project-meta">${proj.category}</span>
                    <h2>${proj.title}</h2>
                    <p>${proj.description}</p>
                    ${proj.link_url ? `<a href="${proj.link_url}" target="_blank" rel="noopener noreferrer" class="btn-tertiary">VIEW CASE &rarr;</a>` : ''}
                </div>
            `;
            projectsContainer.appendChild(item);
        });

        // Re-initialize animations for new elements
        if (typeof initScrollReveal === 'function') initScrollReveal();
    } else if (projectsContainer) {
        projectsContainer.innerHTML = '<p style="text-align: center; color: #777; padding: 40px 0;">No projects available.</p>';
    }

    // ═══════════════════════════════════════════════════════
    // 1. TYPING ANIMATION
    // ═══════════════════════════════════════════════════════
    const h1 = document.querySelector('h1');
    const label = document.querySelector('.label');
    const subtext = document.querySelector('.hero-subtext');

    const titleHTML = siteContent.hero_title || 'LEADING AX<br>TRANSFORMATION';
    const titleText = titleHTML.replace(/<br\s*\/?>/gi, '\n');

    h1.textContent = '';
    h1.style.opacity = '1';
    h1.classList.add('typing-active');

    subtext.style.transform = 'translateY(20px)';

    // Step 1: Label fades in at the center (already translated via inline CSS)
    setTimeout(() => {
        label.style.transition = 'opacity 1.2s ease-in-out';
        label.style.opacity = '1';
    }, 150);

    // Step 2: Label moves up to make room
    setTimeout(() => {
        label.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease';
        label.style.transform = 'translateY(0)';
    }, 1600);

    // Step 3: Start typing title
    setTimeout(typeTitle, 2300);

    let charIndex = 0;
    const typingSpeed = 45;

    function typeTitle() {
        if (charIndex < titleText.length) {
            const currentText = titleText.substring(0, charIndex + 1);
            h1.innerHTML = currentText.replace(/\n/g, '<br>');
            h1.innerHTML += '<span class="typing-cursor">|</span>';
            charIndex++;
            setTimeout(typeTitle, typingSpeed);
        } else {
            setTimeout(() => {
                h1.innerHTML = titleHTML;
                h1.classList.remove('typing-active');

                subtext.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                subtext.style.opacity = '0.7';
                subtext.style.transform = 'translateY(0)';

                setTimeout(() => {
                    initParticleSystem();
                }, 400);
            }, 300);
        }
    }

    // ═══════════════════════════════════════════════════════
    // 2. MOUSE-FOLLOWING ORBITAL PARTICLES (HERO ONLY)
    // ═══════════════════════════════════════════════════════
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero-section');

    let particles = [];
    let animationStarted = false;
    let mouse = { x: undefined, y: undefined, active: false };
    let scrollProgress = 0; // 0 = top of hero, 1 = hero scrolled away

    const huePool = [210, 220, 230, 240, 250, 260, 270, 280, 0, 330, 30, 60];

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', initCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // ── Scroll: fade particles out as user leaves hero ──
    window.addEventListener('scroll', () => {
        const heroHeight = heroSection.offsetHeight;
        const scrollY = window.scrollY;
        // Start fading at 30% of hero, fully gone at 90%
        scrollProgress = Math.min(1, Math.max(0, (scrollY - heroHeight * 0.3) / (heroHeight * 0.6)));
    }, { passive: true });

    // ── Particle Class ──
    class Particle {
        constructor() {
            this.reset(false);
        }

        reset(spawnAtMouse) {
            if (spawnAtMouse && mouse.active) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 120 + 60;
                this.x = mouse.x + Math.cos(angle) * dist;
                this.y = mouse.y + Math.sin(angle) * dist;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }

            // Size variety
            const sizeRoll = Math.random();
            if (sizeRoll < 0.55) {
                this.size = Math.random() * 1.0 + 0.3;
            } else if (sizeRoll < 0.88) {
                this.size = Math.random() * 2.0 + 1.0;
            } else {
                this.size = Math.random() * 2.5 + 2.5;
            }

            this.baseSize = this.size;
            this.opacity = 0;
            this.targetOpacity = Math.random() * 0.4 + 0.1;

            // WIDER orbit to prevent clumping — min 80px, max 350px
            this.orbitRadius = Math.random() * 270 + 80;
            this.orbitAngle = Math.random() * Math.PI * 2;
            this.orbitSpeed = (Math.random() * 0.006 + 0.001) * (Math.random() < 0.5 ? 1 : -1);

            // Drift
            this.driftVx = (Math.random() - 0.5) * 0.3;
            this.driftVy = (Math.random() - 0.5) * 0.3;

            // Wobble
            this.wobbleAngle = Math.random() * Math.PI * 2;
            this.wobbleSpeed = (Math.random() - 0.5) * 0.015;
            this.wobbleRadius = Math.random() * 10 + 3;

            // Color
            this.hue = huePool[Math.floor(Math.random() * huePool.length)];
            this.saturation = Math.random() * 30 + 50;
            this.lightness = Math.random() * 20 + 55;

            const baseColors = ['#0050d7', '#346bf1', '#1a1c1c', '#737686', '#002d72', '#94a3b8'];
            this.baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
            this.currentColor = this.baseColor;
            this.colorBlend = 0;

            // Slower easing = softer follow (less clumping at center)
            this.easing = Math.random() * 0.015 + 0.008;

            this.fadeInSpeed = Math.random() * 0.012 + 0.005;
            this.fadedIn = false;
        }

        update() {
            // Fade in
            if (!this.fadedIn) {
                this.opacity += this.fadeInSpeed;
                if (this.opacity >= this.targetOpacity) {
                    this.opacity = this.targetOpacity;
                    this.fadedIn = true;
                }
            }

            // Apply scroll fade — reduce opacity as user scrolls past hero
            const effectiveOpacity = this.opacity * (1 - scrollProgress);

            this.wobbleAngle += this.wobbleSpeed;

            if (mouse.active && mouse.x !== undefined && scrollProgress < 0.95) {
                this.orbitAngle += this.orbitSpeed;

                const targetX = mouse.x + Math.cos(this.orbitAngle) * this.orbitRadius
                    + Math.cos(this.wobbleAngle) * this.wobbleRadius;
                const targetY = mouse.y + Math.sin(this.orbitAngle) * this.orbitRadius
                    + Math.sin(this.wobbleAngle) * this.wobbleRadius;

                this.x += (targetX - this.x) * this.easing;
                this.y += (targetY - this.y) * this.easing;

                // Proximity effects (mild)
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const proximity = Math.max(0, 1 - dist / 350);
                this.size = this.baseSize + this.baseSize * proximity * 0.5;
                this.colorBlend += (proximity * 0.6 - this.colorBlend) * 0.08;

            } else {
                // Drift freely
                this.x += this.driftVx;
                this.y += this.driftVy;
                this.x += Math.cos(this.wobbleAngle) * 0.2;
                this.y += Math.sin(this.wobbleAngle) * 0.2;

                this.colorBlend *= 0.96;
                this.size += (this.baseSize - this.size) * 0.05;
            }

            // Color
            if (this.colorBlend > 0.02) {
                const s = this.saturation + this.colorBlend * 25;
                const l = this.lightness + this.colorBlend * 15;
                this.currentColor = `hsl(${this.hue}, ${s}%, ${l}%)`;
            } else {
                this.currentColor = this.baseColor;
            }

            // Recycle off-screen
            if (this.x < -150 || this.x > canvas.width + 150 ||
                this.y < -150 || this.y > canvas.height + 150) {
                this.reset(true);
            }

            this._effectiveOpacity = effectiveOpacity;
        }

        draw() {
            if (this._effectiveOpacity < 0.005) return; // skip invisible

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.currentColor;
            ctx.globalAlpha = this._effectiveOpacity;
            ctx.fill();

            // Subtle glow
            if (this.colorBlend > 0.15 && this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = this.currentColor;
                ctx.globalAlpha = this.colorBlend * 0.06 * (1 - scrollProgress);
                ctx.fill();
            }
        }
    }

    // ── Particle System ──
    const TOTAL_PARTICLES = 350; // Reduced from 600
    const SPAWN_BATCH = 10;
    const SPAWN_INTERVAL = 40;

    function initParticleSystem() {
        if (animationStarted) return;
        animationStarted = true;
        initCanvas();

        let spawned = 0;
        const spawnTimer = setInterval(() => {
            for (let i = 0; i < SPAWN_BATCH && spawned < TOTAL_PARTICLES; i++) {
                particles.push(new Particle());
                spawned++;
            }
            if (spawned >= TOTAL_PARTICLES) clearInterval(spawnTimer);
        }, SPAWN_INTERVAL);

        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        // Skip rendering entirely if scrolled past hero
        if (scrollProgress < 0.99) {
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connection lines (only near mouse, limited pairs for perf)
            if (mouse.active && scrollProgress < 0.8) {
                const nearMouse = [];
                for (let i = 0; i < particles.length; i++) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    if (dx * dx + dy * dy < 40000) { // 200px radius
                        nearMouse.push(particles[i]);
                        if (nearMouse.length >= 30) break; // cap for performance
                    }
                }
                const maxDist = 100;
                for (let i = 0; i < nearMouse.length; i++) {
                    for (let j = i + 1; j < nearMouse.length; j++) {
                        const dx = nearMouse[i].x - nearMouse[j].x;
                        const dy = nearMouse[i].y - nearMouse[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < maxDist) {
                            const opacity = (1 - dist / maxDist) * 0.06 * (1 - scrollProgress);
                            ctx.beginPath();
                            ctx.moveTo(nearMouse[i].x, nearMouse[i].y);
                            ctx.lineTo(nearMouse[j].x, nearMouse[j].y);
                            ctx.strokeStyle = `rgba(0, 80, 215, ${opacity})`;
                            ctx.lineWidth = 0.5;
                            ctx.globalAlpha = 1;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    // ═══════════════════════════════════════════════════════
    // 3. SCROLL PARALLAX + REVEAL ANIMATIONS
    // ═══════════════════════════════════════════════════════

    // ── Hero Parallax: content moves up with scroll ──
    const heroContent = document.querySelector('.hero-content');
    const navEl = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;

        // Hero parallax
        if (scrollY < heroHeight) {
            const ratio = scrollY / heroHeight;
            heroContent.style.transform = `translateY(${-scrollY * 0.4}px)`;
            heroContent.style.opacity = 1 - ratio * 1.2;
        }

        // Nav progressive fade: smoothly ties to scroll position
        const fadeStart = heroHeight * 0.4; // Start fading at 40% of hero
        const fadeEnd = heroHeight * 0.85;   // Fully hidden at 85% of hero
        if (scrollY <= fadeStart) {
            navEl.style.transform = 'translateY(0)';
            navEl.style.opacity = '1';
        } else if (scrollY >= fadeEnd) {
            navEl.style.transform = 'translateY(-100%)';
            navEl.style.opacity = '0';
        } else {
            const progress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
            navEl.style.transform = `translateY(${-progress * 100}%)`;
            navEl.style.opacity = `${1 - progress}`;
        }
    }, { passive: true });

    // ── Vision Section: Cinematic Scale-Up on Scroll ──
    const visionSection = document.querySelector('.about-vision');
    if (visionSection) {
        const visionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visionSection.classList.add('vision-expanded');
                    visionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });
        visionObserver.observe(visionSection);
    }

    // ── Intersection Observer for scroll-reveal ──
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.project-item, .footer-title, .footer-actions, .copyright, .vision-left, .vision-headline, .pillar-card');
        revealElements.forEach(el => el.classList.add('scroll-reveal'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    initScrollReveal();

    // ── Per-section parallax: text moves with scroll within its section ──
    function updateSectionParallax() {
        const projectItems = document.querySelectorAll('.project-item');
        const scrollY = window.scrollY;
        const viewportH = window.innerHeight;

        projectItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportH / 2;

            // How far the item center is from viewport center (-1 to 1)
            const offset = (itemCenter - viewportCenter) / viewportH;

            // Only apply when item is roughly in view
            if (rect.top < viewportH + 100 && rect.bottom > -100) {
                const image = item.querySelector('.project-image-container');
                if (image) {
                    image.style.transform = `translateY(${offset * -15}px)`;
                }
            }
        });

        requestAnimationFrame(updateSectionParallax);
    }


    updateSectionParallax();

    // ═══════════════════════════════════════════════════════
    // 4. FOOTER TYPING & PARTICLES
    // ═══════════════════════════════════════════════════════
    const footerTypingTitle = document.getElementById('footer-typing-title');
    const footerTitleHTML = "LET'S BUILD<br>THE FUTURE.";
    const footerTitleText = footerTitleHTML.replace(/<br\s*\/?>/gi, '\n');
    let footerHasTyped = false;

    const footerCanvas = document.getElementById('footer-particle-canvas');
    let footerCtx;
    if (footerCanvas) footerCtx = footerCanvas.getContext('2d');
    
    let footerParticles = [];
    let footerAnimationStarted = false;

    // Helper to get mouse coordinates relative to the footer canvas
    function getFooterMouse() {
        if (!mouse.active || mouse.x === undefined || mouse.y === undefined) {
            return { x: undefined, y: undefined, active: false };
        }
        const rect = footerCanvas.getBoundingClientRect();
        return {
            x: mouse.x - rect.left,
            y: mouse.y - rect.top,
            active: true
        };
    }

    // High-end orbital particle class for the footer
    class FooterParticle {
        constructor() {
            this.reset(false);
        }

        reset(spawnAtMouse) {
            const fMouse = getFooterMouse();
            if (spawnAtMouse && fMouse.active) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 120 + 60;
                this.x = fMouse.x + Math.cos(angle) * dist;
                this.y = fMouse.y + Math.sin(angle) * dist;
            } else {
                this.x = Math.random() * footerCanvas.width;
                this.y = Math.random() * footerCanvas.height;
            }

            // Size variety
            const sizeRoll = Math.random();
            if (sizeRoll < 0.55) {
                this.size = Math.random() * 1.0 + 0.3;
            } else if (sizeRoll < 0.88) {
                this.size = Math.random() * 2.0 + 1.0;
            } else {
                this.size = Math.random() * 2.5 + 2.5;
            }

            this.baseSize = this.size;
            this.opacity = 0;
            this.targetOpacity = Math.random() * 0.4 + 0.1;

            // Orbit properties
            this.orbitRadius = Math.random() * 270 + 80;
            this.orbitAngle = Math.random() * Math.PI * 2;
            this.orbitSpeed = (Math.random() * 0.006 + 0.001) * (Math.random() < 0.5 ? 1 : -1);

            // Drift
            this.driftVx = (Math.random() - 0.5) * 0.3;
            this.driftVy = (Math.random() - 0.5) * 0.3;

            // Wobble
            this.wobbleAngle = Math.random() * Math.PI * 2;
            this.wobbleSpeed = (Math.random() - 0.5) * 0.015;
            this.wobbleRadius = Math.random() * 10 + 3;

            // Color
            this.hue = huePool[Math.floor(Math.random() * huePool.length)];
            this.saturation = Math.random() * 30 + 50;
            this.lightness = Math.random() * 20 + 55;

            const baseColors = ['#0050d7', '#346bf1', '#1a1c1c', '#737686', '#002d72', '#94a3b8'];
            this.baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
            this.currentColor = this.baseColor;
            this.colorBlend = 0;

            this.easing = Math.random() * 0.015 + 0.008;
            this.fadeInSpeed = Math.random() * 0.012 + 0.005;
            this.fadedIn = false;
        }

        update() {
            if (!this.fadedIn) {
                this.opacity += this.fadeInSpeed;
                if (this.opacity >= this.targetOpacity) {
                    this.opacity = this.targetOpacity;
                    this.fadedIn = true;
                }
            }

            this.wobbleAngle += this.wobbleSpeed;
            const fMouse = getFooterMouse();

            if (fMouse.active && fMouse.x !== undefined) {
                this.orbitAngle += this.orbitSpeed;

                const targetX = fMouse.x + Math.cos(this.orbitAngle) * this.orbitRadius
                    + Math.cos(this.wobbleAngle) * this.wobbleRadius;
                const targetY = fMouse.y + Math.sin(this.orbitAngle) * this.orbitRadius
                    + Math.sin(this.wobbleAngle) * this.wobbleRadius;

                this.x += (targetX - this.x) * this.easing;
                this.y += (targetY - this.y) * this.easing;

                // Proximity
                const dx = this.x - fMouse.x;
                const dy = this.y - fMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const proximity = Math.max(0, 1 - dist / 350);
                this.size = this.baseSize + this.baseSize * proximity * 0.5;
                this.colorBlend += (proximity * 0.6 - this.colorBlend) * 0.08;
            } else {
                this.x += this.driftVx;
                this.y += this.driftVy;
                this.x += Math.cos(this.wobbleAngle) * 0.2;
                this.y += Math.sin(this.wobbleAngle) * 0.2;

                this.colorBlend *= 0.96;
                this.size += (this.baseSize - this.size) * 0.05;
            }

            // Colors
            if (this.colorBlend > 0.02) {
                const s = this.saturation + this.colorBlend * 25;
                const l = this.lightness + this.colorBlend * 15;
                this.currentColor = `hsl(${this.hue}, ${s}%, ${l}%)`;
            } else {
                this.currentColor = this.baseColor;
            }

            if (this.x < -150 || this.x > footerCanvas.width + 150 ||
                this.y < -150 || this.y > footerCanvas.height + 150) {
                this.reset(true);
            }
        }

        draw() {
            if (this.opacity < 0.005) return;

            footerCtx.beginPath();
            footerCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            footerCtx.fillStyle = this.currentColor;
            footerCtx.globalAlpha = this.opacity;
            footerCtx.fill();

            if (this.colorBlend > 0.15 && this.size > 1.5) {
                footerCtx.beginPath();
                footerCtx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
                footerCtx.fillStyle = this.currentColor;
                footerCtx.globalAlpha = this.colorBlend * 0.06;
                footerCtx.fill();
            }
        }
    }

    function initFooterCanvas() {
        if(footerCanvas) {
            footerCanvas.width = window.innerWidth;
            footerCanvas.height = document.getElementById('contact').offsetHeight;
        }
    }

    window.addEventListener('resize', initFooterCanvas);

    function startFooterParticles() {
        if (footerAnimationStarted || !footerCanvas) return;
        footerAnimationStarted = true;
        initFooterCanvas();
        for (let i = 0; i < 120; i++) {
            footerParticles.push(new FooterParticle());
        }
        animateFooterParticles();
    }

    function animateFooterParticles() {
        footerCtx.clearRect(0, 0, footerCanvas.width, footerCanvas.height);
        footerParticles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateFooterParticles);
    }

    let footerCharIndex = 0;
    function typeFooterTitle() {
        if (footerCharIndex < footerTitleText.length) {
            const currentText = footerTitleText.substring(0, footerCharIndex + 1);
            footerTypingTitle.innerHTML = currentText.replace(/\n/g, '<br>') + '<span class="typing-cursor">|</span>';
            footerCharIndex++;
            setTimeout(typeFooterTitle, 60);
        } else {
            footerTypingTitle.innerHTML = footerTitleHTML; // Remove cursor to finish
            startFooterParticles(); // Trigger particles once typing is complete
            
            // Reveal footer actions and copyright reliably using inline styles
            const fadeElements = document.querySelectorAll('.footer-fade-in');
            fadeElements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.style.pointerEvents = 'auto';
                }, index * 200 + 100);
            });
        }
    }

    // Trigger typing when footer scrolls into view
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !footerHasTyped) {
                footerHasTyped = true;
                setTimeout(typeFooterTitle, 200); // Slight delay before typing
                footerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    
    if (footerTypingTitle && document.getElementById('contact')) {
        footerObserver.observe(document.getElementById('contact'));
    }

});
