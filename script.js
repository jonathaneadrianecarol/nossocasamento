document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // Simple toggle for demonstration. 
            // In a real app, we'd toggle a class to show/hide with CSS transitions
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'white';
                navLinks.style.padding = '2rem';
                navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            }
        });
    }

    // RSVP Form Handling
    const form = document.getElementById('rsvp-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Obrigado, ${name}! Sua presença foi confirmada. Mal podemos esperar para celebrar com você!`);
            form.reset();
        });
    }

    /* 
       CONTROLE DO VÍDEO DE FUNDO 
       --------------------------
       Agora usamos apenas um vídeo unificado: 'video-casamento.mp4'
       A reprodução e o loop são automáticos via HTML.
    */
    const heroVideo = document.getElementById('hero-video');

    if (heroVideo) {
        heroVideo.playbackRate = 1.0;

        // --- TIMELINE SIMPLES (SÓ PARA HORIZONTAL/PC) ---
        // 0s: Foca no TETO/CÉU (Top)
        // 10s: Volta para o MEIO (Center)
        const timeline = [
            { start: 0, position: '50% 15%' },   // Começa mostrando o topo
            { start: 10, position: '50% 50%' }  // Aos 10s centraliza
        ];

        function updateVideoFocus() {
            // Verifica se é Horizontal/PC (Largura > Altura)
            const isLandscape = window.innerWidth > window.innerHeight;

            if (isLandscape) {
                const currentTime = heroVideo.currentTime;
                const currentSetting = timeline.slice().reverse().find(item => item.start <= currentTime);

                if (currentSetting) {
                    heroVideo.style.objectPosition = currentSetting.position;
                }
            } else {
                // Celular em pé: Usa o padrão do CSS
                heroVideo.style.objectPosition = '';
            }
        }

        heroVideo.addEventListener('timeupdate', updateVideoFocus);
        window.addEventListener('resize', updateVideoFocus);
    }

    // --- CONTAGEM REGRESSIVA ---
    // Data do Casamento: 10 de Outubro de 2026 às 15:00
    const countdownDate = new Date("Oct 10, 2026 15:00:00").getTime();

    const updateCountdown = setInterval(function () {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const d = document.getElementById("days");
        const h = document.getElementById("hours");
        const m = document.getElementById("minutes");
        const s = document.getElementById("seconds");

        if (d && h && m && s) {
            d.innerText = days < 10 ? "0" + days : days;
            h.innerText = hours < 10 ? "0" + hours : hours;
            m.innerText = minutes < 10 ? "0" + minutes : minutes;
            s.innerText = seconds < 10 ? "0" + seconds : seconds;
        }

        if (distance < 0) {
            clearInterval(updateCountdown);
            const countdownContainer = document.getElementById("countdown");
            if (countdownContainer) {
                countdownContainer.innerHTML = "<h2>Chegou o grande dia!</h2>";
            }
        }
    }, 1000);
    // --- MUSIC CONTROL ---
    const musicControl = document.getElementById('music-control');
    const bgMusic = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    const musicHint = document.getElementById('music-hint');
    let isPlaying = false;

    if (musicControl && bgMusic && musicIcon) {
        musicControl.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicIcon.setAttribute('data-lucide', 'volume-x'); // Mute icon
                musicControl.classList.remove('playing');
                isPlaying = false;
            } else {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicIcon.setAttribute('data-lucide', 'volume-2'); // Sound ON icon
                    musicControl.classList.add('playing');
                    lucide.createIcons();
                }).catch(error => {
                    console.log("Playback failed:", error);
                });
            }
            setTimeout(() => {
                lucide.createIcons();
            }, 50);
        });

        // Hide music hint on scroll (Starts visible, hides after scroll)
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100 && musicHint) {
                musicHint.classList.add('hidden');
            }
        });

        // Optional: Try to auto-play on first interaction
        document.body.addEventListener('click', function firstClick() {
            if (!isPlaying) {
                // Remove listener immediately to avoid multiple triggers
                document.body.removeEventListener('click', firstClick);

                // Attempt play
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicIcon.setAttribute('data-lucide', 'volume-2');
                    musicControl.classList.add('playing');
                    lucide.createIcons();
                }).catch(error => {
                    // Auto-play might be blocked, user must click manually
                    console.log("Auto-play blocked, waiting for user interaction on button.");
                });
            }
        }, { once: true });
    }

    // --- SCROLL DOWN INDICATOR ---
    const scrollDownBtn = document.querySelector('.scroll-down');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', () => {
            const nextSection = document.getElementById('welcome');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- BACK TO TOP BUTTON ---
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            // Show only when near the bottom/footer or significantly scrolled (e.g., > 1200px)
            if (window.scrollY > 1200) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
