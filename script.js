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

    // --- RSVP FORM HANDLING (ATUALIZADO) ---
    const form = document.getElementById('rsvp-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o redirecionamento padrão
            
            const btnSubmit = document.getElementById('btn-submit');
            const originalText = btnSubmit.innerText;
            
            // 1. Feedback visual: Botão muda para "Enviando..."
            btnSubmit.innerText = 'Enviando...';
            btnSubmit.disabled = true;

            // 2. Coleta os dados
            const formData = new FormData(form);
            const fullName = document.getElementById('name').value;
            
            // Pega apenas o primeiro nome para a mensagem (Ex: "Jonathan Campo" -> "Jonathan")
            const firstName = fullName.split(' ')[0];

            // 3. Envia para o Formsubmit via Fetch (AJAX)
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Garante resposta limpa sem redirecionar
                }
            })
            .then(response => {
                if (response.ok) {
                    // SUCESSO!
                    alert(`Obrigado, ${firstName}! Sua presença foi confirmada. Mal podemos esperar para celebrar com você!`);
                    form.reset(); // Limpa o formulário
                } else {
                    // ERRO DO SERVIDOR (Ex: Spam detection)
                    return response.json().then(data => {
                        if (data.message) {
                            alert("Erro: " + data.message);
                        } else {
                            alert("Ops! Houve um erro ao enviar. Tente novamente.");
                        }
                    });
                }
            })
            .catch(error => {
                // ERRO DE CONEXÃO
                console.error('Erro:', error);
                alert("Erro de conexão. Verifique sua internet ou se o e-mail no código está ativado.");
            })
            .finally(() => {
                // Restaura o botão ao estado original
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            });
        });
    }

    /* CONTROLE DO VÍDEO DE FUNDO 
       --------------------------
    */
    const heroVideo = document.getElementById('hero-video');

    if (heroVideo) {
        heroVideo.playbackRate = 1.0;

        // Timeline para PC/Horizontal
        const timeline = [
            { start: 0, position: '50% 15%' },  // Topo
            { start: 10, position: '50% 50%' }  // Centro
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

    // --- CONTAGEM REGRESSIVA ---
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
