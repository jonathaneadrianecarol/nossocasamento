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

        // --- TIMELINE DE FOCO E ZOOM (ATIVO EM PC E CELULAR HORIZONTAL) ---
        // Ajusta o FOCO e o ZOOM da câmera quando a tela é Larga
        // zoom: 1 (Normal), 1.2 (20% maior), 1.5 (50% maior), etc.
        const timeline = [
            { start: 0, position: '50% 1%', zoom: 1 },    // Início: Normal
            { start: 22, position: '50% 5%', zoom: 2.9}    // 15s: Volta ao Normal
            { start: 25, position: '50% 50%', zoom: 0.4}    // 15s: Volta ao Normal
        ];

        function updateVideoFocus() {
            // Verifica se está em modo PAISAGEM (Horizontal) ou PC
            const isLandscape = window.innerWidth > window.innerHeight;

            if (isLandscape) {
                const currentTime = heroVideo.currentTime;
                const currentSetting = timeline.slice().reverse().find(item => item.start <= currentTime);

                if (currentSetting) {
                    // Aplica POSIÇÃO e ZOOM
                    heroVideo.style.objectPosition = currentSetting.position;
                    // Se não tiver zoom definido, usa 1 (padrão)
                    heroVideo.style.transform = `scale(${currentSetting.zoom || 1})`;
                }
            } else {
                // Modo RETRATO (Vertical):
                // Usa o padrão do CSS
                heroVideo.style.objectPosition = '';
                heroVideo.style.transform = ''; // Reseta o zoom no celular em pé
            }
        }

        // Executa a cada atualização de tempo do vídeo
        heroVideo.addEventListener('timeupdate', updateVideoFocus);

        // Garante que atualiza ao girar a tela
        window.addEventListener('resize', updateVideoFocus);
    }
});
