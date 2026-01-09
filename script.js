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
	colors: {
		swatches: [], // dynamic palette 2-6
		background: '#ffffff',
		text: '#111827',
	},
	fonts: {},
	locked: {
		// swatch locks are created dynamically: swatch_0 ... swatch_N-1
		background: false,
		text: false,
		heading: false,
		body: false,
	},
	settings: {
		count: 3, // default palette count
		useSeedFirst: false,
		seedColor: '#6366f1',
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
// UI helpers
// --------------------
function showToast(message) {
	const feedback = document.getElementById('copyFeedback');
	feedback.textContent = message;
	feedback.classList.add('show');
	setTimeout(() => feedback.classList.remove('show'), 2000);
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => showToast(`Copied: ${text}`));
}

function escapeHtml(str) {
	return String(str)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function clampInt(n, min, max) {
	const x = parseInt(n, 10);
	if (Number.isNaN(x)) return min;
	return Math.max(min, Math.min(max, x));
}

// --------------------
// Fonts
// --------------------
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

function generateFonts() {
	const pair = fontPairs[Math.floor(Math.random() * fontPairs.length)];
	loadGoogleFont(pair.heading);
	loadGoogleFont(pair.body);
	return pair;
}

// --------------------
// Color generation (HSL -> HEX)
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

function hexToHsl(hex) {
	// hex -> rgb 0..1
	const rgb = parseInt(hex.slice(1), 16);
	let r = ((rgb >> 16) & 255) / 255;
	let g = ((rgb >> 8) & 255) / 255;
	let b = (rgb & 255) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h, s;
	const l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			default:
				h = (r - g) / d + 4;
		}
		h *= 60;
	}

	return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Generate a palette of N colors (2-6) based on a baseHue.
 * If useSeedFirst is true, swatch[0] = seedColor (respected unless locked).
 */
function generateSwatches(baseHue, count) {
	const scheme = Math.random() > 0.5 ? 'analogous' : 'complementary';

	// Hue offsets for variety depending on count
	const offsetsAnalogous = [0, 20, 40, 60, 80, 100];
	const offsetsComplementary = [0, 180, 30, 210, 60, 240];

	const swatches = [];
	for (let i = 0; i < count; i++) {
		const offset =
			scheme === 'analogous' ? offsetsAnalogous[i] : offsetsComplementary[i];

		const hue = (baseHue + offset) % 360;
		const sat = 65 + Math.random() * 20;
		const light = 45 + Math.random() * 15;

		swatches.push(hslToHex(hue, sat, light));
	}

	return swatches;
}

