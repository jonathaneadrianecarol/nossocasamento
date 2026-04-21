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
                musicIcon.setAttribute('data-lucide', 'volume-x');
                musicControl.classList.remove('playing');
                isPlaying = false;
            } else {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicIcon.setAttribute('data-lucide', 'volume-2');
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

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100 && musicHint) {
                musicHint.classList.add('hidden');
            }
        });

        document.body.addEventListener('click', function firstClick() {
            if (!isPlaying) {
                document.body.removeEventListener('click', firstClick);
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicIcon.setAttribute('data-lucide', 'volume-2');
                    musicControl.classList.add('playing');
                    lucide.createIcons();
                }).catch(error => {
                    console.log("Auto-play blocked, waiting for user interaction.");
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
