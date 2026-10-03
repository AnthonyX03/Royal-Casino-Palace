/* Royal Casino Palace — Roguelike v3 */
const SAVE_KEY = 'rcp_roguelike_v3';

const S = {
  name: 'Elias Crowe',
  money: 500,
  equipment: [],   // max 5 equipped
  backpack: [],    // max 5 storage
  discovered: [],  // album: {icon,name,rarity,rarityName,color,effectsText}
  stats: { games: 0, won: 0, lost: 0, itemsFound: 0 },
  settings: { music: 0.4, sfx: 0.7, muted: false }
};

/* ===== ITEM GENERATION: 1000+ combos, many abilities ===== */
const PREFIXES = ['Maldito','Sangriento','Oscuro','Fantasmal','Carmesí','Oxidado','Roto','Sagrado','Profano','Etéreo','Sombrío','Gélido','Ígneo','Vacío','Antiguo','Corrompido','Bendito','Olvidado','Espectral','Nefasto','Venenoso','Dorado','Plateado','Cristalino','Humeante','Gritante','Silente','Rabioso','Sereno','Caótico'];
const NOUNS = ['Dado','Ficha','Amuleto','Reloj','Anillo','Carta','Moneda','Llave','Calavera','Corona','Daga','Espejo','Reliquia','Talismán','Gema','Orbe','Máscara','Pluma','Hueso','Sello','Cáliz','Vela','Runa','Medallón','Collar','Brazalete','Fragmento','Estatuilla','Pergamino','Lente','Diente','Garra','Cuerno','Ala','Ojo','Corazón','Lengua','Uña','Púa','Trono'];
const SUFFIXES = ['de la Ruina','del Abismo','de la Fortuna','de la Sombra','del Crupier','de las Cinco','del Jackpot','de la Ruleta','del Rey','de la Reina','del Diablo','de la Luna','del Sol Negro','de la Niebla','del Eco','de la Sed','del Hambre','de la Mentira','de la Verdad','del Silencio','del Trueno','de la Bruma','del Vacio','de la Sangre','del Oráculo','del Tahúr','del Apostador','de la Mesa','del Paño','de la Ficha'];
const ICONS = ['🎲','🪙','💍','🔮','🗝️','💀','👑','🗡️','🪞','💎','🃏','🂡','🧿','📿','🕯️','📜','🦴','🩸','🌑','⚡','🔥','❄️','🌪️','👁️','🖤','♠️','♥️','♦️','♣️','🏆','🧧','🪬','🐺','🐍','🦂','🦇','🕷️','🧪','⚖️','⌛'];

/* Ability pool - each item gets 1-3 random abilities */
const ABILITY_DEFS = [
  { key:'mult',      label:v=>`Premios ×${v.toFixed(2)}`,           gen:(r)=>+(1+r*0.12+Math.random()*r*0.2).toFixed(3) },
  { key:'luck',      label:v=>`Suerte +${Math.round(v*100)}%`,     gen:(r)=>+(0.01+r*0.04+Math.random()*r*0.08).toFixed(3) },
  { key:'slotLuck',  label:v=>`Tragaperras suerte +${Math.round(v*100)}%`, gen:(r)=>+(0.02+r*0.05+Math.random()*0.08).toFixed(3) },
  { key:'slotMult',  label:v=>`Tragaperras ×${v.toFixed(2)}`,      gen:(r)=>+(1.05+r*0.15+Math.random()*0.2).toFixed(3) },
  { key:'bjMult',    label:v=>`Blackjack ×${v.toFixed(2)}`,        gen:(r)=>+(1.05+r*0.12+Math.random()*0.18).toFixed(3) },
  { key:'bjSoft',    label:v=>`Blackjack +${v} vs soft`,           gen:(r)=>1 },
  { key:'rouletteMult', label:v=>`Ruleta ×${v.toFixed(2)}`,       gen:(r)=>+(1.05+r*0.12+Math.random()*0.2).toFixed(3) },
  { key:'rouletteLuck', label:v=>`Ruleta suerte +${Math.round(v*100)}%`, gen:(r)=>+(0.02+r*0.06).toFixed(3) },
  { key:'pokerMult', label:v=>`Poker ×${v.toFixed(2)}`,           gen:(r)=>+(1.05+r*0.15+Math.random()*0.2).toFixed(3) },
  { key:'horseLuck', label:v=>`Caballos suerte +${Math.round(v*100)}%`, gen:(r)=>+(0.03+r*0.08).toFixed(3) },
  { key:'horseMult', label:v=>`Caballos ×${v.toFixed(2)}`,        gen:(r)=>+(1.1+r*0.2+Math.random()*0.25).toFixed(3) },
  { key:'lossReduce',label:v=>`Pérdidas -${Math.round(v*100)}%`,  gen:(r)=>+(0.05+r*0.1+Math.random()*0.1).toFixed(3) },
  { key:'critChance',label:v=>`Crítico ${Math.round(v*100)}% (×2)`, gen:(r)=>+(0.03+r*0.07).toFixed(3) },
  { key:'freeSpin',  label:v=>`Giro gratis ${Math.round(v*100)}%`, gen:(r)=>+(0.02+r*0.05).toFixed(3) },
  { key:'dropBoost', label:v=>`Más reliquias +${Math.round(v*100)}%`, gen:(r)=>+(0.05+r*0.12).toFixed(3) },
  { key:'startBoost',label:v=>`+${v}€ al ganar`,                  gen:(r)=>Math.floor(5+r*40+Math.random()*30) },
  { key:'insurance', label:v=>`Seguro de apuesta ${Math.round(v*100)}%`, gen:(r)=>+(0.05+r*0.1).toFixed(3) },
  { key:'allGames',  label:v=>`Todos los juegos ×${v.toFixed(2)}`, gen:(r)=>+(1.03+r*0.1+Math.random()*0.12).toFixed(3) }
];

const RARITIES = [
  { id:'common',    name:'Común',      weight:48, color:'#9ca3af', rank:0 },
  { id:'uncommon',  name:'Poco común', weight:28, color:'#22c55e', rank:1 },
  { id:'rare',      name:'Raro',       weight:14, color:'#3b82f6', rank:2 },
  { id:'epic',      name:'Épico',      weight:7,  color:'#a855f7', rank:3 },
  { id:'legendary', name:'Legendario', weight:3,  color:'#f59e0b', rank:4 }
];

