'use strict';

/* ============================================================
   paraClaudia — Larry la rana enseña a Claudia (2 años).
   Sin dependencias: Web Speech API (voz) + Web Audio API (notas).
   ============================================================ */

// ------------------------------------------------------------
// Idioma: Larry SIEMPRE habla español, salvo que papá cambie
// el botón 🌐 de la esquina (se recuerda en localStorage).
// ------------------------------------------------------------
const state = {
	lang: localStorage.getItem('pc_lang') || 'es',
};

const T = {
	es: {
		title: '¡Hola Claudia!',
		menuPiano: 'Piano',
		menuColors: 'Colores',
		songTitle: '🎂 Cumpleaños Feliz',
		greet: '¡Hola Claudia! Soy Larry la rana. ¿Jugamos?',
		pianoIntro: '¡Vamos a tocar Cumpleaños Feliz! Toca la tecla que brilla.',
		pianoDone: '¡Cumpleaños feliz! ¡Lo hiciste muy bien, Claudia!',
		listen: '¡Escucha!',
		colorNames: { red: 'rojo', yellow: 'amarillo', blue: 'azul' },
		colorAsk: (c) => `¿Dónde está el ${c}? ¡Toca el ${c}!`,
		colorPromptLabel: (c) => `¿Dónde está el ${c.toUpperCase()}?`,
		colorWrong: (wrong, target) => `Ese es el ${wrong}. ¡Busca el ${target}!`,
		praise: ['¡Muy bien, Claudia!', '¡Bravo!', '¡Eso es!', '¡Genial!', '¡Qué lista eres!'],
		langSwitched: '¡Ahora hablo español!',
	},
	en: {
		title: 'Hi Claudia!',
		menuPiano: 'Piano',
		menuColors: 'Colors',
		songTitle: '🎂 Happy Birthday',
		greet: "Hi Claudia! I'm Larry the frog. Let's play!",
		pianoIntro: "Let's play Happy Birthday! Touch the key that glows.",
		pianoDone: 'Happy birthday! You did great, Claudia!',
		listen: 'Listen!',
		colorNames: { red: 'red', yellow: 'yellow', blue: 'blue' },
		colorAsk: (c) => `Where is ${c}? Touch ${c}!`,
		colorPromptLabel: (c) => `Where is ${c.toUpperCase()}?`,
		colorWrong: (wrong, target) => `That one is ${wrong}. Look for ${target}!`,
		praise: ['Very good, Claudia!', 'Bravo!', "That's it!", 'Great job!', 'You are so smart!'],
		langSwitched: 'Now I speak English!',
	},
};
const tr = () => T[state.lang];

// ------------------------------------------------------------
// Voz de Larry (speechSynthesis)
// ------------------------------------------------------------
let cachedVoices = [];
if ('speechSynthesis' in window) {
	const loadVoices = () => { cachedVoices = speechSynthesis.getVoices(); };
	loadVoices();
	speechSynthesis.onvoiceschanged = loadVoices;
}

let mouthTimer = null;
function larryTalk(on) {
	const wrap = document.getElementById('larry-wrap');
	const open = document.getElementById('mouth-open');
	const tongue = document.getElementById('tongue');
	const closed = document.getElementById('mouth-closed');
	clearInterval(mouthTimer);
	if (on) {
		wrap.classList.add('talking');
		let toggle = false;
		mouthTimer = setInterval(() => {
			toggle = !toggle;
			open.style.display = toggle ? '' : 'none';
			tongue.style.display = toggle ? '' : 'none';
			closed.style.display = toggle ? 'none' : '';
		}, 170);
	} else {
		wrap.classList.remove('talking');
		open.style.display = 'none';
		tongue.style.display = 'none';
		closed.style.display = '';
	}
}

let bubbleTimer = null;
function showBubble(text) {
	const b = document.getElementById('bubble');
	b.textContent = text;
	b.classList.remove('hidden');
	clearTimeout(bubbleTimer);
	bubbleTimer = setTimeout(() => b.classList.add('hidden'), 4000);
}

function say(text, onend) {
	showBubble(text);
	if (!('speechSynthesis' in window)) { if (onend) onend(); return; }
	speechSynthesis.cancel();
	// pequeño retraso: algunos Android se tragan el speak() justo tras cancel()
	setTimeout(() => {
		const u = new SpeechSynthesisUtterance(text);
		const wantLang = state.lang === 'es' ? 'es' : 'en';
		u.lang = state.lang === 'es' ? 'es-ES' : 'en-US';
		const voice = cachedVoices.find(v => v.lang.toLowerCase().startsWith(wantLang));
		if (voice) u.voice = voice;
		u.rate = 0.85;   // despacio, para una niña de 2 años
		u.pitch = 1.25;  // voz aguda de rana simpática
		u.onstart = () => larryTalk(true);
		u.onend = () => { larryTalk(false); if (onend) onend(); };
		u.onerror = () => { larryTalk(false); if (onend) onend(); };
		speechSynthesis.speak(u);
	}, 60);
}