function generateNeutrals(baseHue) {
	const bgLightness = 90 + Math.random() * 8;
	const textLightness = 10 + Math.random() * 15;

	return {
		background: hslToHex(baseHue, 10 + Math.random() * 10, bgLightness),
		text: hslToHex(baseHue, 15 + Math.random() * 10, textLightness),
	};
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
// Locks + dynamic swatch locks
// --------------------
function ensureSwatchLocks(count) {
	for (let i = 0; i < count; i++) {
		const key = `swatch_${i}`;
		if (!(key in currentAesthetic.locked)) currentAesthetic.locked[key] = false;
	}
	// Remove extra locks if count reduced
	Object.keys(currentAesthetic.locked).forEach((k) => {
		if (k.startsWith('swatch_')) {
			const idx = parseInt(k.split('_')[1], 10);
			if (idx >= count) delete currentAesthetic.locked[k];
		}
	});
}

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
// Palette controls (2-6 + seed)
// --------------------
function initPaletteControls() {
	const countEl = document.getElementById('colorCount');
	const seedEl = document.getElementById('seedColor');

	// Initialize UI from state
	if (countEl) countEl.value = String(currentAesthetic.settings.count);
	if (seedEl) seedEl.value = currentAesthetic.settings.seedColor;

	if (countEl) {
		countEl.addEventListener('change', () => {
			const nextCount = clampInt(countEl.value, 2, 6);
			currentAesthetic.settings.count = nextCount;

			ensureSwatchLocks(nextCount);

			// Resize swatches array to match count (preserve existing where possible)
			const current = currentAesthetic.colors.swatches || [];
			const resized = current.slice(0, nextCount);
			while (resized.length < nextCount) resized.push('#000000'); // placeholder
			currentAesthetic.colors.swatches = resized;

			generateAesthetic(); // regenerate to fill in placeholders nicely
		});
	}

	if (seedEl) {
		seedEl.addEventListener('input', () => {
			currentAesthetic.settings.seedColor = seedEl.value;
			// if seed mode enabled, update swatch 0 immediately (unless locked off)
			if (currentAesthetic.settings.useSeedFirst && !currentAesthetic.locked['swatch_0']) {
				currentAesthetic.colors.swatches[0] = seedEl.value;
				renderAesthetic();
			}
		});
	}
}

/**
 * User action: take color picker value and use it as first swatch.
 * This also turns on seed mode and locks swatch_0 by default (user can unlock).
 */
function useSeedAsFirstSwatch() {
	const seedEl = document.getElementById('seedColor');
	const seed = seedEl ? seedEl.value : currentAesthetic.settings.seedColor;

	currentAesthetic.settings.seedColor = seed;
	currentAesthetic.settings.useSeedFirst = true;

	ensureSwatchLocks(currentAesthetic.settings.count);

	// Set first swatch and lock it so it persists
	currentAesthetic.colors.swatches[0] = seed;
	currentAesthetic.locked['swatch_0'] = true;

	renderAesthetic();
	showToast('Seed color set as first swatch (locked)');
}

// --------------------
// Render
// --------------------
function renderAesthetic() {
	const colorPalette = document.getElementById('colorPalette');

	// Palette swatches (2-6)
	const swatchItems = currentAesthetic.colors.swatches
		.map((color, i) => {
			const key = `swatch_${i}`;
			const isLocked = !!currentAesthetic.locked[key];
			const lockIcon = isLocked ? '🔒' : '🔓';

			return `
				<div class="color-item">
					<div class="color-swatch" style="background: ${color}"></div>
					<div class="color-info">
						<div class="color-label">Swatch ${i + 1}</div>
						<div class="color-value">${String(color).toUpperCase()}</div>
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

	// Neutrals (background + text)
	const bg = currentAesthetic.colors.background;
	const text = currentAesthetic.colors.text;
	const textContrast = getContrastRatio(text, bg);
	const contrastBadge = getContrastBadge(textContrast);

	const neutralItems = `
		<div class="color-item">
			<div class="color-swatch" style="background: ${bg}"></div>
			<div class="color-info">
				<div class="color-label">Background</div>
				<div class="color-value">${bg.toUpperCase()}</div>
			</div>
			<div class="item-actions">
				<button class="icon-btn" onclick="copyToClipboard('${bg}')" title="Copy">📋</button>
				<button class="icon-btn ${currentAesthetic.locked.background ? 'locked' : ''}"
					onclick="toggleLock('background')" title="Lock">
					${currentAesthetic.locked.background ? '🔒' : '🔓'}
				</button>
			</div>
		</div>

		<div class="color-item">
			<div class="color-swatch" style="background: ${text}"></div>
			<div class="color-info">
				<div class="color-label">Text</div>
				<div class="color-value">${text.toUpperCase()}</div>
				${contrastBadge}
			</div>
			<div class="item-actions">
				<button class="icon-btn" onclick="copyToClipboard('${text}')" title="Copy">📋</button>
				<button class="icon-btn ${currentAesthetic.locked.text ? 'locked' : ''}"
					onclick="toggleLock('text')" title="Lock">
					${currentAesthetic.locked.text ? '🔒' : '🔓'}
				</button>
			</div>
		</div>
	`;

	colorPalette.innerHTML = swatchItems + neutralItems;

	// Fonts
	const fontPairing = document.getElementById('fontPairing');
	const fontLabels = { heading: 'Heading Font', body: 'Body Font' };

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

	// Preview uses:
	// - swatch[0] as primary (headline)
	// - swatch[1] (or swatch[0]) as accent (button)
	const preview = document.getElementById('preview');
	preview.style.background = currentAesthetic.colors.background;
	preview.style.color = currentAesthetic.colors.text;

	const primary = currentAesthetic.colors.swatches[0] || '#6366f1';
	const accent = currentAesthetic.colors.swatches[1] || primary;

	const heading = preview.querySelector('.preview-heading');
	heading.style.fontFamily = `'${currentAesthetic.fonts.heading}', sans-serif`;
	heading.style.color = primary;

	const textEl = preview.querySelector('.preview-text');
	textEl.style.fontFamily = `'${currentAesthetic.fonts.body}', sans-serif`;

	const button = preview.querySelector('.preview-button');
	button.style.background = accent;
	button.style.color = currentAesthetic.colors.background;
	button.style.fontFamily = `'${currentAesthetic.fonts.body}', sans-serif`;
}

// --------------------
// Generate
// --------------------
function generateAesthetic() {
	const count = clampInt(currentAesthetic.settings.count, 2, 6);
	ensureSwatchLocks(count);

	// Pick base hue:
	// If seed mode is enabled, baseHue comes from seed color (so palette stays related).
	// Otherwise, random base hue.
	let baseHue = Math.floor(Math.random() * 360);
	if (currentAesthetic.settings.useSeedFirst) {
		const seedHsl = hexToHsl(currentAesthetic.settings.seedColor);
		baseHue = seedHsl.h;
	}

	// Generate swatches
	const newSwatches = generateSwatches(baseHue, count);

	// Apply swatches respecting locks
	if (!Array.isArray(currentAesthetic.colors.swatches)) currentAesthetic.colors.swatches = [];
	const nextSwatches = [];

	for (let i = 0; i < count; i++) {
		const key = `swatch_${i}`;
		const locked = !!currentAesthetic.locked[key];

		if (locked && currentAesthetic.colors.swatches[i]) {
			nextSwatches[i] = currentAesthetic.colors.swatches[i];
		} else {
			nextSwatches[i] = newSwatches[i];
		}
	}

	// If seed mode ON: force swatch[0] to seed unless user explicitly unlocked and changed it
	if (currentAesthetic.settings.useSeedFirst) {
		if (!currentAesthetic.locked['swatch_0']) {
			nextSwatches[0] = currentAesthetic.settings.seedColor;
		} else {
			// if locked, keep whatever is already there (usually seed)
			nextSwatches[0] = currentAesthetic.colors.swatches[0] || currentAesthetic.settings.seedColor;
		}
	}

	currentAesthetic.colors.swatches = nextSwatches;

	// Generate neutrals (background/text) tied to baseHue
	const neutrals = generateNeutrals(baseHue);

	if (!currentAesthetic.locked.background) currentAesthetic.colors.background = neutrals.background;
	if (!currentAesthetic.locked.text) currentAesthetic.colors.text = neutrals.text;

	// Fonts respecting locks
	const newFonts = generateFonts();
	if (!currentAesthetic.locked.heading) currentAesthetic.fonts.heading = newFonts.heading;
	if (!currentAesthetic.locked.body) currentAesthetic.fonts.body = newFonts.body;

	renderAesthetic();
}

// =====================================================
// Saving / Loading (localStorage)
// =====================================================
const STORAGE_KEY = 'rag_saved_aesthetics_v2';

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
	if (!name) return showToast('Please enter a name to save.');

	const snapshot = {
		id: createId(),
		name,
		createdAt: new Date().toISOString(),
		settings: {
			count: currentAesthetic.settings.count,
			useSeedFirst: currentAesthetic.settings.useSeedFirst,
			seedColor: currentAesthetic.settings.seedColor,
		},
		colors: {
			swatches: [...currentAesthetic.colors.swatches],
			background: currentAesthetic.colors.background,
			text: currentAesthetic.colors.text,
		},
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

	// Load fonts
	loadGoogleFont(item.fonts.heading);
	loadGoogleFont(item.fonts.body);

	// Apply settings + colors + fonts (does not modify locks)
	currentAesthetic.settings = {
		...currentAesthetic.settings,
		...item.settings,
	};

	ensureSwatchLocks(currentAesthetic.settings.count);

	currentAesthetic.colors = {
		swatches: [...(item.colors.swatches || [])],
		background: item.colors.background,
		text: item.colors.text,
	};

	currentAesthetic.fonts = { ...item.fonts };

	// Sync UI controls
	const countEl = document.getElementById('colorCount');
	const seedEl = document.getElementById('seedColor');
	if (countEl) countEl.value = String(currentAesthetic.settings.count);
	if (seedEl) seedEl.value = currentAesthetic.settings.seedColor;

	renderAesthetic();
	showToast(`Applied: ${item.name}`);
}

function deleteSaved(id) {
	const next = getSaved().filter((x) => x.id !== id);
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
	const item = getSaved().find((x) => x.id === id);
	if (!item) return;

	const json = JSON.stringify(
		{
			name: item.name,
			settings: item.settings,
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
			// show up to 6 swatches as mini previews
			const swatches = (item.colors.swatches || [])
				.slice(0, 6)
				.map((c) => `<div class="saved-swatch" style="background:${c}"></div>`)
				.join('');

			const meta = `${item.colors.swatches?.length || 0} colors • ${item.fonts.heading} • ${item.fonts.body}`;

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

	const hasAny = saved.length > 0;
	emptyEl.style.display = hasAny ? 'none' : 'block';
}

// --------------------
// Modal behavior + init
// --------------------
function initModalBehavior() {
	const backdrop = document.getElementById('saveModalBackdrop');
	backdrop.addEventListener('click', (e) => {
		if (e.target === backdrop) closeSaveModal();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeSaveModal();
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initThemeToggle();
	initModalBehavior();
	initPaletteControls();

	// Ensure locks exist for default count
	ensureSwatchLocks(currentAesthetic.settings.count);

	// Saved search
	const searchEl = document.getElementById('savedSearch');
	if (searchEl) searchEl.addEventListener('input', renderSavedList);

	// Initial render
	generateAesthetic();
	renderSavedList();
});
