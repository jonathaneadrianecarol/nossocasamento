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

        // --- TIMELINE DE FOCO E ZOOM (ATIVO APENAS EM CELULAR VERTICAL) ---
        // Ajusta o foco e zoom quando o celular está EM PÉ
        // position: '50%' (Meio), '20%' (Esquerda), '80%' (Direita)
        // zoom: 1 (Normal), 1.2 (Mais perto), etc.
        const timeline = [
            { start: 0, position: '50% center', zoom: 1 },    // Início: Normal
            { start: 25, position: '20% center', zoom: 0.8},  // 5s: Zoom na ESQUERDA
            { start: 27, position: '80% center', zoom: 0.8 }, // 10s: Zoom na DIREITA
            { start: 28, position: '50% center', zoom: 1 }    // 15s: Volta ao Normal
        ];

        function updateVideoFocus() {
            // Verifica se está em modo RETRATO (Vertical)
            // Altura maior que Largura
            const isPortrait = window.innerHeight > window.innerWidth;

            if (isPortrait) {
                const currentTime = heroVideo.currentTime;
                const currentSetting = timeline.slice().reverse().find(item => item.start <= currentTime);

                if (currentSetting) {
                    heroVideo.style.objectPosition = currentSetting.position;
                    heroVideo.style.transform = `scale(${currentSetting.zoom || 1})`;
                }
            } else {
                // Modo PAISAGEM (Horizontal) ou PC:
                // Limpa tudo para usar o padrão
                heroVideo.style.objectPosition = '';
                heroVideo.style.transform = '';
            }
        }

        heroVideo.addEventListener('timeupdate', updateVideoFocus);
        window.addEventListener('resize', updateVideoFocus);

        // Garante que atualiza ao girar a tela
        window.addEventListener('resize', updateVideoFocus);
    }
});
