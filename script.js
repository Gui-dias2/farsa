/* =====================================================
   FARSA DE INÊS PEREIRA – CENA VI
   script.js
   ===================================================== */

const MUSIC_SRC      = 'assets/audio/musica.mp3';
const MUSIC_VOLUME   = 0.45;
const MUSIC_LOOP     = true;
const MUSIC_AUTOPLAY = true;

let currentSlide       = 0;
let slideTransitioning = false;
let charIndex          = -1;
let boardErased        = false;
let bookFlipped        = false;
let s9TopicsRevealed   = 0;
let creditsStarted     = false;

const SLIDE_IDS = [
    'slide-0','slide-1','slide-2','slide-3','slide-4',
    'slide-5','slide-6','slide-7','slide-8','slide-9','slide-final'
];

const CHARACTERS = [
    {
        name: 'Inês Pereira',
        desc: 'Protagonista da obra. Jovem de condição modesta que deseja liberdade. Caracterizada como vaidosa, ambiciosa e sonhadora, na Cena VI, revela-se como arrependida e matura. Aprende com o seu erro.  "A experiência dá lição." Deseja controlar o marido, e usa o casamento como segurança.',
        traits: ['Protagonista','Vaidosa','Arrependida','Pragmática','Controladora','Revela o desejo de controlo']
    },
    {
        name: 'Lianor Vaz',
        desc: 'Amiga e conselheira de Inês. Alcoviteira / intermediária social mais velha, representa o senso comum e a voz da razão e da sabedoria popular. Pressiona Inês a casar novamente com Pero Marques, orientando até a cerimónia. Representa o pragmatismo popular.',
        traits: ['Conselheira','Pragmática','Sábia','Crítica',"Minimiza o  valor do luto","defende casamento como proteção","mediadora social."]
    },
    {
        name: 'Pero Marques',
        desc: 'Filho de um Lavrador rico, é simples, honesto e alvo do desprezo inicial de Inês. Representa o povo comum: trabalhador e bom. Ingénuo e submisso — não sabe os votos, pergunta se há trigo para deitar por cima, e no final aceita tudo o que Inês quiser.É controlável e alheado.',
        traits: ['Simples','Honesto','Humilde','Povo','Submisso','Fácil de controlar',"Alheado","Personagem cómica","Simboliza o casamento funcional (não apenas o romântico)"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setupKeyboard();
    showSlide(0);
});

function createStars() {
    const container = document.getElementById('splash-stars');
    if (!container) return;
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${2+Math.random()*3}s;--op:${0.3+Math.random()*0.7};animation-delay:${Math.random()*3}s;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;`;
        container.appendChild(star);
    }
}

/* ── NAVEGAÇÃO ── */

function goToSlide(index) {
    if (slideTransitioning) return;
    if (index < 0 || index >= SLIDE_IDS.length) return;
    const prevEl = document.getElementById(SLIDE_IDS[currentSlide]);
    const nextEl = document.getElementById(SLIDE_IDS[index]);
    if (!prevEl || !nextEl) return;
    slideTransitioning = true;
    prevEl.classList.remove('active');
    prevEl.classList.add('exit');
    nextEl.classList.add('active');
    setTimeout(() => { prevEl.classList.remove('exit'); slideTransitioning = false; }, 900);
    currentSlide = index;
    onSlideEnter(index);
}

function advance() {
    if (currentSlide === 1) { triggerCloudsClosure(); return; }

    // Slide 3 – primeiro W vira folha, segundo avança
    if (currentSlide === 3) {
        if (!bookFlipped) {
            const flip = document.getElementById('page-flip');
            if (flip) flip.classList.add('flipped');
            bookFlipped = true;
            return;
        }
    }

    if (currentSlide === 6) {
        charIndex++;
        if (charIndex < CHARACTERS.length) { showCharacter(charIndex); return; }
        else { charIndex = -1; goToSlide(currentSlide + 1); return; }
    }
    if (currentSlide === 7) { triggerCloudsTransition7to8(); return; }
    if (currentSlide === 8) { if (!boardErased) { eraseBoard(); return; } }
    if (currentSlide === 9) { if (revealNextSatiraTopic()) return; }

    goToSlide(currentSlide + 1);
}

function goBack() {
    if (currentSlide === 0) return;
    showNotification('Voltaste atrás');
    if (currentSlide === 3) {
        bookFlipped = false;
        const flip = document.getElementById('page-flip');
        if (flip) flip.classList.remove('flipped');
    }
    if (currentSlide === 6) { charIndex = -1; resetCharacterView(); }
    if (currentSlide === 8) { boardErased = false; initBoardSlide(); }
    if (currentSlide === 9) { s9TopicsRevealed = 0; initSatiraSlide(); }
    if (currentSlide === 10) { creditsStarted = false; }
    goToSlide(currentSlide - 1);
}

/* ── TECLADO ── */

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'w': case 'W': case 'ArrowRight': case 'ArrowUp':
                e.preventDefault(); advance(); break;
            case 's': case 'S': case 'ArrowLeft': case 'ArrowDown':
                e.preventDefault(); goBack(); break;
            case 'p': case 'P':
                if (currentSlide >= 3 && currentSlide <= 5) { e.preventDefault(); closeBook(); }
                break;
        }
    });
}

function closeBook() { goToSlide(2); showNotification('Livro fechado'); }

/* ── ENTRAR EM CADA SLIDE ── */

function onSlideEnter(index) {
    switch(index) {
        case 1: initCloudsSlide(); break;
        case 2: break;
        case 3: initOpenBook(); break;
        case 6: initCharactersSlide(); break;
        case 8: initBoardSlide(); break;
        case 9: initSatiraSlide(); break;
        case 10: initCreditsSlide(); break;
    }

    const navHint = document.getElementById('nav-hint');
    if (navHint) {
        const inBook = index >= 3 && index <= 5;
        if (index >= 1 && index < 10) {
            navHint.classList.remove('hidden');
            navHint.innerHTML = `<span><kbd>W</kbd> / <kbd>→</kbd> Avançar</span><span><kbd>S</kbd> / <kbd>←</kbd> Recuar</span>${inBook ? '<span><kbd>P</kbd> Fechar livro</span>' : ''}`;
        } else {
            navHint.classList.add('hidden');
        }
    }

    const toolbar = document.querySelector('.reading-toolbar');
    if (toolbar) toolbar.style.display = index === 5 ? 'flex' : 'none';
}

function showSlide(index) {
    const el = document.getElementById(SLIDE_IDS[index]);
    if (el) el.classList.add('active');
    currentSlide = index;
    onSlideEnter(index);
}

/* ── SLIDE 0 ── */
function startExperience() {
    try { document.documentElement.requestFullscreen?.(); } catch(e) {}
    goToSlide(1);
}

/* ── SLIDE 1 – NUVENS ── */
function initCloudsSlide() {
    const layer = document.getElementById('clouds-layer');
    if (layer) layer.classList.remove('clouds-closing');
    const text = document.getElementById('clouds-text');
    if (text) { text.style.opacity = '1'; text.style.transition = ''; }
}

function triggerCloudsClosure() {
    const layer = document.getElementById('clouds-layer');
    const text  = document.getElementById('clouds-text');
    if (!layer) return;
    if (text) { text.style.opacity = '0'; text.style.transition = 'opacity 0.5s'; }
    layer.classList.add('clouds-closing');
    setTimeout(() => {
        goToSlide(2);
        setTimeout(() => {
            layer.classList.remove('clouds-closing');
            if (text) { text.style.opacity = '1'; }
        }, 1000);
    }, 1800);
}

/* ── SLIDE 3 – LIVRO ABRE ── */
function initOpenBook() {
    const flip = document.getElementById('page-flip');
    if (!flip) return;
    flip.classList.remove('flipped');
    bookFlipped = false;
}

/* ── SLIDE 5 – FERRAMENTAS ── */
let fontSize = 0.93;
function zoomIn()  { fontSize = Math.min(fontSize + 0.1, 1.5); applyFontSize(); }
function zoomOut() { fontSize = Math.max(fontSize - 0.1, 0.7); applyFontSize(); }
function applyFontSize() { const dt = document.getElementById('drama-text'); if (dt) dt.style.fontSize = fontSize + 'rem'; }
function toggleNightMode()  { document.body.classList.toggle('night-mode');    document.getElementById('night-btn')?.classList.toggle('active'); }
function toggleSpacing()    { document.body.classList.toggle('extra-spacing'); document.getElementById('spacing-btn')?.classList.toggle('active'); }
function toggleHighlight()  { document.body.classList.toggle('highlight-mode');document.getElementById('highlight-btn')?.classList.toggle('active'); }

/* ── SLIDE 6 – PERSONAGENS ── */
function initCharactersSlide() {
    charIndex = -1;
    resetCharacterView();
    document.getElementById('char-infobox')?.classList.add('hidden');
    document.getElementById('spotlight')?.classList.remove('on');
}

function showCharacter(idx) {
    document.querySelectorAll('.char-cloud').forEach((c, i) => {
        c.classList.remove('focused','dimmed');
        c.classList.add(i === idx ? 'focused' : 'dimmed');
    });
    const sp = document.getElementById('spotlight');
    const positions = ['20%','50%','80%'];
    if (sp) { sp.classList.add('on'); sp.style.setProperty('--sx', positions[idx] || '50%'); }
    document.querySelectorAll('.spot-beam').forEach((b, i) => b.classList.toggle('on', i === idx));
    const char = CHARACTERS[idx];
    if (!char) return;
    const box    = document.getElementById('char-infobox');
    const name   = document.getElementById('ci-name');
    const desc   = document.getElementById('ci-desc');
    const traits = document.getElementById('ci-traits');
    if (box && name && desc && traits) {
        name.textContent = char.name;
        desc.textContent = char.desc;
        traits.innerHTML = char.traits.map(t => `<span class="ci-trait">${t}</span>`).join('');
        box.classList.remove('hidden');
    }
}

function nextCharacter() {
    charIndex++;
    if (charIndex < CHARACTERS.length) { showCharacter(charIndex); }
    else { charIndex = -1; goToSlide(currentSlide + 1); }
}

function resetCharacterView() {
    document.querySelectorAll('.char-cloud').forEach(c => c.classList.remove('focused','dimmed'));
    document.getElementById('spotlight')?.classList.remove('on');
    document.querySelectorAll('.spot-beam').forEach(b => b.classList.remove('on'));
}

/* ── TRANSIÇÃO NUVENS 7→8 ── */
function triggerCloudsTransition7to8() {
    const layer8 = document.getElementById('clouds-layer-8');
    if (!layer8) { goToSlide(8); return; }
    layer8.classList.remove('hidden','leaving');
    layer8.classList.add('entering');
    setTimeout(() => goToSlide(8), 200);
    setTimeout(() => { layer8.classList.remove('entering'); layer8.classList.add('leaving'); }, 1800);
    setTimeout(() => { layer8.classList.add('hidden'); layer8.classList.remove('leaving'); }, 3300);
}

/* ── SLIDE 8 – QUADRO ── */
function initBoardSlide() {
    boardErased = false;
    document.getElementById('mmap-1')?.classList.remove('hidden');
    document.getElementById('mmap-2')?.classList.add('hidden');
    document.getElementById('eraser-overlay')?.classList.remove('erasing');
    const btn = document.getElementById('erase-btn');
    if (btn) btn.style.display = 'flex';
    const title = document.getElementById('board-title');
    if (title) title.textContent = 'V. Auto e Heterocaracterização';
}

function eraseBoard() {
    if (boardErased) return;
    const overlay = document.getElementById('eraser-overlay');
    if (!overlay) return;
    overlay.classList.add('erasing');
    setTimeout(() => {
        document.getElementById('mmap-1')?.classList.add('hidden');
        document.getElementById('mmap-2')?.classList.remove('hidden');
        const title = document.getElementById('board-title');
        if (title) title.textContent = 'VI. Tipos de Cómico';
    }, 500);
    setTimeout(() => {
        overlay.classList.remove('erasing');
        boardErased = true;
        const btn = document.getElementById('erase-btn');
        if (btn) btn.style.display = 'none';
    }, 1000);
}

/* ── SLIDE 9 – SÁTIRA ── */
function initSatiraSlide() {
    s9TopicsRevealed = 0;
    document.querySelectorAll('.st-topic').forEach(t => t.classList.remove('revealed'));
    document.getElementById('conclusao-box')?.classList.remove('revealed');
}

function revealNextSatiraTopic() {
    const topics = document.querySelectorAll('.st-topic');
    if (s9TopicsRevealed < topics.length) { topics[s9TopicsRevealed].classList.add('revealed'); s9TopicsRevealed++; return true; }
    const concl = document.getElementById('conclusao-box');
    if (concl && !concl.classList.contains('revealed')) { concl.classList.add('revealed'); return true; }
    return false;
}

/* ── SLIDE FINAL – CRÉDITOS ── */
function initCreditsSlide() {
    if (creditsStarted) return;
    creditsStarted = true;
    document.querySelector('.fc-l')?.classList.add('closing');
    document.querySelector('.fc-r')?.classList.add('closing');
    const gifFixed = document.getElementById('gif-fixed');
    if (gifFixed) setTimeout(() => gifFixed.classList.add('visible'), 1000);
    const scroll = document.getElementById('credits-scroll');
    const finalClouds = document.getElementById('final-clouds');
    if (scroll) {
        setTimeout(() => {
            scroll.classList.add('rolling');
            if (finalClouds) finalClouds.classList.add('hidden-clouds');
        }, 3000);
    }
    if (MUSIC_AUTOPLAY && MUSIC_SRC) {
        let music = document.getElementById('credits-music');
        if (!music) {
            music = document.createElement('audio');
            music.id = 'credits-music';
            music.src  = MUSIC_SRC;
            music.loop = MUSIC_LOOP;
            document.body.appendChild(music);
        }
        music.volume = MUSIC_VOLUME;
        music.play().catch(() => console.info('Música bloqueada pelo browser.'));
    }
}

/* ── NOTIFICAÇÃO ── */
let notifTimeout = null;
function showNotification(text) {
    const notif = document.getElementById('notification');
    const notifText = document.getElementById('notification-text');
    if (!notif || !notifText) return;
    notifText.textContent = text;
    notif.classList.remove('hidden');
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => notif.classList.add('hidden'), 2000);
}

console.log('🎭 Farsa de Inês Pereira — pronto');
console.log('W/→ avançar | S/← recuar | P fechar livro (slides 3-5)');