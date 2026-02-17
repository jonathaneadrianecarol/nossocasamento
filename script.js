<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jonathan & Adriane | Nosso Casamento</title>
    <meta name="description"
        content="Junte-se a nós para celebrar o casamento de Jonathan e Adriane. Detalhes, história e RSVP.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>

<body>
    <nav class="navbar">
        <div class="container nav-container">
            <a href="#" class="logo">Jonathan & Adriane</a>
            <ul class="nav-links">
                <li><a href="#home">Início</a></li>
                <li><a href="#story">Nossa História</a></li>
                <li><a href="#details">Detalhes</a></li>
                <li><a href="#rsvp">RSVP</a></li>
            </ul>
            <div class="hamburger">
                <i data-lucide="menu"></i>
            </div>
        </div>
    </nav>

    <header id="home" class="hero">
        <video autoplay muted loop playsinline id="hero-video" poster="media/hero.png">
            <source src="media/video-casamento.mp4" type="video/mp4">
        </video>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <!-- <p class="pre-title">Nós vamos nos casar!</p> -->
            <!-- <h1 class="main-title">Jonathan & Adriane</h1> -->
            <!-- Deixei comentado caso queira voltar, mas o texto saiu como pediu -->
            <p class="date" style="margin-top: 20rem; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                Você é nosso convidado especial!
            </p>
            <a href="#rsvp" class="btn btn-primary">Confirmar Presença</a>
        </div>
    </header>

    <section id="welcome" class="section welcome">
        <div class="container welcome-container">
            <div class="welcome-text">
                <p>É com o coração cheio de alegria que convidamos vocês para o nosso grande dia! Depois do nosso
                    noivado em julho, o próximo passo é celebrar essa união e reunir quem sempre torceu pela nossa
                    felicidade.</p>
                <p>Chegamos até aqui, graças a Deus, e será uma honra ter vocês com a gente para brindar, celebrar e
                    marcar o início dessa nova etapa da nossa história.</p>
            </div>
            <div class="welcome-photo">
                <img src="media/dimequesi.png" alt="Nós dois" class="casual-photo">
            </div>
        </div>
    </section>

    <section id="story" class="section story">
        <div class="container">
            <h3 class="section-title">Nossa História em Fotos</h3>
            <div class="gallery-wrapper">
                <div class="gallery-scroll">
                    <!-- Adicione mais fotos aqui copiando a linha abaixo -->
                    <img src="images/galeria1.jpg" alt="Foto 1" class="gallery-img">
                    <img src="images/galeria2.jpg" alt="Foto 2" class="gallery-img">
                    <img src="images/galeria3.jpg" alt="Foto 3" class="gallery-img">
                    <img src="images/galeria4.jpg" alt="Foto 4" class="gallery-img">
                    <img src="images/galeria5.jpg" alt="Foto 5" class="gallery-img">
                    <img src="images/galeria6.jpg" alt="Foto 6" class="gallery-img">
                    <img src="images/galeria7.jpg" alt="Foto 7" class="gallery-img">
                    <img src="images/galeria8.jpg" alt="Foto 8" class="gallery-img">
                </div>
                <p class="scroll-hint">← Deslize para ver mais →</p>
            </div>
        </div>
    </section>

    <section id="details" class="section details">
        <div class="container">
            <h2 class="section-title">Quando & Onde</h2>
            <div class="details-grid">
                <div class="detail-card">
                    <i data-lucide="calendar" class="detail-icon"></i>
                    <h3>A Data</h3>
                    <p>Sábado, 10 de Outubro de 2026</p>
                    <p>Cerimônia às 16:00</p>
                </div>
                <div class="detail-card">
                    <i data-lucide="map-pin" class="detail-icon"></i>
                    <h3>O Local</h3>
                    <p><a href="https://www.instagram.com/espaco_ahmar/?hl=en" target="_blank"
                            style="color: inherit; text-decoration: underline;">Espaço Ah, Mar!</a></p>
                    <p>R. Praia de Arpoador, N°157 - Vilas do Atlântico</p>
                    <p>Lauro de Freitas - BA, 42708-090</p>
                    <p>Tel: (71) 99297-6167</p>
                    <div class="map-container" style="margin-top: 1rem; border-radius: 8px; overflow: hidden;">
                        <iframe width="100%" height="250" frameborder="0" scrolling="no" marginheight="0"
                            marginwidth="0"
                            src="https://maps.google.com/maps?q=Espa%C3%A7o%20Ah%2C%20Mar!%20R.%20Praia%20de%20Arpoador%2C%20N%C2%B0157%20-%20Vilas%20do%20Atl%C3%A2ntico%2C%20Lauro%20de%20Freitas%20-%20BA&t=&z=15&ie=UTF8&iwloc=&output=embed">
                        </iframe>
                    </div>
                </div>
                <div class="detail-card">
                    <i data-lucide="party-popper" class="detail-icon"></i>
                    <h3>A Recepção</h3>
                    <p>Jantar e festa a seguir</p>
                    <p>No mesmo local</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section quote-section">
        <div class="container">
            <blockquote>
                "O amor é composto por uma única alma habitando dois corpos."
                <footer>- Aristóteles</footer>
            </blockquote>
        </div>
    </section>

    <section id="rsvp" class="section rsvp">
        <div class="container">
            <h2 class="section-title">RSVP</h2>
            <p class="rsvp-text">Por favor, confirme sua presença até 10 de Setembro de 2026.</p>
            <form id="rsvp-form" class="rsvp-form">
                <div class="form-group">
                    <label for="name">Nome Completo</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="guests">Número de Convidados</label>
                    <select id="guests" name="guests">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="message">Mensagem (Opcional)</label>
                    <textarea id="message" name="message" rows="4"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Enviar Confirmação</button>
            </form>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>Feito com amor para Jonathan & Adriane</p>
            <p>&copy; 2026 Todos os direitos reservados.</p>
        </div>
    </footer>

    <script src="script.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>

</html>