function weightedRarity() {
  const t = RARITIES.reduce((s,r)=>s+r.weight,0);
  let r = Math.random()*t;
  for (const rar of RARITIES) { r -= rar.weight; if (r<=0) return rar; }
  return RARITIES[0];
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function rand(a,b){ return a+Math.random()*(b-a); }

function generateItem() {
  const rar = weightedRarity();
  const nAb = rar.rank <= 1 ? 1 : rar.rank <= 2 ? 1+Math.floor(Math.random()*2) : 2+Math.floor(Math.random()*2);
  const shuffled = [...ABILITY_DEFS].sort(()=>Math.random()-0.5);
  const effects = {};
  const labels = [];
  for (let i=0;i<nAb && i<shuffled.length;i++) {
    const def = shuffled[i];
    const v = def.gen(rar.rank);
    effects[def.key] = v;
    labels.push(def.label(v));
  }
  const name = `${pick(PREFIXES)} ${pick(NOUNS)} ${pick(SUFFIXES)}`;
  const sell = Math.floor(20 + rar.rank*40 + Math.random()*30*(rar.rank+1));
  return {
    id: 'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
    name, icon: pick(ICONS), rarity: rar.id, rarityName: rar.name, color: rar.color,
    effects, effectsText: labels.join(' · '),
    desc: `Reliquia ${rar.name.toLowerCase()}. El casino la soltó a regañadientes.`,
    sell
  };
}

function getBonuses() {
  const b = {
    mult:1, luck:0, slotLuck:0, slotMult:1, bjMult:1, bjSoft:0,
    rouletteMult:1, rouletteLuck:0, pokerMult:1, horseLuck:0, horseMult:1,
    lossReduce:0, critChance:0, freeSpin:0, dropBoost:0, startBoost:0, insurance:0, allGames:1
  };
  for (const it of S.equipment) {
    for (const [k,v] of Object.entries(it.effects||{})) {
      if (k.endsWith('Mult') || k==='mult' || k==='allGames') b[k] = (b[k]||1) * v;
      else b[k] = (b[k]||0) + v;
    }
  }
  b.mult = Math.min(b.mult * b.allGames, 10);
  b.luck = Math.min(b.luck, 0.6);
  return b;
}

function applyWin(amount, gameKey) {
  const b = getBonuses();
  let m = b.mult;
  if (gameKey==='slots') m *= b.slotMult;
  if (gameKey==='bj') m *= b.bjMult;
  if (gameKey==='roulette') m *= b.rouletteMult;
  if (gameKey==='poker') m *= b.pokerMult;
  if (gameKey==='horses') m *= b.horseMult;
  let win = Math.floor(amount * m);
  if (Math.random() < b.critChance) win = Math.floor(win * 2);
  if (b.startBoost) win += b.startBoost;
  return win;
}

function applyLoss(bet) {
  const b = getBonuses();
  if (Math.random() < b.insurance) return 0; // full refund
  const reduced = Math.floor(bet * (1 - Math.min(b.lossReduce, 0.5)));
  return reduced;
}

/* ===== AUDIO ===== */
const MUSIC_TRACKS = [
  'audio/Royal%20Casino%20Palace1.mp3',
  'audio/Royal%20Casino%20Palace2.mp3'
];
let musicIdx = 0;
const bgMusic = document.getElementById('bg-music');
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if (audioCtx.state==='suspended') audioCtx.resume();
}

function sfx(type) {
  if (S.settings.muted || S.settings.sfx<=0) return;
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    const vol = S.settings.sfx * 0.18;
    if (type==='click') {
      osc.type='sine'; osc.frequency.value=520;
      g.gain.setValueAtTime(vol*0.35,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.05);
      osc.start(now); osc.stop(now+0.05);
    } else if (type==='coin') {
      osc.type='sine'; osc.frequency.setValueAtTime(880,now); osc.frequency.exponentialRampToValueAtTime(1320,now+0.1);
      g.gain.setValueAtTime(vol,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.12);
      osc.start(now); osc.stop(now+0.12);
    } else if (type==='win') {
      osc.type='triangle';
      [523,659,784,1046].forEach((f,i)=>osc.frequency.setValueAtTime(f,now+i*0.07));
      g.gain.setValueAtTime(vol,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.4);
      osc.start(now); osc.stop(now+0.4);
    } else if (type==='lose') {
      osc.type='sawtooth'; osc.frequency.setValueAtTime(280,now); osc.frequency.exponentialRampToValueAtTime(70,now+0.25);
      g.gain.setValueAtTime(vol*0.45,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.25);
      osc.start(now); osc.stop(now+0.25);
    }
  } catch(e){}
}

function applyVolumes() {
  bgMusic.volume = S.settings.muted ? 0 : S.settings.music;
}

function playMusic() {
  bgMusic.src = MUSIC_TRACKS[musicIdx];
  applyVolumes();
  bgMusic.play().catch(()=>{});
}
bgMusic.addEventListener('ended', () => {
  musicIdx = (musicIdx + 1) % MUSIC_TRACKS.length;
  playMusic();
});

/* ===== SAVE ===== */
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e){}
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      Object.assign(S, d);
      if (!S.equipment) S.equipment = [];
      if (!S.backpack) S.backpack = [];
      if (!S.discovered) S.discovered = [];
      return true;
    }
  } catch(e){}
  return false;
}

function fmt(n){ return Math.floor(n).toLocaleString('es-ES') + ' €'; }
function floatTxt(txt, color='text-emerald-400') {
  const el = document.createElement('div');
  el.className = `float-txt ${color} text-lg`;
  el.textContent = txt;
  el.style.left = (window.innerWidth/2-40)+'px';
  el.style.top = (window.innerHeight/2-20)+'px';
  document.getElementById('fx').appendChild(el);
  setTimeout(()=>el.remove(), 1300);
}

function updateHub() {
  document.getElementById('hub-name').textContent = S.name;
  document.getElementById('hub-money').textContent = fmt(S.money);
  document.getElementById('game-money').textContent = fmt(S.money);
  const b = getBonuses();
  document.getElementById('st-games').textContent = S.stats.games;
  document.getElementById('st-won').textContent = fmt(S.stats.won);
  document.getElementById('st-lost').textContent = fmt(S.stats.lost);
  document.getElementById('st-items').textContent = S.stats.itemsFound;
  document.getElementById('st-mult').textContent = '×' + b.mult.toFixed(2);
  document.getElementById('st-luck').textContent = '+' + Math.round(b.luck*100) + '%';
  document.getElementById('album-count').textContent = S.discovered.length;
  renderInventory();
  renderAlbum();
}

function registerDiscovered(item) {
  if (S.discovered.some(d => d.name === item.name && d.icon === item.icon)) return;
  S.discovered.push({
    icon: item.icon, name: item.name, rarity: item.rarity,
    rarityName: item.rarityName, color: item.color, effectsText: item.effectsText
  });
}

