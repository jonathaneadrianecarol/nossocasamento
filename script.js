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

    // --- CONFIRMAÇÃO DE PRESENÇA E MENSAGENS ---
    const language = (document.documentElement.lang || 'pt-BR').toLowerCase();
    const isSpanish = language.startsWith('es');
    const choiceButtons = document.querySelectorAll('[data-rsvp-choice]');
    const choicePanels = {
        yes: document.getElementById('rsvp-yes-panel'),
        no: document.getElementById('rsvp-no-panel')
    };

    choiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedChoice = button.dataset.rsvpChoice;

            choiceButtons.forEach(option => {
                const isSelected = option === button;
                option.classList.toggle('is-selected', isSelected);
                option.setAttribute('aria-expanded', String(isSelected));
            });

            Object.entries(choicePanels).forEach(([choice, panel]) => {
                if (panel) panel.hidden = choice !== selectedChoice;
            });

            const selectedPanel = choicePanels[selectedChoice];
            if (selectedPanel) {
                window.setTimeout(() => {
                    selectedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
            }
        });
    });

    const formMessages = isSpanish ? {
        sending: 'Enviando...',
        rsvpSuccess: firstName => `Gracias, ${firstName}. Tu confirmación fue enviada correctamente.`,
        messageSuccess: firstName => `Gracias, ${firstName}. Tu mensaje fue enviado con cariño.`,
        genericError: 'No fue posible enviar el formulario. Inténtalo nuevamente en unos minutos.',
        networkError: 'Error de conexión. Verifica tu internet y vuelve a intentarlo.',
        invalidResponse: 'El servicio respondió de forma inesperada. Inténtalo nuevamente.'
    } : {
        sending: 'Enviando...',
        rsvpSuccess: firstName => `Obrigado, ${firstName}. Sua confirmação foi enviada com sucesso.`,
        messageSuccess: firstName => `Obrigado, ${firstName}. Sua mensagem foi enviada com carinho.`,
        genericError: 'Não foi possível enviar o formulário. Tente novamente em alguns minutos.',
        networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
        invalidResponse: 'O serviço respondeu de forma inesperada. Tente novamente.'
    };

    document.querySelectorAll('.ajax-form').forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        const formStatus = form.querySelector('.form-status');
        const originalButtonText = submitButton?.textContent.trim() || '';

        const setStatus = (text, type = 'info') => {
            if (!formStatus) return;
            formStatus.textContent = text;
            formStatus.style.color =
                type === 'success' ? '#2e7d32' :
                type === 'error' ? '#c62828' :
                '#555';
        };

        form.addEventListener('submit', async event => {
            event.preventDefault();

            if (!submitButton || submitButton.disabled) return;

            const fullName = (form.querySelector('[name="name"]')?.value || '').trim();
            const firstName = fullName ? fullName.split(' ')[0] : (isSpanish ? 'invitado' : 'convidado');
            const submittedAtInput = form.querySelector('[name="submitted_at"]');
            const pageUrlInput = form.querySelector('[name="page_url"]');
            const userAgentInput = form.querySelector('[name="user_agent"]');

            if (submittedAtInput) submittedAtInput.value = new Date().toISOString();
            if (pageUrlInput) pageUrlInput.value = window.location.href;
            if (userAgentInput) userAgentInput.value = navigator.userAgent;

            submitButton.textContent = formMessages.sending;
            submitButton.disabled = true;
            setStatus('');

            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });

                const contentType = response.headers.get('content-type') || '';
                let data = null;

                if (contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        throw new Error(formMessages.invalidResponse);
                    }
                }

                if (!response.ok) {
                    const serverMessage = data && typeof data === 'object' && data.message
                        ? data.message
                        : formMessages.genericError;
                    throw new Error(serverMessage);
                }

                const successMessage = form.dataset.formKind === 'message'
                    ? formMessages.messageSuccess(firstName)
                    : formMessages.rsvpSuccess(firstName);
                setStatus(successMessage, 'success');
                form.reset();
            } catch (error) {
                const errorMessage = error.name === 'AbortError'
                    ? formMessages.networkError
                    : (error.message || formMessages.genericError);
                setStatus(errorMessage, 'error');
                console.error('Form submission error:', error);
            } finally {
                window.clearTimeout(timeoutId);
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    });

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
    const musicHintMessage = document.querySelector('.music-hint-message');
    const musicStorageKey = 'jonathanAdrianeMusicStateV3';
    const musicStartedKey = 'jonathanAdrianeMusicStartedV1';

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
    let isLeavingPage = false;
    let lastSavedSecond = -1;

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
        if (window.lucide) lucide.createIcons();
    }

    function updateTrackInformation(track) {
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
    }

    function readMusicState() {
        try {
            const savedState = JSON.parse(sessionStorage.getItem(musicStorageKey) || 'null');
            const isValidTrack = Number.isInteger(savedState?.trackIndex)
                && savedState.trackIndex >= 0
                && savedState.trackIndex < playlist.length;
            const isRecentState = Number.isFinite(savedState?.updatedAt)
                && Date.now() - savedState.updatedAt < 6 * 60 * 60 * 1000;

            if (!isValidTrack || !isRecentState) return null;

            return {
                trackIndex: savedState.trackIndex,
                currentTime: Number.isFinite(savedState.currentTime) ? Math.max(0, savedState.currentTime) : 0,
                wasPlaying: savedState.wasPlaying === true
            };
        } catch (error) {
            return null;
        }
    }

    function saveMusicState(playing = isPlaying) {
        if (!bgMusic || currentTrackIndex === null) return;

        try {
            sessionStorage.setItem(musicStorageKey, JSON.stringify({
                trackIndex: currentTrackIndex,
                currentTime: Number.isFinite(bgMusic.currentTime) ? bgMusic.currentTime : 0,
                wasPlaying: playing,
                updatedAt: Date.now()
            }));
        } catch (error) {
            // The player still works when browser storage is unavailable.
        }
    }

    function hasMusicStarted() {
        try {
            return sessionStorage.getItem(musicStartedKey) === 'true';
        } catch (error) {
            return false;
        }
    }

    function markMusicStarted() {
        try {
            sessionStorage.setItem(musicStartedKey, 'true');
        } catch (error) {
            // The player still works when browser storage is unavailable.
        }
    }

    function playCurrentTrack() {
        if (!bgMusic) return;
        bgMusic.play()
            .then(markMusicStarted)
            .catch(error => {
                console.log('Playback failed:', error);
                isPlaying = false;
                updateMusicIcon(false);
                if (musicHintMessage) {
                    musicHintMessage.textContent = isSpanish
                        ? 'Toca el botón para continuar la música 🎶'
                        : 'Toque no botão para continuar a música 🎶';
                }
            });
    }

    function loadTrack(trackIndex, shouldPlay = false, startTime = 0) {
        if (!bgMusic || !musicWrapper || playlist.length === 0) return;
        currentTrackIndex = trackIndex;
        const track = playlist[currentTrackIndex];
        const playlistBase = musicWrapper.dataset.playlistBase || 'media/playlist/';

        bgMusic.autoplay = shouldPlay;
        bgMusic.src = `${playlistBase}${track.file}`;
        updateTrackInformation(track);

        const continueFromSavedPoint = () => {
            const beginPlayback = () => {
                if (shouldPlay) playCurrentTrack();
            };

            if (startTime <= 0.25) {
                beginPlayback();
                return;
            }

            const maximumTime = Number.isFinite(bgMusic.duration)
                ? Math.max(0, bgMusic.duration - 0.25)
                : startTime;
            const savedTime = Math.min(startTime, maximumTime);
            let seekFinished = false;

            const finishSeek = () => {
                if (seekFinished) return;
                seekFinished = true;
                beginPlayback();
            };

            bgMusic.addEventListener('seeked', finishSeek, { once: true });
            bgMusic.currentTime = savedTime;
            window.setTimeout(finishSeek, 1200);
        };

        bgMusic.addEventListener('loadedmetadata', continueFromSavedPoint, { once: true });
        bgMusic.load();
    }

    function loadNextTrack(shouldPlay = false) {
        if (!bgMusic || !musicWrapper || playlist.length === 0) return;
        if (shuffledQueue.length === 0) refillQueue();
        loadTrack(shuffledQueue.shift(), shouldPlay, 0);
    }

    if (musicWrapper && musicControl && musicNext && bgMusic) {
        const savedMusicState = readMusicState();
        const musicWasStarted = hasMusicStarted();
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        const pageWasReloaded = navigationEntry?.type === 'reload'
            || (performance.navigation && performance.navigation.type === 1);

        if (pageWasReloaded) {
            currentTrackIndex = savedMusicState?.trackIndex ?? null;

            try {
                sessionStorage.removeItem(musicStorageKey);
            } catch (error) {
                // The player still works when browser storage is unavailable.
            }

            loadNextTrack(musicWasStarted);
        } else if (savedMusicState) {
            loadTrack(savedMusicState.trackIndex, musicWasStarted || savedMusicState.wasPlaying, savedMusicState.currentTime);
        } else {
            loadNextTrack(musicWasStarted);
        }

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
            saveMusicState(true);
        });

        bgMusic.addEventListener('pause', () => {
            if (isLeavingPage) return;
            isPlaying = false;
            updateMusicIcon(false);
            saveMusicState(false);
        });

        bgMusic.addEventListener('timeupdate', () => {
            const currentSecond = Math.floor(bgMusic.currentTime);
            if (currentSecond !== lastSavedSecond) {
                lastSavedSecond = currentSecond;
                saveMusicState(isPlaying);
            }
        });

        bgMusic.addEventListener('ended', () => {
            loadNextTrack(true);
        });

        document.body.addEventListener('click', function firstInteraction(event) {
            if (!event.target.closest('.music-controls') && bgMusic.paused) {
                playCurrentTrack();
            }
        }, { once: true });

        const preserveMusicBeforeLeaving = (resumeOnNextPage = isPlaying) => {
            if (isLeavingPage) return;
            saveMusicState(resumeOnNextPage);
            isLeavingPage = true;
        };

        document.addEventListener('click', event => {
            const link = event.target.closest('a[href]');
            if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

            try {
                const destination = new URL(link.href, window.location.href);
                const staysOnCurrentDocument = destination.origin === window.location.origin
                    && destination.pathname === window.location.pathname
                    && destination.search === window.location.search;

                if (destination.origin === window.location.origin && !staysOnCurrentDocument) {
                    markMusicStarted();
                    if (bgMusic.paused) playCurrentTrack();
                    preserveMusicBeforeLeaving(true);
                }
            } catch (error) {
                // Invalid or non-navigation links do not affect the music state.
            }
        }, { capture: true });

        window.addEventListener('beforeunload', () => preserveMusicBeforeLeaving());
        window.addEventListener('pagehide', () => preserveMusicBeforeLeaving());
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
