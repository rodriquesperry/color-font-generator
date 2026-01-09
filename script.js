// Curated Google Fonts that pair well together
const fontPairs = [
	{ heading: 'Playfair Display', body: 'Source Sans Pro' },
	{ heading: 'Montserrat', body: 'Merriweather' },
	{ heading: 'Raleway', body: 'Lato' },
	{ heading: 'Oswald', body: 'Noto Sans' },
	{ heading: 'Bebas Neue', body: 'Open Sans' },
	{ heading: 'Poppins', body: 'Roboto' },
	{ heading: 'Abril Fatface', body: 'Raleway' },
	{ heading: 'Rubik', body: 'Karla' },
	{ heading: 'Space Grotesk', body: 'Work Sans' },
	{ heading: 'DM Serif Display', body: 'DM Sans' },
];

// --------------------
// State management
// --------------------
let currentAesthetic = {
	colors: {},
	fonts: {},
	locked: {
		primary: false,
		secondary: false,
		accent: false,
		background: false,
		text: false,
		heading: false,
		body: false,
	},
};

let loadedFonts = new Set(['Inter']);

// --------------------
// Theme toggle
// --------------------
function setTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);

	const toggle = document.getElementById('themeToggle');
	if (toggle) toggle.checked = theme === 'dark';

	const icon = document.querySelector('.theme-icon');
	if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';

	try {
		localStorage.setItem('theme', theme);
	} catch {}
}

function initThemeToggle() {
	const saved = (() => {
		try {
			return localStorage.getItem('theme');
		} catch {
			return null;
		}
	})();

	const prefersDark =
		window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

	setTheme(saved || (prefersDark ? 'dark' : 'light'));

	const toggle = document.getElementById('themeToggle');
	if (toggle) {
		toggle.addEventListener('change', (e) => {
			setTheme(e.target.checked ? 'dark' : 'light');
		});
	}
}

// --------------------
// Helpers
// --------------------
function showToast(message) {
	const feedback = document.getElementById('copyFeedback');
	feedback.textContent = message;
	feedback.classList.add('show');
	setTimeout(() => feedback.classList.remove('show'), 2000);
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showToast(`Copied: ${text}`);
	});
}