function tryDropItem(won) {
  const b = getBonuses();
  let chance = won ? 0.22 : 0.06;
  chance += b.dropBoost || 0;
  if (Math.random() > chance) return;
  if (S.backpack.length >= 5) {
    floatTxt('Mochila llena', 'text-amber-400');
    return;
  }
  const item = generateItem();
  S.backpack.push(item);
  S.stats.itemsFound++;
  registerDiscovered(item);
  floatTxt(item.icon + ' ¡Reliquia!', 'text-purple-300');
  sfx('win');
  save();
  updateHub();
}

/* ===== INVENTORY UI ===== */
let selectedItem = null; // {where:'equip'|'back', idx:n}

function renderInventory() {
  const eq = document.getElementById('equip-grid');
  const bp = document.getElementById('backpack-grid');
  const empty = document.getElementById('inv-empty');

  eq.innerHTML = '';
  for (let i=0;i<5;i++) {
    const it = S.equipment[i];
    const cell = document.createElement('button');
    cell.className = `inv-cell equip-slot glass rounded-lg border-2 flex items-center justify-center text-2xl ${it?'filled rarity-'+it.rarity:''}`;
    cell.innerHTML = it ? it.icon : '<span class="text-gray-700 text-xs">+</span>';
    if (it) {
      cell.onclick = () => { sfx('click'); selectedItem={where:'equip',idx:i}; showDetail(it, true); };
    }
    eq.appendChild(cell);
  }

  bp.innerHTML = '';
  if (!S.backpack.length) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    S.backpack.forEach((it,i) => {
      const cell = document.createElement('button');
      cell.className = `inv-cell glass rounded-lg border-2 flex items-center justify-center text-2xl rarity-${it.rarity}`;
      cell.textContent = it.icon;
      cell.onclick = () => { sfx('click'); selectedItem={where:'back',idx:i}; showDetail(it, false); };
      bp.appendChild(cell);
    });
  }
}

function showDetail(it, isEquipped) {
  const det = document.getElementById('item-detail');
  det.classList.remove('hidden');
  document.getElementById('detail-icon').textContent = it.icon;
  document.getElementById('detail-name').textContent = it.name;
  document.getElementById('detail-rarity').textContent = it.rarityName;
  document.getElementById('detail-rarity').style.color = it.color;
  document.getElementById('detail-desc').textContent = it.desc;
  document.getElementById('detail-effects').textContent = it.effectsText;
  document.getElementById('detail-value').textContent = 'Venta: ' + fmt(it.sell);

  const btnEq = document.getElementById('btn-equip');
  const btnUn = document.getElementById('btn-unequip');
  if (isEquipped) {
    btnEq.classList.add('hidden');
    btnUn.classList.remove('hidden');
  } else {
    btnEq.classList.remove('hidden');
    btnUn.classList.add('hidden');
  }
}

document.getElementById('btn-equip').onclick = () => {
  if (!selectedItem || selectedItem.where!=='back') return;
  if (S.equipment.length >= 5) return floatTxt('Equipo lleno','text-rose-400');
  sfx('coin');
  const it = S.backpack.splice(selectedItem.idx, 1)[0];
  S.equipment.push(it);
  selectedItem = null;
  document.getElementById('item-detail').classList.add('hidden');
  save(); updateHub();
};

document.getElementById('btn-unequip').onclick = () => {
  if (!selectedItem || selectedItem.where!=='equip') return;
  if (S.backpack.length >= 5) return floatTxt('Mochila llena','text-rose-400');
  sfx('click');
  const it = S.equipment.splice(selectedItem.idx, 1)[0];
  S.backpack.push(it);
  selectedItem = null;
  document.getElementById('item-detail').classList.add('hidden');
  save(); updateHub();
};

document.getElementById('btn-sell').onclick = () => {
  if (!selectedItem) return;
  sfx('coin');
  let it;
  if (selectedItem.where==='equip') it = S.equipment.splice(selectedItem.idx,1)[0];
  else it = S.backpack.splice(selectedItem.idx,1)[0];
  S.money += it.sell;
  floatTxt('+'+fmt(it.sell),'text-emerald-400');
  selectedItem = null;
  document.getElementById('item-detail').classList.add('hidden');
  save(); updateHub();
};

function renderAlbum() {
  const g = document.getElementById('album-grid');
  if (!S.discovered.length) {
    g.innerHTML = '<p class="col-span-full text-gray-600 text-xs text-center py-4">Aún no has descubierto reliquias.</p>';
    return;
  }
  g.innerHTML = S.discovered.map(d => `
    <div class="inv-cell glass rounded-lg border-2 rarity-${d.rarity} flex flex-col items-center justify-center p-1" title="${d.name}\n${d.effectsText}">
      <span class="text-xl">${d.icon}</span>
    </div>
  `).join('');
}

/* ===== NUMPAD ===== */
function buildNumpad(def) {
  return `
    <div class="glass rounded-xl p-3 mb-3">
      <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Apuesta</div>
      <div id="np-display" class="text-2xl font-bold text-emerald-400 mb-2 tabular-nums">${fmt(def)}</div>
      <div class="grid grid-cols-3 gap-1.5">
        ${[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k=>`
          <button class="numpad-btn h-11 rounded-lg bg-black/50 border border-white/10 font-bold text-lg active:bg-gold-500/30" data-k="${k}">${k}</button>
        `).join('')}
      </div>
      <div class="grid grid-cols-4 gap-1.5 mt-2">
        ${[25,50,100,250].map(q=>`<button class="numpad-btn py-1.5 rounded-lg bg-slate-800 text-xs font-semibold border border-white/10" data-q="${q}">${q}</button>`).join('')}
      </div>
    </div>
    <button id="np-go" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-bold text-lg shadow active:scale-[0.98]">Confirmar</button>
  `;
}
function wireNumpad(onConfirm, startVal) {
  let val = String(startVal||100);
  const disp = document.getElementById('np-display');
  const update = () => { if(disp) disp.textContent = fmt(+val||0); };
  update();
  document.querySelectorAll('.numpad-btn[data-k]').forEach(btn => {
    btn.onclick = () => {
      sfx('click');
      const k = btn.dataset.k;
      if (k==='C') val='0';
      else if (k==='⌫') val = val.slice(0,-1)||'0';
      else { if(val==='0') val=k; else if(val.length<7) val+=k; }
      update();
    };
  });
  document.querySelectorAll('.numpad-btn[data-q]').forEach(btn => {
    btn.onclick = () => { sfx('click'); val=btn.dataset.q; update(); };
  });
  const go = document.getElementById('np-go');
  if (go) go.onclick = () => {
    const n = parseInt(val,10)||0;
    if (n<1) return floatTxt('Mínimo 1 €','text-rose-400');
    if (n>S.money) return floatTxt('Fondos insuficientes','text-rose-400');
    onConfirm(n);
  };
}

