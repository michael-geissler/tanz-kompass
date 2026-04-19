const dances = {
  Latein: ["Samba","Cha-Cha-Cha","Rumba","Paso Doble","Jive"],
  Standard: ["Langsamer Walzer","Tango","Wiener Walzer","Slowfox","Quickstep"],
  Sonstiges: ["Discofox","Salsa","Bachata"]
};

const app = document.getElementById('app');

const left = document.createElement('div');
left.className = 'left';

const right = document.createElement('div');
right.className = 'right';

const display = document.createElement('div');
display.className = 'display';
display.textContent = 'Wähle einen Tanz';

right.appendChild(display);

let selected = [];

function updateDisplay(){
  if(selected.length === 0){
    display.textContent = 'Wähle einen Tanz';
  } else {
    display.textContent = selected.join(' + ');
  }
}

Object.keys(dances).forEach(cat => {
  const title = document.createElement('h2');
  title.textContent = cat;
  left.appendChild(title);

  dances[cat].forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = d;

    btn.onclick = () => {
      if(selected.includes(d)){
        selected = selected.filter(x => x !== d);
        btn.classList.remove('active');
      } else {
        if(selected.length < 3){
          selected.push(d);
          btn.classList.add('active');
        }
      }
      updateDisplay();
    };

    left.appendChild(btn);
  });
});

app.appendChild(left);
app.appendChild(right);