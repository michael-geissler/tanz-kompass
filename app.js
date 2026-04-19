const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

const dances = {
  Latein: ["Samba","Cha-Cha-Cha","Rumba","Paso Doble","Jive"],
  Standard: ["Langsamer Walzer","Tango","Wiener Walzer","Slowfox","Quickstep"],
  Sonstiges: ["Discofox","Salsa","Bachata"]
};

async function setDance(text){
  await supabase.from('state').upsert({ id: 1, text });
}

async function getDance(){
  const { data } = await supabase.from('state').select('*').eq('id',1).single();
  return data?.text || '';
}

if(mode === 'display'){
  const el = document.getElementById('app');
  const display = document.createElement('div');
  display.className = 'display';
  el.appendChild(display);

  async function update(){
    display.textContent = await getDance();
  }

  setInterval(update, 500);
}

else{
  const el = document.getElementById('app');

  Object.keys(dances).forEach(cat => {
    const section = document.createElement('div');
    section.className = 'category';

    const title = document.createElement('h1');
    title.textContent = cat;

    const grid = document.createElement('div');
    grid.className = 'grid';

    dances[cat].forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = d;
      btn.onclick = () => setDance(d);
      grid.appendChild(btn);
    });

    section.appendChild(title);
    section.appendChild(grid);
    el.appendChild(section);
  });

  const extras = document.createElement('div');
  extras.className = 'category';

  const pause = document.createElement('button');
  pause.className = 'btn';
  pause.textContent = 'PAUSE';
  pause.onclick = () => setDance('PAUSE');

  const clear = document.createElement('button');
  clear.className = 'btn';
  clear.textContent = 'LEER';
  clear.onclick = () => setDance('');

  const custom = document.createElement('button');
  custom.className = 'btn';
  custom.textContent = 'TEXT';
  custom.onclick = () => {
    const txt = prompt('Text eingeben');
    if(txt) setDance(txt);
  };

  extras.appendChild(pause);
  extras.appendChild(clear);
  extras.appendChild(custom);
  el.appendChild(extras);
}