/* ===== OPEN / CLOSE GAME ===== */
function openGame(type) {
  sfx('click');
  const modal = document.getElementById('modal-game');
  document.getElementById('game-title').textContent = {
    slots:'🎰 Tragaperras 3×3', blackjack:'🃏 Blackjack', roulette:'🎡 Ruleta',
    poker:'♠️ Video Poker', horses:'🏇 Carrera'
  }[type]||'Juego';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const body = document.getElementById('game-body');
  if (type==='slots') renderSlots(body);
  else if (type==='blackjack') renderBJ(body);
  else if (type==='roulette') renderRoulette(body);
  else if (type==='poker') renderPoker(body);
  else if (type==='horses') renderHorses(body);
}
function closeGame() {
  sfx('click');
  document.getElementById('modal-game').classList.add('hidden');
  document.getElementById('modal-game').classList.remove('flex');
  document.getElementById('game-body').innerHTML = '';
  updateHub();
}

/* ========== SLOTS 3x3 middle line ========== */
function renderSlots(body) {
  const symbols = ['🍒','🍋','🔔','💎','7️⃣','⭐','👑','💀'];
  body.innerHTML = `
    <div class="max-w-md mx-auto space-y-3">
      <div class="bg-black/80 border-2 border-gold-600 rounded-2xl p-3">
        <div class="grid grid-cols-3 gap-1.5 mb-2" id="slot-grid">
          ${[0,1,2,3,4,5,6,7,8].map(i=>`
            <div class="slot-cell ${i>=3&&i<=5?'payline':''}" id="sc${i}">❓</div>
          `).join('')}
        </div>
        <div class="text-[10px] text-center text-gold-500/80 mb-1">Línea de pago → fila central</div>
        <div id="slot-msg" class="text-center text-sm text-gold-300 min-h-[1.3rem] font-medium"></div>
      </div>
      <div id="slot-bet">${buildNumpad(50)}</div>
    </div>
  `;
  wireNumpad((bet) => {
    const b = getBonuses();
    // free spin?
    let cost = bet;
    if (Math.random() < b.freeSpin) {
      cost = 0;
      floatTxt('¡Giro gratis!','text-gold-300');
    }
    if (cost > S.money) return floatTxt('Fondos insuficientes','text-rose-400');
    S.money -= cost; S.stats.games++; updateHub(); save();
    document.getElementById('slot-bet').style.pointerEvents='none';
    document.getElementById('slot-msg').textContent = 'Girando…';
    sfx('click');
    let n=0;
    const iv = setInterval(()=>{
      for(let i=0;i<9;i++) document.getElementById('sc'+i).textContent = pick(symbols);
      if(++n>16){
        clearInterval(iv);
        const grid = [];
        for(let i=0;i<9;i++) grid.push(pick(symbols));
        // luck on middle row
        const luck = b.luck + b.slotLuck;
        if (Math.random() < 0.1 + luck) {
          grid[3]=grid[4]=grid[5]=pick(symbols);
        } else if (Math.random() < 0.2 + luck*0.5) {
          grid[4]=grid[3];
        }
        for(let i=0;i<9;i++) document.getElementById('sc'+i).textContent = grid[i];
        const a=grid[3], c=grid[4], d=grid[5];
        let win=0, msg='Sin premio en la línea…';
        if (a===c && c===d) {
          const base = a==='7️⃣'?35:a==='👑'?22:a==='💎'?15:8;
          win = applyWin(bet*base, 'slots');
          msg = `¡TRIPLE ${a}! +${fmt(win)}`;
        } else if (a===c || c===d || a===d) {
          win = applyWin(bet*2, 'slots');
          msg = `¡Pareja en línea! +${fmt(win)}`;
        }
        const msgEl = document.getElementById('slot-msg');
        if (win>0) {
          S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
          msgEl.className='text-center text-sm text-emerald-400 min-h-[1.3rem] font-medium';
          tryDropItem(true);
        } else {
          const realLoss = cost > 0 ? applyLoss(bet) : 0;
          // if insurance refunded partially already handled; track lost as bet paid
          if (cost>0) S.stats.lost += cost;
          sfx('lose');
          msgEl.className='text-center text-sm text-rose-400 min-h-[1.3rem] font-medium';
          tryDropItem(false);
        }
        msgEl.textContent = msg;
        save(); updateHub();
        setTimeout(()=>{
          document.getElementById('slot-bet').style.pointerEvents='';
          document.getElementById('slot-bet').innerHTML = buildNumpad(bet);
          wireNumpad(arguments.callee, bet);
          // re-bind cleanly by re-calling setup without full reset of reels
          const lastBet = bet;
          wireNumpad((b2)=>{ /* overwritten below */ });
          // simplest: re-render bet area only
          const area = document.getElementById('slot-bet');
          area.innerHTML = buildNumpad(lastBet);
          wireNumpad((b2) => {
            // recursive entry - call same logic by triggering spin again
            // re-attach by re-running the outer handler via a named function
            spinSlots(b2);
          }, lastBet);
        }, 1000);
      }
    }, 65);

    function spinSlots(bet2) {
      // re-entry after first spin without full page reset
      const b2 = getBonuses();
      let cost2 = bet2;
      if (Math.random() < b2.freeSpin) { cost2=0; floatTxt('¡Giro gratis!','text-gold-300'); }
      if (cost2 > S.money) return floatTxt('Fondos insuficientes','text-rose-400');
      S.money -= cost2; S.stats.games++; updateHub(); save();
      document.getElementById('slot-bet').style.pointerEvents='none';
      document.getElementById('slot-msg').textContent='Girando…';
      sfx('click');
      let n2=0;
      const iv2 = setInterval(()=>{
        for(let i=0;i<9;i++) document.getElementById('sc'+i).textContent=pick(symbols);
        if(++n2>16){
          clearInterval(iv2);
          const grid=[];
          for(let i=0;i<9;i++) grid.push(pick(symbols));
          const luck = b2.luck + b2.slotLuck;
          if (Math.random()<0.1+luck) grid[3]=grid[4]=grid[5]=pick(symbols);
          else if (Math.random()<0.2+luck*0.5) grid[4]=grid[3];
          for(let i=0;i<9;i++) document.getElementById('sc'+i).textContent=grid[i];
          const a=grid[3],c=grid[4],d=grid[5];
          let win=0,msg='Sin premio en la línea…';
          if(a===c&&c===d){
            const base=a==='7️⃣'?35:a==='👑'?22:a==='💎'?15:8;
            win=applyWin(bet2*base,'slots'); msg=`¡TRIPLE ${a}! +${fmt(win)}`;
          } else if(a===c||c===d||a===d){
            win=applyWin(bet2*2,'slots'); msg=`¡Pareja en línea! +${fmt(win)}`;
          }
          const msgEl=document.getElementById('slot-msg');
          if(win>0){
            S.money+=win; S.stats.won+=win; sfx('win'); floatTxt('+'+fmt(win));
            msgEl.className='text-center text-sm text-emerald-400 min-h-[1.3rem] font-medium';
            tryDropItem(true);
          } else {
            if(cost2>0) S.stats.lost+=cost2; sfx('lose');
            msgEl.className='text-center text-sm text-rose-400 min-h-[1.3rem] font-medium';
            tryDropItem(false);
          }
          msgEl.textContent=msg; save(); updateHub();
          setTimeout(()=>{
            document.getElementById('slot-bet').style.pointerEvents='';
            document.getElementById('slot-bet').innerHTML=buildNumpad(bet2);
            wireNumpad(spinSlots, bet2);
          },1000);
        }
      },65);
    }
  }, 50);
}

