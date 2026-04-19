const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

const dances = {
  Latein: ["Samba","Cha-Cha-Cha","Rumba","Paso Doble","Jive"],
  Standard: ["Langsamer Walzer","Tango","Wiener Walzer","Slowfox","Quickstep"],
  Sonstiges: ["Discofox","Salsa","Bachata"]
};

if(mode === 'display'){
  const el = document.getElementById('app');
  const display = document.createElement('div');
  display.className = 'display';
  el.appendChild(display);

  function update(){
    display.textContent = localStorage.getItem('currentDance') || '';
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
      btn.onclick = () => localStorage.setItem('currentDance', d);
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
  pause.onclick = () => localStorage.setItem('currentDance','PAUSE');

  const clear = document.createElement('button');
  clear.className = 'btn';
  clear.textContent = 'LEER';
  clear.onclick = () => localStorage.setItem('currentDance','');

  const custom = document.createElement('button');
  custom.className = 'btn';
  custom.textContent = 'TEXT';
  custom.onclick = () => {
    const txt = prompt('Text eingeben');
    if(txt) localStorage.setItem('currentDance', txt);
  };

  extras.appendChild(pause);
  extras.appendChild(clear);
  extras.appendChild(custom);
  el.appendChild(extras);
}