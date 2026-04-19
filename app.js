const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

const dances = {
  Latein: ["Samba", "Cha-Cha-Cha", "Rumba", "Paso Doble", "Jive"],
  Standard: ["Langsamer Walzer", "Tango", "Wiener Walzer", "Slowfox", "Quickstep"],
  Sonstiges: ["Discofox", "Salsa", "Bachata"]
};

const app = document.getElementById('app');
const hasConfig =
  typeof SUPABASE_URL === 'string' &&
  typeof SUPABASE_KEY === 'string' &&
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_KEY.includes('YOUR_PUBLIC') &&
  !SUPABASE_KEY.includes('YOUR_PUBLISHABLE') &&
  SUPABASE_URL.trim() !== '' &&
  SUPABASE_KEY.trim() !== '';

let supabase = null;
if (hasConfig && window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function createStatus(text, variant = '') {
  const el = document.createElement('div');
  el.className = `status ${variant}`.trim();
  el.textContent = text;
  return el;
}

function createButton(label, onClick, extraClass = '') {
  const btn = document.createElement('button');
  btn.className = `btn ${extraClass}`.trim();
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function normalizeDisplayText(text) {
  return (text || '').trim();
}

async function setDance(text) {
  if (!supabase) {
    throw new Error('Supabase ist noch nicht konfiguriert.');
  }

  const value = normalizeDisplayText(text);
  const { error } = await supabase.from('state').upsert({ id: 1, text: value });
  if (error) throw error;
}

async function getDance() {
  if (!supabase) return '';

  const { data, error } = await supabase
    .from('state')
    .select('text')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data?.text || '';
}

function renderSetupHint() {
  const wrap = document.createElement('div');
  wrap.className = 'panel';

  const title = document.createElement('h1');
  title.textContent = 'Tanzkompass';

  const text = document.createElement('p');
  text.className = 'setup-text';
  text.textContent = 'Supabase ist noch nicht fertig eingetragen. Trage in config.js deine Project URL und deinen Publishable Key ein.';

  const code = document.createElement('pre');
  code.className = 'code-block';
  code.textContent = `const SUPABASE_URL = "https://dein-projekt.supabase.co";\nconst SUPABASE_KEY = "dein_publishable_key";`;

  wrap.append(title, text, code);
  app.appendChild(wrap);
}

function renderDisplay() {
  const wrapper = document.createElement('div');
  wrapper.className = 'display-screen';

  const display = document.createElement('div');
  display.className = 'display';
  display.textContent = 'TANZKOMPASS';

  const sub = document.createElement('div');
  sub.className = 'display-sub';
  sub.textContent = 'Warte auf Auswahl';

  const errorBox = createStatus('', 'hidden');

  wrapper.append(display, sub, errorBox);
  app.appendChild(wrapper);

  function applyText(text) {
    const value = normalizeDisplayText(text);
    if (value) {
      display.textContent = value;
      sub.textContent = '';
    } else {
      display.textContent = 'TANZKOMPASS';
      sub.textContent = 'Warte auf Auswahl';
    }
  }

  async function init() {
    if (!supabase) {
      applyText('');
      sub.textContent = 'Supabase nicht konfiguriert';
      return;
    }

    try {
      const current = await getDance();
      applyText(current);
    } catch (error) {
      errorBox.className = 'status error';
      errorBox.textContent = 'Verbindung zur Datenbank fehlgeschlagen.';
    }

    supabase
      .channel('tanzkompass-state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'state' },
        payload => {
          applyText(payload.new?.text || '');
        }
      )
      .subscribe();
  }

  init();
}

function renderControl() {
  const wrapper = document.createElement('div');
  wrapper.className = 'control-screen';

  const header = document.createElement('div');
  header.className = 'topbar';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h1');
  title.textContent = 'Tanzkompass';
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Bedienfeld für Tanzabende';
  titleWrap.append(title, subtitle);

  const liveBadge = document.createElement('div');
  liveBadge.className = 'live-badge';
  liveBadge.textContent = supabase ? 'LIVE' : 'SETUP';

  header.append(titleWrap, liveBadge);
  wrapper.appendChild(header);

  const currentCard = document.createElement('div');
  currentCard.className = 'current-card';
  const currentLabel = document.createElement('div');
  currentLabel.className = 'current-label';
  currentLabel.textContent = 'Aktuell';
  const currentValue = document.createElement('div');
  currentValue.className = 'current-value';
  currentValue.textContent = '—';
  currentCard.append(currentLabel, currentValue);
  wrapper.appendChild(currentCard);

  const statusBox = createStatus(
    supabase
      ? 'Verbunden. Änderungen werden live an die Anzeige gesendet.'
      : 'Supabase fehlt noch. Die App ist vorbereitet, aber noch nicht verbunden.'
  );
  wrapper.appendChild(statusBox);

  function setCurrentLabel(text) {
    currentValue.textContent = normalizeDisplayText(text) || '—';
  }

  Object.entries(dances).forEach(([category, items]) => {
    const section = document.createElement('section');
    section.className = 'category';

    const heading = document.createElement('h2');
    heading.textContent = category;

    const grid = document.createElement('div');
    grid.className = 'grid';

    items.forEach(item => {
      const btn = createButton(item, async () => {
        try {
          await setDance(item);
          setCurrentLabel(item);
          statusBox.className = 'status success';
          statusBox.textContent = `Gesendet: ${item}`;
        } catch (error) {
          statusBox.className = 'status error';
          statusBox.textContent = 'Senden fehlgeschlagen. Prüfe Supabase und die Tabelle state.';
        }
      });
      grid.appendChild(btn);
    });

    section.append(heading, grid);
    wrapper.appendChild(section);
  });

  const extraSection = document.createElement('section');
  extraSection.className = 'category';
  const extraHeading = document.createElement('h2');
  extraHeading.textContent = 'Extras';
  const extraGrid = document.createElement('div');
  extraGrid.className = 'grid';

  const pauseBtn = createButton('Pause', async () => {
    try {
      await setDance('Pause');
      setCurrentLabel('Pause');
      statusBox.className = 'status success';
      statusBox.textContent = 'Gesendet: Pause';
    } catch (error) {
      statusBox.className = 'status error';
      statusBox.textContent = 'Senden fehlgeschlagen. Prüfe Supabase und die Tabelle state.';
    }
  }, 'btn-secondary');

  const clearBtn = createButton('Leer', async () => {
    try {
      await setDance('');
      setCurrentLabel('');
      statusBox.className = 'status success';
      statusBox.textContent = 'Anzeige geleert';
    } catch (error) {
      statusBox.className = 'status error';
      statusBox.textContent = 'Leeren fehlgeschlagen. Prüfe Supabase und die Tabelle state.';
    }
  }, 'btn-secondary');

  const customBtn = createButton('Eigener Text', async () => {
    const text = window.prompt('Text eingeben');
    if (text === null) return;

    try {
      await setDance(text);
      setCurrentLabel(text);
      statusBox.className = 'status success';
      statusBox.textContent = `Gesendet: ${normalizeDisplayText(text) || 'Leer'}`;
    } catch (error) {
      statusBox.className = 'status error';
      statusBox.textContent = 'Senden fehlgeschlagen. Prüfe Supabase und die Tabelle state.';
    }
  }, 'btn-accent');

  extraGrid.append(pauseBtn, clearBtn, customBtn);
  extraSection.append(extraHeading, extraGrid);
  wrapper.appendChild(extraSection);

  async function init() {
    if (!supabase) {
      app.appendChild(wrapper);
      return;
    }

    try {
      const current = await getDance();
      setCurrentLabel(current);
    } catch (error) {
      statusBox.className = 'status error';
      statusBox.textContent = 'Lesen fehlgeschlagen. Prüfe Supabase und die Tabelle state.';
    }

    app.appendChild(wrapper);
  }

  init();
}

if (!hasConfig && mode !== 'display') {
  renderSetupHint();
} else if (mode === 'display') {
  renderDisplay();
} else {
  renderControl();
}