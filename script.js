// script.js

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

    // --- RSVP FORM HANDLING (ROBUSTO) ---
    const form = document.getElementById('rsvp-form');

    if (form) {
        const btnSubmit = document.getElementById('btn-submit');
        const formStatus = document.getElementById('form-status');
        const lang = (document.documentElement.lang || 'pt-BR').toLowerCase();

        const isSpanish = lang.startsWith('es');

        const messages = isSpanish ? {
            sending: 'Enviando...',
            success: firstName => `Gracias, ${firstName}. Tu confirmación fue enviada correctamente.`,
            successDetail: 'Si no recibimos el correo, ya tendremos al menos más datos de rastreo del envío.',
            genericError: 'No fue posible enviar la confirmación. Inténtalo nuevamente en unos minutos.',
            networkError: 'Error de conexión. Verifica tu internet y vuelve a intentarlo.',
            invalidResponse: 'El servicio respondió de forma inesperada. Inténtalo nuevamente.',
            button: 'Enviar Confirmación'
        } : {
            sending: 'Enviando...',
            success: firstName => `Obrigado, ${firstName}. Sua confirmação foi enviada com sucesso.`,
            successDetail: 'Se o e-mail não chegar, pelo menos o envio terá mais dados de rastreio.',
            genericError: 'Não foi possível enviar a confirmação. Tente novamente em alguns minutos.',
            networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
            invalidResponse: 'O serviço respondeu de forma inesperada. Tente novamente.',
            button: 'Enviar Confirmação'
        };

        const setStatus = (text, type = 'info') => {
            if (!formStatus) return;
            formStatus.textContent = text;
            formStatus.style.color =
                type === 'success' ? '#2e7d32' :
                type === 'error' ? '#c62828' :
                '#555';
        };

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!btnSubmit || btnSubmit.disabled) return;

            const fullName = (document.getElementById('name')?.value || '').trim();
            const firstName = fullName ? fullName.split(' ')[0] : (isSpanish ? 'invitado' : 'convidado');

            const submittedAtInput = document.getElementById('submitted_at');
            const pageUrlInput = document.getElementById('page_url');
            const userAgentInput = document.getElementById('user_agent');

            if (submittedAtInput) submittedAtInput.value = new Date().toISOString();
            if (pageUrlInput) pageUrlInput.value = window.location.href;
            if (userAgentInput) userAgentInput.value = navigator.userAgent;

            btnSubmit.innerText = messages.sending;
            btnSubmit.disabled = true;
            setStatus('');

            const formData = new FormData(form);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const contentType = response.headers.get('content-type') || '';
                let data = null;

                if (contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        throw new Error(messages.invalidResponse);
                    }
                }

                if (!response.ok) {
                    const serverMessage =
                        data && typeof data === 'object' && data.message
                            ? data.message
                            : messages.genericError;
                    throw new Error(serverMessage);
                }

                setStatus(`${messages.success(firstName)} ${messages.successDetail}`, 'success');
                form.reset();
            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    setStatus(messages.networkError, 'error');
                } else {
                    setStatus(error.message || messages.genericError, 'error');
                }

                console.error('RSVP error:', error);
            } finally {
                btnSubmit.innerText = messages.button;
                btnSubmit.disabled = false;
            }
        });
    }

    /* CONTROLE DO VÍDEO DE FUNDO */
    const heroVideo = document.getElementById('hero-video');

    if (heroVideo) {
        heroVideo.playbackRate = 1.0;

        const timeline = [
            { start: 0, position: '50% 15%' },
            { start: 10, position: '50% 50%' }
        ];

        function updateVideoFocus() {
            const isLandscape = window.innerWidth > window.innerHeight;

            if (isLandscape) {
                const currentTime = heroVideo.currentTime;
                const currentSetting = timeline.slice().reverse().find(item => item.start <= currentTime);

                if (currentSetting) {
                    heroVideo.style.objectPosition = currentSetting.position;
                }
            } else {
                heroVideo.style.objectPosition = '';
            }
        }

        heroVideo.addEventListener('timeupdate', updateVideoFocus);
        window.addEventListener('resize', updateVideoFocus);
    }

    // --- CONTAGEM REGRESSIVA / CUENTA REGRESIVA ---
    const countdownDate = new Date("Oct 10, 2026 15:00:00").getTime();
    const pageLang = (document.documentElement.lang || 'pt-BR').toLowerCase();
    const countdownFinishedText = pageLang.startsWith('es')
        ? '<h2>¡Llegó el gran día!</h2>'
        : '<h2>Chegou o grande dia!</h2>';

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
                countdownContainer.innerHTML = countdownFinishedText;
            }
        }
    }, 1000);

    // --- RANDOM PLAYLIST CONTROL ---
    const musicWrapper = document.querySelector('.music-wrapper');
    const musicControl = document.getElementById('music-control');
    const musicNext = document.getElementById('music-next');
    const bgMusic = document.getElementById('bg-music');
    const trackTitle = document.getElementById('music-track-title');
    const trackArtist = document.getElementById('music-track-artist');

    const playlist = [
        { file: '1.mp3', title: 'Várias Queixas', artist: 'Gilsons' },
        { file: '2.mp3', title: 'Cafecito', artist: 'La Ciencia de Juancho Valencia' },
        { file: '3.mp3', title: 'Dime Que Sí', artist: 'Los Rumberos' },
        { file: '4.mp3', title: 'Me Abraça', artist: 'Banda Eva' },
        { file: '5.mp3', title: 'Ella Es Mi Todo', artist: 'Kaleth Morales' },
        { file: '6.mp3', title: 'Partilhar', artist: 'Rubel' },
        { file: '7.mp3', title: 'Canoita', artist: 'La Pacifican Power' },
        { file: '8.mp3', title: 'Chocolate', artist: 'Profetas' },
        { file: '9.mp3', title: 'Piloto', artist: 'Flora Matos' },
        { file: '10.mp3', title: 'Veludo Marrom', artist: 'Liniker' },
        { file: '11.mp3', title: 'Busca Por Dentro', artist: 'Grupo Niche' }
    ];

    let shuffledQueue = [];
    let currentTrackIndex = null;
    let isPlaying = false;

    function shuffle(items) {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }
        return shuffled;
    }

    function refillQueue() {
        const indexes = playlist.map((_, index) => index);
        const withoutCurrent = currentTrackIndex === null
            ? indexes
            : indexes.filter(index => index !== currentTrackIndex);

        shuffledQueue = shuffle(withoutCurrent);
        if (currentTrackIndex !== null) {
            shuffledQueue.push(currentTrackIndex);
        }
    }

    function updateMusicIcon(playing) {
        if (!musicControl) return;
        const iconName = playing ? 'volume-2' : 'volume-x';
        musicControl.innerHTML = `<i data-lucide="${iconName}" id="music-icon"></i>`;
        musicControl.classList.toggle('playing', playing);
        lucide.createIcons();
    }

    function updateTrackInformation(track) {
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
    }

    function playCurrentTrack() {
        if (!bgMusic) return;
        bgMusic.play().catch(error => {
            console.log('Playback failed:', error);
        });
    }

    function loadNextTrack(shouldPlay = false) {
        if (!bgMusic || !musicWrapper || playlist.length === 0) return;
        if (shuffledQueue.length === 0) refillQueue();

        currentTrackIndex = shuffledQueue.shift();
        const track = playlist[currentTrackIndex];
        const playlistBase = musicWrapper.dataset.playlistBase || 'media/playlist/';

        bgMusic.src = `${playlistBase}${track.file}`;
        bgMusic.load();
        updateTrackInformation(track);

        if (shouldPlay) playCurrentTrack();
    }

    if (musicWrapper && musicControl && musicNext && bgMusic) {
        loadNextTrack(false);

        musicControl.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
            } else {
                playCurrentTrack();
            }
        });

        musicNext.addEventListener('click', () => {
            loadNextTrack(true);
        });

        bgMusic.addEventListener('play', () => {
            isPlaying = true;
            updateMusicIcon(true);
        });

        bgMusic.addEventListener('pause', () => {
            isPlaying = false;
            updateMusicIcon(false);
        });

        bgMusic.addEventListener('ended', () => {
            loadNextTrack(true);
        });

        document.body.addEventListener('click', function firstInteraction(event) {
            if (!event.target.closest('.music-controls') && bgMusic.paused) {
                playCurrentTrack();
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