/* ========== BLACKJACK ========== */
function createDeck() {
  const suits=['♠','♥','♦','♣'], vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d=[];
  for(const s of suits) for(const v of vals) d.push({v,s,red:s==='♥'||s==='♦'});
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
  return d;
}
function handVal(h){
  let t=0,a=0;
  for(const c of h){ if(c.v==='A'){a++;t+=11;} else if(['J','Q','K'].includes(c.v)) t+=10; else t+=+c.v; }
  while(t>21&&a){t-=10;a--;}
  return t;
}
function cardHtml(c,hide){
  if(hide) return `<div class="w-12 h-16 rounded-md bg-slate-800 border-2 border-gold-600 flex items-center justify-center text-gold-500 text-lg">🂠</div>`;
  return `<div class="card-face w-12 h-16 flex flex-col items-center justify-center text-sm font-bold ${c.red?'text-red-600':'text-slate-900'}"><span>${c.v}</span><span class="text-base">${c.s}</span></div>`;
}

function renderBJ(body) {
  let deck, player, dealer, bet=0, phase='bet';

  function ui() {
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="bg-gradient-to-b from-green-950 to-green-900/40 border border-green-800/50 rounded-2xl p-4 min-h-[190px]">
          <div class="text-[10px] text-green-300/70 mb-1">Crupier ${phase==='done'?'('+handVal(dealer)+')':''}</div>
          <div class="flex gap-1.5 mb-3 min-h-[64px]">${(dealer||[]).map((c,i)=>cardHtml(c, phase==='play'&&i===1)).join('')||'—'}</div>
          <hr class="border-green-800/40 my-2">
          <div class="text-[10px] text-green-300/70 mb-1">Tú ${player?'('+handVal(player)+')':''}</div>
          <div class="flex gap-1.5 min-h-[64px]">${(player||[]).map(c=>cardHtml(c)).join('')||'—'}</div>
        </div>
        <div id="bj-msg" class="text-center text-sm font-medium min-h-[1.2rem] text-gold-300"></div>
        <div id="bj-ctrl"></div>
      </div>`;
    const ctrl = document.getElementById('bj-ctrl');
    if (phase==='bet') {
      ctrl.innerHTML = buildNumpad(100);
      wireNumpad((b)=>{
        bet=b; S.money-=bet; S.stats.games++;
        deck=createDeck(); player=[deck.pop(),deck.pop()]; dealer=[deck.pop(),deck.pop()];
        phase='play'; save(); updateHub(); ui();
        if(handVal(player)===21) finish(true,true);
      },100);
    } else if (phase==='play') {
      ctrl.innerHTML = `<div class="grid grid-cols-3 gap-2">
        <button id="bj-hit" class="py-3 rounded-xl bg-blue-700 font-bold text-sm">Pedir</button>
        <button id="bj-stand" class="py-3 rounded-xl bg-amber-700 font-bold text-sm">Plantarse</button>
        <button id="bj-dbl" class="py-3 rounded-xl bg-purple-700 font-bold text-sm">Doblar</button>
      </div>`;
      document.getElementById('bj-hit').onclick=()=>{ sfx('click'); player.push(deck.pop()); if(handVal(player)>21) finish(false); else ui(); };
      document.getElementById('bj-stand').onclick=()=>{ sfx('click'); dealerTurn(); };
      document.getElementById('bj-dbl').onclick=()=>{
        if(S.money<bet) return floatTxt('Sin fondos','text-rose-400');
        S.money-=bet; bet*=2; updateHub();
        player.push(deck.pop());
        if(handVal(player)>21) finish(false); else dealerTurn();
      };
    } else {
      ctrl.innerHTML = `<button id="bj-again" class="w-full py-3 rounded-xl bg-gold-600 text-black font-bold">Otra mano</button>`;
      document.getElementById('bj-again').onclick=()=>{ phase='bet'; player=null; dealer=null; ui(); };
    }
  }

  function dealerTurn() {
    phase='done';
    while(handVal(dealer)<17) dealer.push(deck.pop());
    const pv=handVal(player), dv=handVal(dealer);
    if(dv>21 || pv>dv) finish(true);
    else if(pv===dv){ S.money+=bet; sfx('coin'); document.getElementById('bj-msg').textContent='Empate.'; save(); updateHub(); ui(); }
    else finish(false);
  }

  function finish(won, bj) {
    phase='done';
    const msg = document.getElementById('bj-msg');
    if (won) {
      // net winnings on top of stake return
      const pure = applyWin(bj ? bet * 1.5 : bet, 'bj');
      S.money += pure + bet;
      S.stats.won += pure;
      sfx('win'); floatTxt('+'+fmt(pure));
      msg.textContent = bj?`¡BLACKJACK! +${fmt(pure)}`:`¡Ganas! +${fmt(pure)}`;
      msg.className='text-center text-sm font-medium min-h-[1.2rem] text-emerald-400';
      tryDropItem(true);
    } else {
      S.stats.lost += bet; sfx('lose');
      msg.textContent = handVal(player)>21?'Te pasaste.':'El crupier gana.';
      msg.className='text-center text-sm font-medium min-h-[1.2rem] text-rose-400';
      tryDropItem(false);
    }
    save(); updateHub(); ui();
  }

  ui();
}

/* ========== ROULETTE with board + chips ========== */
function renderRoulette(body) {
  const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const CHIPS = [1,2,5,10,25,50,100];
  let chip = 10;
  let bets = {}; // key -> amount
  let spinning = false;

  function totalBet(){ return Object.values(bets).reduce((a,b)=>a+b,0); }

  function boardHtml() {
    // European layout simplified: 3 columns of 12 + 0
    let nums = '';
    // order display rows top to bottom: 3,2,1 pattern
    for (let row=0; row<12; row++) {
      for (let col=3; col>=1; col--) {
        const n = row*3 + col;
        const color = reds.has(n)?'red':'black';
        const sel = bets['n'+n] ? 'selected' : '';
        nums += `<button data-bet="n${n}" class="rt-num rt-cell ${color} ${sel} rounded px-0.5">${n}${bets['n'+n]?'<br><span class="text-[8px] text-gold-300">'+bets['n'+n]+'</span>':''}</button>`;
      }
    }
    return `
      <div class="max-w-md mx-auto space-y-2">
        <div class="flex justify-center mb-1">
          <div id="rwheel" class="w-24 h-24 rounded-full border-4 border-gold-500 bg-gradient-to-br from-slate-900 to-blood-900 flex items-center justify-center text-3xl transition-transform duration-[3.5s] cubic-bezier(0.15,0.85,0.35,1)">🎯</div>
        </div>
        <div id="r-result" class="text-center font-bold text-sm min-h-[1.2rem]"></div>
        <div class="flex gap-1 justify-center mb-1">
          <button data-bet="0" class="rt-num rt-cell green rounded px-3 ${bets['0']?'selected':''}">0 ${bets['0']?'('+bets['0']+')':''}</button>
        </div>
        <div class="grid grid-cols-3 gap-0.5">${nums}</div>
        <div class="grid grid-cols-3 gap-1 mt-1">
          <button data-bet="red" class="rt-cell py-2 rounded bg-rose-800 text-xs font-bold ${bets.red?'outline outline-2 outline-gold-400':''}">Rojo ×2 ${bets.red?'('+bets.red+')':''}</button>
          <button data-bet="black" class="rt-cell py-2 rounded bg-slate-800 text-xs font-bold ${bets.black?'outline outline-2 outline-gold-400':''}">Negro ×2 ${bets.black?'('+bets.black+')':''}</button>
          <button data-bet="even" class="rt-cell py-2 rounded bg-slate-800 text-xs font-bold ${bets.even?'outline outline-2 outline-gold-400':''}">Par ×2 ${bets.even?'('+bets.even+')':''}</button>
          <button data-bet="odd" class="rt-cell py-2 rounded bg-slate-800 text-xs font-bold ${bets.odd?'outline outline-2 outline-gold-400':''}">Impar ×2 ${bets.odd?'('+bets.odd+')':''}</button>
          <button data-bet="low" class="rt-cell py-2 rounded bg-slate-800 text-xs font-bold ${bets.low?'outline outline-2 outline-gold-400':''}">1-18 ×2 ${bets.low?'('+bets.low+')':''}</button>
          <button data-bet="high" class="rt-cell py-2 rounded bg-slate-800 text-xs font-bold ${bets.high?'outline outline-2 outline-gold-400':''}">19-36 ×2 ${bets.high?'('+bets.high+')':''}</button>
        </div>
        <div class="flex flex-wrap gap-1.5 justify-center items-center mt-2">
          <span class="text-[10px] text-gray-500">Ficha:</span>
          ${CHIPS.map(c=>`<button class="chip-btn w-10 h-10 rounded-full font-bold text-xs border-2 ${chip===c?'border-gold-400 bg-gold-500/30 text-gold-300':'border-white/20 bg-black/50'}" data-chip="${c}">${c}</button>`).join('')}
        </div>
        <div class="text-center text-xs text-gray-400">Total apostado: <span class="text-emerald-400 font-bold" id="r-total">${totalBet()} €</span></div>
        <div class="grid grid-cols-2 gap-2">
          <button id="r-clear" class="py-2.5 rounded-xl bg-slate-800 text-sm font-semibold">Limpiar</button>
          <button id="r-spin" class="py-2.5 rounded-xl bg-emerald-600 text-sm font-bold">Girar</button>
        </div>
      </div>`;
  }

  function draw() {
    body.innerHTML = boardHtml();
    document.querySelectorAll('.chip-btn').forEach(btn=>{
      btn.onclick=()=>{ sfx('click'); chip=+btn.dataset.chip; draw(); };
    });
    document.querySelectorAll('.rt-cell').forEach(btn=>{
      btn.onclick=()=>{
        if(spinning) return;
        sfx('click');
        const k = btn.dataset.bet;
        if (!k) return;
        const next = (bets[k]||0) + chip;
        if (totalBet() - (bets[k]||0) + next > S.money) return floatTxt('Fondos insuficientes','text-rose-400');
        bets[k] = next;
        draw();
      };
    });
    document.getElementById('r-clear').onclick=()=>{ sfx('click'); bets={}; draw(); };
    document.getElementById('r-spin').onclick=()=>{
      if(spinning) return;
      const tot = totalBet();
      if(tot<1) return floatTxt('Coloca fichas','text-rose-400');
      if(tot>S.money) return floatTxt('Fondos insuficientes','text-rose-400');
      spinning=true;
      S.money -= tot; S.stats.games++; updateHub(); save();
      sfx('click');
      const wheel = document.getElementById('rwheel');
      wheel.style.transform = `rotate(${1800+Math.random()*360}deg)`;
      setTimeout(()=>{
        const num = Math.floor(Math.random()*37);
        const isRed = reds.has(num);
        const isBlack = num!==0 && !isRed;
        document.getElementById('r-result').innerHTML =
          `<span class="${isRed?'text-rose-400':num===0?'text-emerald-400':'text-gray-300'}">${num} · ${num===0?'Verde':isRed?'Rojo':'Negro'}</span>`;

        const b = getBonuses();
        let payout = 0;
        // number straight 35:1 + stake
        if (bets['n'+num]) payout += bets['n'+num] * 36;
        if (bets['0'] && num===0) payout += bets['0'] * 36;
        if (bets.red && isRed) payout += bets.red * 2;
        if (bets.black && isBlack) payout += bets.black * 2;
        if (bets.even && num!==0 && num%2===0) payout += bets.even * 2;
        if (bets.odd && num!==0 && num%2===1) payout += bets.odd * 2;
        if (bets.low && num>=1 && num<=18) payout += bets.low * 2;
        if (bets.high && num>=19 && num<=36) payout += bets.high * 2;
        // luck nudge: small chance to boost if close
        if (payout===0 && Math.random()< (b.luck+b.rouletteLuck)*0.12) {
          // consolation half red/black style
          payout = Math.floor(tot * 0.5);
        }

        if (payout > 0) {
          // apply mult to net win
          const net = payout - tot;
          const scaled = net > 0 ? applyWin(net, 'roulette') + tot : payout;
          S.money += scaled;
          S.stats.won += Math.max(0, scaled - tot);
          sfx('win'); floatTxt('+'+fmt(scaled));
          tryDropItem(true);
        } else {
          S.stats.lost += tot; sfx('lose');
          tryDropItem(false);
        }
        bets = {};
        spinning = false;
        save(); updateHub();
        setTimeout(draw, 1200);
      }, 3600);
    };
  }
  draw();
}

/* ========== POKER ========== */
function evalPoker(hand) {
  const counts={};
  hand.forEach(c=>counts[c.v]=(counts[c.v]||0)+1);
  const vals=Object.values(counts);
  if(vals.includes(4)) return {name:'Póker',m:25};
  if(vals.includes(3)&&vals.includes(2)) return {name:'Full',m:9};
  if(vals.includes(3)) return {name:'Trío',m:3};
  if(vals.filter(v=>v===2).length===2) return {name:'Doble pareja',m:2};
  if(vals.includes(2)) return {name:'Pareja',m:1.5};
  return {name:'Nada',m:0};
}

function renderPoker(body) {
  let deck, hand, holds, phase='bet', bet=0;

  function ui() {
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="bg-gradient-to-b from-green-950 to-black/60 border border-green-800/40 rounded-2xl p-4">
          <div class="text-[10px] text-green-300/60 mb-2 text-center">${phase==='hold'?'Toca para MANTENER':'Tu mano'}</div>
          <div id="pk-cards" class="flex justify-center gap-1.5 min-h-[70px]">
            ${(hand||[]).map((c,i)=>`
              <button data-i="${i}" class="card-face w-[52px] h-[72px] flex flex-col items-center justify-center text-sm font-bold ${c.red?'text-red-600':'text-slate-900'} ${holds&&holds[i]?'ring-2 ring-gold-400 scale-105':''}">
                ${holds&&holds[i]?'<span class="text-[8px] text-amber-600 font-black">HOLD</span>':''}
                <span>${c.v}</span><span>${c.s}</span>
              </button>`).join('')||'—'}
          </div>
          <div id="pk-eval" class="text-center text-gold-300 text-sm mt-2 font-medium min-h-[1.2rem]"></div>
        </div>
        <div id="pk-msg" class="text-center text-sm font-medium min-h-[1.2rem]"></div>
        <div id="pk-ctrl"></div>
      </div>`;
    const ctrl=document.getElementById('pk-ctrl');
    if(phase==='bet'){
      ctrl.innerHTML=buildNumpad(100);
      wireNumpad((b)=>{
        bet=b; S.money-=bet; S.stats.games++;
        deck=createDeck(); hand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
        holds=[false,false,false,false,false]; phase='hold';
        save(); updateHub(); ui();
      },100);
    } else if(phase==='hold'){
      document.getElementById('pk-eval').textContent=evalPoker(hand).name;
      document.querySelectorAll('#pk-cards button').forEach(btn=>{
        btn.onclick=()=>{ sfx('click'); holds[+btn.dataset.i]=!holds[+btn.dataset.i]; ui(); };
      });
      ctrl.innerHTML=`<button id="pk-draw" class="w-full py-3 rounded-xl bg-emerald-600 font-bold">Cambiar descartadas</button>`;
      document.getElementById('pk-draw').onclick=()=>{
        sfx('click');
        for(let i=0;i<5;i++) if(!holds[i]) hand[i]=deck.pop();
        const ev=evalPoker(hand);
        const pure = ev.m>0 ? applyWin(bet*ev.m, 'poker') : 0;
        document.getElementById('pk-eval').textContent=ev.name;
        const msg=document.getElementById('pk-msg');
        if(pure>0){
          S.money+=pure; S.stats.won+=pure; sfx('win'); floatTxt('+'+fmt(pure));
          msg.textContent=`¡${ev.name}! +${fmt(pure)}`;
          msg.className='text-center text-sm font-medium min-h-[1.2rem] text-emerald-400';
          tryDropItem(true);
        } else {
          S.stats.lost+=bet; sfx('lose');
          msg.textContent='Sin premio.';
          msg.className='text-center text-sm font-medium min-h-[1.2rem] text-rose-400';
          tryDropItem(false);
        }
        phase='done'; save(); updateHub(); ui();
      };
    } else {
      ctrl.innerHTML=`<button id="pk-again" class="w-full py-3 rounded-xl bg-gold-600 text-black font-bold">Otra mano</button>`;
      document.getElementById('pk-again').onclick=()=>{ phase='bet'; hand=null; ui(); };
    }
  }
  ui();
}