// ------------------------------------------------------------
// Audio (notas del piano y efectos)
// ------------------------------------------------------------
let actx = null;
function audioCtx() {
	if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
	if (actx.state === 'suspended') actx.resume();
	return actx;
}

function tone(freq, dur = 0.45, type = 'triangle', vol = 0.4, when = 0) {
	const ctx = audioCtx();
	const t0 = ctx.currentTime + when;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(0, t0);
	gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
	gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
	osc.connect(gain).connect(ctx.destination);
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

function dingSound()  { tone(523.25, 0.3, 'sine', 0.4); tone(783.99, 0.5, 'sine', 0.4, 0.12); }
function boingSound() { tone(220, 0.25, 'sine', 0.3); tone(174, 0.3, 'sine', 0.3, 0.12); }
function fanfare() {
	[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.5, 'triangle', 0.4, i * 0.13));
}

// ------------------------------------------------------------
// Pantallas
// ------------------------------------------------------------
function showScreen(id) {
	speechSynthesis && speechSynthesis.cancel();
	larryTalk(false);
	stopPianoDemo();
	document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
}

// ------------------------------------------------------------
// PIANO — Cumpleaños Feliz con teclas que brillan
// ------------------------------------------------------------
const KEY_DEFS = [
	{ es: 'Sol', en: 'G', freq: 392.00, color: '#e53935' },
	{ es: 'La',  en: 'A', freq: 440.00, color: '#f4711f' },
	{ es: 'Si',  en: 'B', freq: 493.88, color: '#fdd835' },
	{ es: 'Do',  en: 'C', freq: 523.25, color: '#43a047' },
	{ es: 'Re',  en: 'D', freq: 587.33, color: '#1e88e5' },
	{ es: 'Mi',  en: 'E', freq: 659.25, color: '#5e35b1' },
	{ es: 'Fa',  en: 'F', freq: 698.46, color: '#d81b60' },
	{ es: 'Sol', en: 'G', freq: 783.99, color: '#00acc1' },
];

// Cumpleaños Feliz en Do mayor (empieza en Sol): índices sobre KEY_DEFS
const SONG = [
	0, 0, 1, 0, 3, 2,
	0, 0, 1, 0, 4, 3,
	0, 0, 7, 5, 3, 2, 1,
	6, 6, 5, 3, 4, 3,
];
// duración de cada nota al reproducir la demo (segundos)
const SONG_DUR = [
	0.4, 0.3, 0.7, 0.7, 0.7, 1.3,
	0.4, 0.3, 0.7, 0.7, 0.7, 1.3,
	0.4, 0.3, 0.7, 0.7, 0.7, 0.7, 1.3,
	0.4, 0.3, 0.7, 0.7, 0.7, 1.5,
];

let songStep = 0;
let pianoLocked = false;   // durante la demo o la celebración
let demoTimers = [];

function buildPiano() {
	const wrap = document.getElementById('piano-keys');
	wrap.innerHTML = '';
	KEY_DEFS.forEach((k, i) => {
		const btn = document.createElement('button');
		btn.className = 'piano-key';
		btn.dataset.idx = i;
		const dot = document.createElement('div');
		dot.className = 'key-dot';
		dot.style.background = k.color;
		const name = document.createElement('div');
		name.className = 'key-name';
		name.textContent = state.lang === 'es' ? k.es : k.en;
		btn.appendChild(dot);
		btn.appendChild(name);
		btn.addEventListener('pointerdown', () => pressPianoKey(i, btn));
		wrap.appendChild(btn);
	});
}

function glowKey(idx) {
	document.querySelectorAll('.piano-key').forEach(b =>
		b.classList.toggle('glow', Number(b.dataset.idx) === idx));
}

function setProgress() {
	document.getElementById('song-progress-fill').style.width =
		`${(songStep / SONG.length) * 100}%`;
}

function pressPianoKey(idx, btn) {
	tone(KEY_DEFS[idx].freq);
	btn.classList.add('pressed');
	setTimeout(() => btn.classList.remove('pressed'), 160);
	if (pianoLocked) return;
	if (idx === SONG[songStep]) {
		songStep++;
		setProgress();
		if (songStep >= SONG.length) {
			finishSong();
		} else {
			glowKey(SONG[songStep]);
		}
	}
	// tecla equivocada: no pasa nada malo, la correcta sigue brillando
}

function finishSong() {
	pianoLocked = true;
	glowKey(-1);
	confetti(90);
	fanfare();
	setTimeout(() => {
		say(tr().pianoDone, () => {
			setTimeout(startSong, 800);
		});
	}, 700);
}

function startSong() {
	songStep = 0;
	pianoLocked = false;
	setProgress();
	glowKey(SONG[0]);
}

function playDemo() {
	stopPianoDemo();
	pianoLocked = true;
	say(tr().listen);
	let t = 600; // deja hablar a Larry primero
	SONG.forEach((idx, i) => {
		demoTimers.push(setTimeout(() => {
			tone(KEY_DEFS[idx].freq, SONG_DUR[i] + 0.15);
			glowKey(idx);
		}, t));
		t += SONG_DUR[i] * 1000;
	});
	demoTimers.push(setTimeout(startSong, t + 300));
}