function loadGoogleFont(fontName) {
	if (!fontName || loadedFonts.has(fontName)) return;

	const link = document.createElement('link');
	link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
		' ',
		'+'
	)}:wght@400;600;700&display=swap`;
	link.rel = 'stylesheet';
	document.head.appendChild(link);
	loadedFonts.add(fontName);
}

// --------------------
// Color generation
// --------------------
function hslToHex(h, s, l) {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

function generateColorPalette() {
	const baseHue = Math.floor(Math.random() * 360);
	const scheme = Math.random() > 0.5 ? 'analogous' : 'complementary';

	let colors = {};

	if (scheme === 'analogous') {
		colors.primary = hslToHex(baseHue, 70 + Math.random() * 20, 50 + Math.random() * 10);
		colors.secondary = hslToHex(
			(baseHue + 30) % 360,
			65 + Math.random() * 20,
			55 + Math.random() * 10
		);
		colors.accent = hslToHex(
			(baseHue + 60) % 360,
			75 + Math.random() * 15,
			45 + Math.random() * 15
		);
	} else {
		colors.primary = hslToHex(baseHue, 70 + Math.random() * 20, 50 + Math.random() * 10);
		colors.secondary = hslToHex(
			(baseHue + 180) % 360,
			65 + Math.random() * 20,
			55 + Math.random() * 10
		);
		colors.accent = hslToHex(
			(baseHue + 90) % 360,
			75 + Math.random() * 15,
			45 + Math.random() * 15
		);
	}

	const bgLightness = 90 + Math.random() * 8;
	const textLightness = 10 + Math.random() * 15;

	colors.background = hslToHex(baseHue, 10 + Math.random() * 10, bgLightness);
	colors.text = hslToHex(baseHue, 15 + Math.random() * 10, textLightness);

	return colors;
}

// WCAG contrast
function getLuminance(hex) {
	const rgb = parseInt(hex.slice(1), 16);
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >> 8) & 0xff;
	const b = (rgb >> 0) & 0xff;

	const [rs, gs, bs] = [r, g, b].map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
	const lum1 = getLuminance(hex1);
	const lum2 = getLuminance(hex2);
	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);
	return (lighter + 0.05) / (darker + 0.05);
}

function getContrastBadge(ratio) {
	if (ratio >= 4.5) return '<span class="contrast-badge contrast-good">AAA ✓</span>';
	if (ratio >= 3) return '<span class="contrast-badge contrast-good">AA ✓</span>';
	return '<span class="contrast-badge contrast-poor">Poor ✗</span>';
}

// --------------------
// Fonts
// --------------------
function generateFonts() {
	const pair = fontPairs[Math.floor(Math.random() * fontPairs.length)];
	loadGoogleFont(pair.heading);
	loadGoogleFont(pair.body);
	return pair;
}

// --------------------
// Locks
// --------------------
function toggleLock(type) {
	currentAesthetic.locked[type] = !currentAesthetic.locked[type];
	renderAesthetic();
}

function unlockAll() {
	Object.keys(currentAesthetic.locked).forEach((key) => {
		currentAesthetic.locked[key] = false;
	});
	renderAesthetic();
}

// --------------------
// Render
// --------------------
function renderAesthetic() {
	// Render colors
	const colorPalette = document.getElementById('colorPalette');
	const colorLabels = {
		primary: 'Primary',
		secondary: 'Secondary',
		accent: 'Accent',
		background: 'Background',
		text: 'Text',
	};

	colorPalette.innerHTML = Object.keys(currentAesthetic.colors)
		.map((key) => {
			const color = currentAesthetic.colors[key];
			const isLocked = currentAesthetic.locked[key];
			const lockIcon = isLocked ? '🔒' : '🔓';

			let contrastBadge = '';
			if (key === 'text') {
				const ratio = getContrastRatio(color, currentAesthetic.colors.background);
				contrastBadge = getContrastBadge(ratio);
			}

			return `
        <div class="color-item">
          <div class="color-swatch" style="background: ${color}"></div>
          <div class="color-info">
            <div class="color-label">${colorLabels[key]}</div>
            <div class="color-value">${color.toUpperCase()}</div>
            ${contrastBadge}
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="copyToClipboard('${color}')" title="Copy">📋</button>
            <button class="icon-btn ${isLocked ? 'locked' : ''}" onclick="toggleLock('${key}')" title="Lock">
              ${lockIcon}
            </button>
          </div>
        </div>
      `;
		})
		.join('');

	// Render fonts
	const fontPairing = document.getElementById('fontPairing');
	const fontLabels = {
		heading: 'Heading Font',
		body: 'Body Font',
	};

	fontPairing.innerHTML = Object.keys(currentAesthetic.fonts)
		.map((key) => {
			const font = currentAesthetic.fonts[key];
			const isLocked = currentAesthetic.locked[key];
			const lockIcon = isLocked ? '🔒' : '🔓';

			return `
        <div class="font-item">
          <div class="font-preview" style="font-family: '${font}', sans-serif">Aa</div>
          <div class="font-info">
            <div class="font-label">${fontLabels[key]}</div>
            <div class="font-value">${font}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="copyToClipboard('${font}')" title="Copy">📋</button>
            <button class="icon-btn ${isLocked ? 'locked' : ''}" onclick="toggleLock('${key}')" title="Lock">
              ${lockIcon}
            </button>
          </div>
        </div>
      `;
		})
		.join('');

	// Update preview
	const preview = document.getElementById('preview');
	preview.style.background = currentAesthetic.colors.background;
	preview.style.color = currentAesthetic.colors.text;

	const heading = preview.querySelector('.preview-heading');
	heading.style.fontFamily = `'${currentAesthetic.fonts.heading}', sans-serif`;
	heading.style.color = currentAesthetic.colors.primary;

	const text = preview.querySelector('.preview-text');
	text.style.fontFamily = `'${currentAesthetic.fonts.body}', sans-serif`;

	const button = preview.querySelector('.preview-button');
	button.style.background = currentAesthetic.colors.accent;
	button.style.color = currentAesthetic.colors.background;
	button.style.fontFamily = `'${currentAesthetic.fonts.body}', sans-serif`;
}

// --------------------
// Generate
// --------------------
function generateAesthetic() {
	const newColors = generateColorPalette();
	Object.keys(newColors).forEach((key) => {
		if (!currentAesthetic.locked[key]) {
			currentAesthetic.colors[key] = newColors[key];
		}
	});

	const newFonts = generateFonts();
	if (!currentAesthetic.locked.heading) currentAesthetic.fonts.heading = newFonts.heading;
	if (!currentAesthetic.locked.body) currentAesthetic.fonts.body = newFonts.body;

	renderAesthetic();
}

// =====================================================
// ✅ SAVING / LOADING (localStorage)
// =====================================================
const STORAGE_KEY = 'rag_saved_aesthetics_v1';

function getSaved() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function setSaved(items) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

function createId() {
	return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function openSaveModal() {
	const backdrop = document.getElementById('saveModalBackdrop');
	const input = document.getElementById('saveName');

	backdrop.classList.add('show');
	backdrop.setAttribute('aria-hidden', 'false');

	// Default name suggestion
	const h = currentAesthetic.fonts.heading || 'Heading';
	const b = currentAesthetic.fonts.body || 'Body';
	input.value = `${h} + ${b}`;
	setTimeout(() => input.focus(), 0);
}

function closeSaveModal() {
	const backdrop = document.getElementById('saveModalBackdrop');
	backdrop.classList.remove('show');
	backdrop.setAttribute('aria-hidden', 'true');
}

function saveCurrentAesthetic() {
	const nameInput = document.getElementById('saveName');
	const name = (nameInput.value || '').trim();

	if (!name) {
		showToast('Please enter a name to save.');
		return;
	}

	// Snapshot current aesthetic (colors + fonts only)
	const snapshot = {
		id: createId(),
		name,
		createdAt: new Date().toISOString(),
		colors: { ...currentAesthetic.colors },
		fonts: { ...currentAesthetic.fonts },
	};

	const saved = getSaved();
	saved.unshift(snapshot);
	setSaved(saved);

	closeSaveModal();
	renderSavedList();
	showToast(`Saved: ${name}`);
}

function applySaved(id) {
	const saved = getSaved();
	const item = saved.find((x) => x.id === id);
	if (!item) return;

	// Load required fonts
	loadGoogleFont(item.fonts.heading);
	loadGoogleFont(item.fonts.body);

	// Apply without touching locks
	currentAesthetic.colors = { ...item.colors };
	currentAesthetic.fonts = { ...item.fonts };

	renderAesthetic();
	showToast(`Applied: ${item.name}`);
}

function deleteSaved(id) {
	const saved = getSaved();
	const next = saved.filter((x) => x.id !== id);
	setSaved(next);
	renderSavedList();
	showToast('Deleted saved aesthetic');
}

function clearAllSaved() {
	setSaved([]);
	renderSavedList();
	showToast('Cleared all saved aesthetics');
}

function exportSaved(id) {
	const saved = getSaved();
	const item = saved.find((x) => x.id === id);
	if (!item) return;

	const json = JSON.stringify(
		{
			name: item.name,
			colors: item.colors,
			fonts: item.fonts,
		},
		null,
		2
	);

	copyToClipboard(json);
	showToast('Saved aesthetic copied as JSON');
}

function renderSavedList() {
	const listEl = document.getElementById('savedList');
	const emptyEl = document.getElementById('savedEmpty');
	const searchEl = document.getElementById('savedSearch');

	const query = (searchEl?.value || '').trim().toLowerCase();
	const saved = getSaved();

	const filtered = query
		? saved.filter((x) => x.name.toLowerCase().includes(query))
		: saved;

	listEl.innerHTML = filtered
		.map((item) => {
			const swatches = ['primary', 'secondary', 'accent', 'background', 'text']
				.map((k) => `<div class="saved-swatch" style="background:${item.colors[k]}"></div>`)
				.join('');

			const meta = `${item.fonts.heading} • ${item.fonts.body}`;

			return `
				<div class="saved-card">
					<div class="saved-top">
						<div>
							<div class="saved-name">${escapeHtml(item.name)}</div>
							<div class="saved-meta">${escapeHtml(meta)}</div>
						</div>
						<div class="saved-swatches">${swatches}</div>
					</div>

					<div class="saved-actions">
						<button class="btn-mini" onclick="applySaved('${item.id}')">Apply</button>
						<button class="btn-mini" onclick="exportSaved('${item.id}')">Copy JSON</button>
						<button class="btn-mini" onclick="deleteSaved('${item.id}')">Delete</button>
					</div>
				</div>
			`;
		})
		.join('');

	const hasAny = getSaved().length > 0;
	emptyEl.style.display = hasAny ? 'none' : 'block';
}

function escapeHtml(str) {
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

// Close modal on backdrop click + ESC
function initModalBehavior() {
	const backdrop = document.getElementById('saveModalBackdrop');
	backdrop.addEventListener('click', (e) => {
		if (e.target === backdrop) closeSaveModal();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeSaveModal();
	});
}

// --------------------
// Init
// --------------------
document.addEventListener('DOMContentLoaded', () => {
	initThemeToggle();
	initModalBehavior();

	// Saved search
	const searchEl = document.getElementById('savedSearch');
	if (searchEl) searchEl.addEventListener('input', renderSavedList);

	// Initial render
	generateAesthetic();
	renderSavedList();
});