/* ========== HORSES — fix name change on select ========== */
const HORSE_A = ['Sombra','Trueno','Ceniza','Viento','Sangre','Fantasma','Hierro','Noche','Rayo','Bruma'];
const HORSE_B = ['Negro','Rojo','Dorado','Pálido','Salvaje','Maldito','Veloz','Eterno','Cruel','Silente'];
const HORSE_COLORS = ['#e11d48','#3b82f6','#eab308','#22c55e','#a855f7'];

function renderHorses(body) {
  // generate ONCE
  const used = new Set();
  const horses = [];
  for (let i=0;i<5;i++) {
    let name;
    do { name = pick(HORSE_A)+' '+pick(HORSE_B); } while(used.has(name));
    used.add(name);
    horses.push({ id:i, name, color:HORSE_COLORS[i], num:i+1, speed:0.7+Math.random()*0.5 });
  }
  let selected = 0;
  let racing = false;

  function ui() {
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="text-xs text-gray-500 text-center">Elige caballo y apuesta.</div>
        <div id="horse-list" class="space-y-2">
          ${horses.map((h,i)=>`
            <button data-h="${i}" class="horse-sel w-full flex items-center gap-3 p-3 rounded-xl border-2 ${selected===i?'border-gold-400 bg-gold-500/10':'border-white/10 bg-black/40'} text-left">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" style="background:${h.color}33;color:${h.color}">${h.num}</div>
              <div class="flex-1">
                <div class="font-bold text-sm">${h.name}</div>
                <div class="text-[10px] text-gray-500">Caballo #${h.num}</div>
              </div>
              <div class="text-2xl">🏇</div>
            </button>
          `).join('')}
        </div>
        <div id="race-track" class="hidden space-y-2"></div>
        <div id="race-msg" class="text-center font-bold min-h-[1.3rem]"></div>
        <div id="h-bet">${buildNumpad(50)}</div>
      </div>`;
    document.querySelectorAll('.horse-sel').forEach(btn=>{
      btn.onclick=()=>{
        if(racing) return;
        sfx('click');
        selected = +btn.dataset.h;
        // only update selection styles without regenerating names
        document.querySelectorAll('.horse-sel').forEach((b,i)=>{
          b.classList.toggle('border-gold-400', i===selected);
          b.classList.toggle('bg-gold-500/10', i===selected);
          b.classList.toggle('border-white/10', i!==selected);
          b.classList.toggle('bg-black/40', i!==selected);
        });
      };
    });
    wireNumpad((bet)=>{
      if(racing) return;
      racing=true;
      S.money-=bet; S.stats.games++; updateHub(); save();
      document.getElementById('h-bet').style.pointerEvents='none';
      document.getElementById('horse-list').classList.add('hidden');
      const track=document.getElementById('race-track');
      track.classList.remove('hidden');
      track.innerHTML = horses.map(h=>`
        <div class="flex items-center gap-2">
          <div class="w-6 text-xs font-bold text-center" style="color:${h.color}">${h.num}</div>
          <div class="horse-track flex-1"><div class="horse-runner" id="hr-${h.id}" style="left:2%;color:${h.color}">🏇</div></div>
        </div>`).join('');
      sfx('click');
      const b=getBonuses();
      const progress=horses.map(()=>0);
      const speeds=horses.map((h,i)=>{
        let sp=h.speed+(Math.random()-0.5)*0.3;
        if(i===selected) sp += (b.luck+b.horseLuck)*0.4;
        return Math.max(0.4,sp);
      });
      const iv=setInterval(()=>{
        let done=false;
        for(let i=0;i<5;i++){
          progress[i]+=speeds[i]*(0.8+Math.random()*0.5);
          if(progress[i]>=100){progress[i]=100;done=true;}
          const el=document.getElementById('hr-'+i);
          if(el) el.style.left=Math.min(92,progress[i]*0.9)+'%';
        }
        if(done){
          clearInterval(iv);
          let best=0,bestP=-1;
          for(let i=0;i<5;i++) if(progress[i]>bestP||(progress[i]===bestP&&Math.random()>0.5)){bestP=progress[i];best=i;}
          for(let i=0;i<5;i++){
            const el=document.getElementById('hr-'+i);
            if(el) el.style.left=(i===best?92:40+Math.random()*40)+'%';
          }
          const msg=document.getElementById('race-msg');
          if(best===selected){
            const pure=applyWin(bet*3.5,'horses');
            S.money+=pure; S.stats.won+=pure; sfx('win'); floatTxt('+'+fmt(pure));
            msg.innerHTML=`<span class="text-emerald-400">¡${horses[best].name} gana! +${fmt(pure)}</span>`;
            tryDropItem(true);
          } else {
            S.stats.lost+=bet; sfx('lose');
            msg.innerHTML=`<span class="text-rose-400">Gana #${horses[best].num} ${horses[best].name}</span>`;
            tryDropItem(false);
          }
          save(); updateHub();
          setTimeout(()=>{
            racing=false;
            // new race: regenerate horses for next round
            renderHorses(body);
          }, 2200);
        }
      },80);
    },50);
  }
  ui();
}