function stopPianoDemo() {
	demoTimers.forEach(clearTimeout);
	demoTimers = [];
}

function openPiano() {
	showScreen('screen-piano');
	buildPiano();
	startSong();
	say(tr().pianoIntro);
}

// ------------------------------------------------------------
// COLORES — rojo, amarillo, azul
// ------------------------------------------------------------
const COLOR_DEFS = [
	{ id: 'red',    hex: '#e53935' },
	{ id: 'yellow', hex: '#fdd835' },
	{ id: 'blue',   hex: '#1e88e5' },
];

let colorTarget = null;
let colorLocked = false;
let colorNextTimer = null;

function shuffled(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function colorRound() {
	colorLocked = false;
	// color nuevo distinto al anterior
	const options = COLOR_DEFS.filter(c => c.id !== (colorTarget && colorTarget.id));
	colorTarget = options[Math.floor(Math.random() * options.length)];

	const wrap = document.getElementById('color-buttons');
	wrap.innerHTML = '';
	shuffled(COLOR_DEFS).forEach(c => {
		const btn = document.createElement('button');
		btn.className = 'color-btn big-btn';
		btn.style.background = c.hex;
		btn.textContent = tr().colorNames[c.id];
		if (c.id === 'yellow') { btn.style.color = '#6d5900'; btn.style.textShadow = 'none'; }
		btn.addEventListener('pointerdown', () => pressColor(c, btn));
		wrap.appendChild(btn);
	});

	const name = tr().colorNames[colorTarget.id];
	document.getElementById('color-prompt').textContent = tr().colorPromptLabel(name);
	say(tr().colorAsk(name));
}

function pressColor(c, btn) {
	if (colorLocked) return;
	if (c.id === colorTarget.id) {
		colorLocked = true;
		btn.classList.add('correct');
		dingSound();
		confetti(50);
		const phrases = tr().praise;
		say(phrases[Math.floor(Math.random() * phrases.length)]);
		clearTimeout(colorNextTimer);
		colorNextTimer = setTimeout(colorRound, 2600);
	} else {
		btn.classList.add('wrong');
		setTimeout(() => btn.classList.remove('wrong'), 550);
		boingSound();
		say(tr().colorWrong(tr().colorNames[c.id], tr().colorNames[colorTarget.id]));
	}
}

function openColors() {
	showScreen('screen-colors');
	colorTarget = null;
	clearTimeout(colorNextTimer);
	colorRound();
}

function repeatColorPrompt() {
	if (colorTarget) say(tr().colorAsk(tr().colorNames[colorTarget.id]));
}

// ------------------------------------------------------------
// Confeti
// ------------------------------------------------------------
const CONFETTI_COLORS = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#f4711f', '#d81b60', '#00acc1'];
function confetti(n) {
	const layer = document.getElementById('confetti-layer');
	for (let i = 0; i < n; i++) {
		const p = document.createElement('div');
		p.className = 'confetti';
		p.style.left = `${Math.random() * 100}%`;
		p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
		p.style.animationDuration = `${1.2 + Math.random() * 1.6}s`;
		p.style.animationDelay = `${Math.random() * 0.4}s`;
		if (Math.random() < 0.5) p.style.borderRadius = '50%';
		p.addEventListener('animationend', () => p.remove());
		layer.appendChild(p);
	}
}

// ------------------------------------------------------------
// Textos de la interfaz + arranque
// ------------------------------------------------------------
function applyLabels() {
	document.getElementById('home-title').textContent = tr().title;
	document.getElementById('menu-piano-label').textContent = tr().menuPiano;
	document.getElementById('menu-colors-label').textContent = tr().menuColors;
	document.getElementById('song-title').textContent = tr().songTitle;
	document.getElementById('lang-toggle').textContent = state.lang === 'es' ? '🌐 ES' : '🌐 EN';
	document.documentElement.lang = state.lang;
}

function toggleLang() {
	state.lang = state.lang === 'es' ? 'en' : 'es';
	localStorage.setItem('pc_lang', state.lang);
	applyLabels();
	say(tr().langSwitched);
}

document.getElementById('btn-piano').addEventListener('pointerdown', () => { audioCtx(); openPiano(); });
document.getElementById('btn-colors').addEventListener('pointerdown', () => { audioCtx(); openColors(); });
document.getElementById('piano-hear').addEventListener('pointerdown', () => { audioCtx(); playDemo(); });
document.getElementById('color-repeat').addEventListener('pointerdown', repeatColorPrompt);
document.getElementById('lang-toggle').addEventListener('pointerdown', toggleLang);
document.getElementById('larry').addEventListener('pointerdown', () => { audioCtx(); say(tr().greet); });
document.querySelectorAll('[data-back]').forEach(b =>
	b.addEventListener('pointerdown', () => showScreen('screen-home')));

applyLabels();
showBubble(state.lang === 'es' ? '¡Tócame!' : 'Tap me!');