/* ===== TABS ===== */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick=()=>{
    sfx('click');
    document.querySelectorAll('.tab-btn').forEach(b=>{
      b.classList.remove('active-tab');
      b.classList.add('text-gray-400');
    });
    btn.classList.add('active-tab');
    btn.classList.remove('text-gray-400');
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById('tab-'+btn.dataset.tab).classList.remove('hidden');
  };
});

document.querySelectorAll('.game-card').forEach(btn=>{
  btn.onclick=()=>openGame(btn.dataset.game);
});
document.getElementById('btn-back-game').onclick=closeGame;

document.getElementById('btn-settings').onclick=()=>{
  sfx('click');
  document.getElementById('modal-settings').classList.remove('hidden');
  document.getElementById('modal-settings').classList.add('flex');
};
document.getElementById('close-settings').onclick=()=>{
  sfx('click');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-settings').classList.remove('flex');
};
document.getElementById('vol-music').oninput=(e)=>{
  S.settings.music=e.target.value/100;
  document.getElementById('vol-music-val').textContent=e.target.value+'%';
  applyVolumes(); save();
};
document.getElementById('vol-sfx').oninput=(e)=>{
  S.settings.sfx=e.target.value/100;
  document.getElementById('vol-sfx-val').textContent=e.target.value+'%';
  save();
};
document.getElementById('btn-mute-all').onclick=()=>{
  S.settings.muted=!S.settings.muted;
  applyVolumes();
  document.getElementById('btn-mute-all').innerHTML=S.settings.muted
    ?'<i class="fa-solid fa-volume-high mr-1"></i> Activar sonido'
    :'<i class="fa-solid fa-volume-xmark mr-1"></i> Silenciar todo';
  save();
};
document.getElementById('btn-reset').onclick=()=>{
  if(confirm('¿Reiniciar todo? Se perderán amuletos y dinero.')){
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
};

document.getElementById('form-start').onsubmit=(e)=>{
  e.preventDefault();
  S.name=document.getElementById('input-name').value.trim()||'Elias Crowe';
  sfx('coin');
  document.getElementById('screen-intro').classList.remove('active');
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-hub').classList.remove('hidden');
  document.getElementById('screen-hub').classList.add('active');
  playMusic();
  updateHub();
  save();
};

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

window.addEventListener('load',()=>{
  if(load()){
    document.getElementById('screen-intro').classList.remove('active');
    document.getElementById('screen-intro').classList.add('hidden');
    document.getElementById('screen-hub').classList.remove('hidden');
    document.getElementById('screen-hub').classList.add('active');
    document.getElementById('vol-music').value=Math.round(S.settings.music*100);
    document.getElementById('vol-sfx').value=Math.round(S.settings.sfx*100);
    document.getElementById('vol-music-val').textContent=Math.round(S.settings.music*100)+'%';
    document.getElementById('vol-sfx-val').textContent=Math.round(S.settings.sfx*100)+'%';
    playMusic();
    updateHub();
  }
});
