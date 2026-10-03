/* Royal Casino Palace — Roguelike */
const SAVE_KEY = 'rcp_roguelike_v2';

const S = {
  name: 'Elias Crowe',
  money: 500,
  inventory: [],
  stats: { games: 0, won: 0, lost: 0, itemsFound: 0 },
  settings: { music: 0.4, sfx: 0.7, muted: false }
};

const PREFIXES = ['Maldito','Sangriento','Oscuro','Fantasmal','Carmesí','Oxidado','Roto','Sagrado','Profano','Etéreo','Sombrío','Gélido','Ígneo','Vacío','Antiguo','Corrompido','Bendito','Olvidado','Espectral','Nefasto'];
const NOUNS = ['Dado','Ficha','Amuleto','Reloj','Anillo','Carta','Moneda','Llave','Calavera','Corona','Daga','Espejo','Reliquia','Talismán','Gema','Orbe','Máscara','Pluma','Hueso','Sello','Cáliz','Vela','Runa','Medallón','Collar','Brazalete','Fragmento','Estatuilla','Pergamino','Lente'];
const SUFFIXES = ['de la Ruina','del Abismo','de la Fortuna','de la Sombra','del Crupier','de las Cinco','del Jackpot','de la Ruleta','del Rey','de la Reina','del Diablo','de la Luna','del Sol Negro','de la Niebla','del Eco','de la Sed','del Hambre','de la Mentira','de la Verdad','del Silencio'];
const ICONS = ['🎲','🪙','💍','🔮','🗝️','💀','👑','🗡️','🪞','💎','🃏','🂡','🧿','📿','🕯️','📜','🦴','🩸','🌑','⚡','🔥','❄️','🌪️','👁️','🖤','♠️','♥️','♦️','♣️','🏆','🧧','🪬'];

const RARITIES = [
  { id:'common',    name:'Común',      weight:50, color:'#9ca3af', mult:[1.01,1.04], luck:[0,0.01] },
  { id:'uncommon',  name:'Poco común', weight:28, color:'#22c55e', mult:[1.04,1.10], luck:[0.01,0.03] },
  { id:'rare',      name:'Raro',       weight:14, color:'#3b82f6', mult:[1.08,1.18], luck:[0.02,0.06] },
  { id:'epic',      name:'Épico',      weight:6,  color:'#a855f7', mult:[1.15,1.30], luck:[0.05,0.12] },
  { id:'legendary', name:'Legendario', weight:2,  color:'#f59e0b', mult:[1.25,1.55], luck:[0.10,0.22] }
];

function weightedRarity() {
  const total = RARITIES.reduce((s,r)=>s+r.weight,0);
  let r = Math.random()*total;
  for (const rar of RARITIES) { r -= rar.weight; if (r<=0) return rar; }
  return RARITIES[0];
}
function rand(a,b){ return a + Math.random()*(b-a); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function generateItem() {
  const rar = weightedRarity();
  const name = `${pick(PREFIXES)} ${pick(NOUNS)} ${pick(SUFFIXES)}`;
  const mult = +rand(rar.mult[0], rar.mult[1]).toFixed(3);
  const luck = +rand(rar.luck[0], rar.luck[1]).toFixed(3);
  return {
    id: 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name, icon: pick(ICONS), rarity: rar.id, rarityName: rar.name, color: rar.color,
    mult, luck,
    desc: `Una reliquia ${rar.name.toLowerCase()} del casino. Amplifica el azar a tu favor… o en tu contra.`
  };
}

function getBonuses() {
  let mult = 1, luck = 0;
  for (const it of S.inventory) { mult *= it.mult; luck += it.luck; }
  mult = Math.min(mult, 8);
  luck = Math.min(luck, 0.55);
  return { mult, luck };
}

const bgMusic = document.getElementById('bg-music');
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function sfx(type) {
  if (S.settings.muted || S.settings.sfx <= 0) return;
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    const vol = S.settings.sfx * 0.18;
    if (type === 'click') {
      osc.type='sine'; osc.frequency.value=520;
      g.gain.setValueAtTime(vol*0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.06);
      osc.start(now); osc.stop(now+0.06);
    } else if (type === 'coin') {
      osc.type='sine'; osc.frequency.setValueAtTime(880,now); osc.frequency.exponentialRampToValueAtTime(1320,now+0.12);
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
      osc.start(now); osc.stop(now+0.15);
    } else if (type === 'win') {
      osc.type='triangle';
      [523,659,784,1046].forEach((f,i)=>{ osc.frequency.setValueAtTime(f, now + i*0.08); });
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.45);
      osc.start(now); osc.stop(now+0.45);
    } else if (type === 'lose') {
      osc.type='sawtooth'; osc.frequency.setValueAtTime(300,now); osc.frequency.exponentialRampToValueAtTime(80,now+0.3);
      g.gain.setValueAtTime(vol*0.5, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.3);
      osc.start(now); osc.stop(now+0.3);
    }
  } catch(e){}
}

function applyVolumes() {
  bgMusic.volume = S.settings.muted ? 0 : S.settings.music;
}

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e){} }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { Object.assign(S, JSON.parse(raw)); return true; }
  } catch(e){}
  return false;
}

function fmt(n){ return Math.floor(n).toLocaleString('es-ES') + ' €'; }
function floatTxt(txt, color='text-emerald-400') {
  const el = document.createElement('div');
  el.className = `float-txt ${color} text-lg`;
  el.textContent = txt;
  el.style.left = (window.innerWidth/2 - 40) + 'px';
  el.style.top = (window.innerHeight/2 - 20) + 'px';
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
  document.getElementById('inv-count').textContent = S.inventory.length + ' / ∞';
  renderInventory();
}

function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  const empty = document.getElementById('inv-empty');
  if (!S.inventory.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = S.inventory.map((it,i) => `
    <button class="inv-cell rarity-${it.rarity} glass rounded-lg border-2 flex items-center justify-center text-2xl active:scale-95 transition"
      data-idx="${i}" title="${it.name}">${it.icon}</button>
  `).join('');
  grid.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      sfx('click');
      const it = S.inventory[+btn.dataset.idx];
      const det = document.getElementById('item-detail');
      det.classList.remove('hidden');
      document.getElementById('detail-icon').textContent = it.icon;
      document.getElementById('detail-name').textContent = it.name;
      document.getElementById('detail-rarity').textContent = it.rarityName;
      document.getElementById('detail-rarity').style.color = it.color;
      document.getElementById('detail-desc').textContent = it.desc;
      document.getElementById('detail-effects').textContent = `Premios ×${it.mult.toFixed(2)} · Suerte +${Math.round(it.luck*100)}%`;
    };
  });
}

function tryDropItem(won) {
  const chance = won ? 0.28 : 0.07;
  if (Math.random() > chance) return;
  const item = generateItem();
  S.inventory.push(item);
  S.stats.itemsFound++;
  floatTxt(item.icon + ' ¡Reliquia!', 'text-purple-300');
  sfx('win');
  save();
  updateHub();
}

function buildNumpad(defaultBet) {
  let val = String(defaultBet);
  return `
    <div class="glass rounded-xl p-3 mb-3">
      <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Apuesta</div>
      <div id="np-display" class="text-2xl font-bold text-emerald-400 mb-2 tabular-nums">${fmt(+val)}</div>
      <div class="grid grid-cols-3 gap-1.5">
        ${[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k => `
          <button class="numpad-btn h-11 rounded-lg bg-black/50 border border-white/10 font-bold text-lg active:bg-gold-500/30" data-k="${k}">${k}</button>
        `).join('')}
      </div>
      <div class="grid grid-cols-4 gap-1.5 mt-2">
        ${[50,100,250,500].map(q => `<button class="numpad-btn py-1.5 rounded-lg bg-slate-800 text-xs font-semibold border border-white/10" data-q="${q}">${q}</button>`).join('')}
      </div>
    </div>
    <button id="np-go" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-bold text-lg shadow active:scale-[0.98]">
      Confirmar apuesta
    </button>
  `;
}

function wireNumpad(onConfirm) {
  let val = '100';
  const disp = document.getElementById('np-display');
  if (disp) {
    const m = disp.textContent.replace(/[^\d]/g,'');
    if (m) val = m;
  }
  const update = () => { if (disp) disp.textContent = fmt(+val || 0); };
  document.querySelectorAll('.numpad-btn[data-k]').forEach(btn => {
    btn.onclick = () => {
      sfx('click');
      const k = btn.dataset.k;
      if (k === 'C') val = '0';
      else if (k === '⌫') val = val.slice(0,-1) || '0';
      else {
        if (val === '0') val = k;
        else if (val.length < 7) val += k;
      }
      update();
    };
  });
  document.querySelectorAll('.numpad-btn[data-q]').forEach(btn => {
    btn.onclick = () => { sfx('click'); val = btn.dataset.q; update(); };
  });
  const go = document.getElementById('np-go');
  if (go) go.onclick = () => {
    const n = parseInt(val,10) || 0;
    if (n < 1) return floatTxt('Apuesta mínima 1 €','text-rose-400');
    if (n > S.money) return floatTxt('Fondos insuficientes','text-rose-400');
    onConfirm(n);
  };
}

function openGame(type) {
  sfx('click');
  const modal = document.getElementById('modal-game');
  const body = document.getElementById('game-body');
  const titles = { slots:'🎰 Tragaperras', blackjack:'🃏 Blackjack', roulette:'🎡 Ruleta', poker:'♠️ Video Poker', horses:'🏇 Carrera de Caballos' };
  document.getElementById('game-title').textContent = titles[type] || 'Juego';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (type === 'slots') renderSlots(body);
  else if (type === 'blackjack') renderBJ(body);
  else if (type === 'roulette') renderRoulette(body);
  else if (type === 'poker') renderPoker(body);
  else if (type === 'horses') renderHorses(body);
}

function closeGame() {
  sfx('click');
  document.getElementById('modal-game').classList.add('hidden');
  document.getElementById('modal-game').classList.remove('flex');
  document.getElementById('game-body').innerHTML = '';
  updateHub();
}

/* ---- SLOTS ---- */
function renderSlots(body) {
  const symbols = ['🍒','🍋','🔔','💎','7️⃣','⭐','👑','💀'];
  body.innerHTML = `
    <div class="max-w-md mx-auto space-y-3">
      <div class="bg-black/80 border-2 border-gold-600 rounded-2xl p-4 shadow-inner">
        <div class="grid grid-cols-3 gap-2 text-center text-5xl py-6 bg-gradient-to-b from-slate-900 to-black rounded-xl border border-gold-500/30 overflow-hidden">
          <div id="sr1" class="py-2">❓</div>
          <div id="sr2" class="py-2">❓</div>
          <div id="sr3" class="py-2">❓</div>
        </div>
        <div id="slot-msg" class="text-center text-sm text-gold-300 mt-2 min-h-[1.4rem] font-medium"></div>
      </div>
      <div id="slot-bet-area">${buildNumpad(50)}</div>
    </div>
  `;
  wireNumpad((bet) => {
    S.money -= bet; S.stats.games++; updateHub(); save();
    document.getElementById('slot-bet-area').style.pointerEvents = 'none';
    document.getElementById('slot-msg').textContent = 'Girando…';
    sfx('click');
    let n = 0;
    const iv = setInterval(() => {
      document.getElementById('sr1').textContent = pick(symbols);
      document.getElementById('sr2').textContent = pick(symbols);
      document.getElementById('sr3').textContent = pick(symbols);
      if (++n > 18) {
        clearInterval(iv);
        const b = getBonuses();
        let r1 = pick(symbols), r2 = pick(symbols), r3 = pick(symbols);
        if (Math.random() < 0.12 + b.luck) { r2 = r1; r3 = r1; }
        else if (Math.random() < 0.25 + b.luck*0.5) { r2 = r1; }
        document.getElementById('sr1').textContent = r1;
        document.getElementById('sr2').textContent = r2;
        document.getElementById('sr3').textContent = r3;
        let win = 0, msg = 'Sin premio…';
        if (r1===r2 && r2===r3) {
          const base = r1==='7️⃣' ? 40 : r1==='👑' ? 25 : r1==='💎' ? 18 : 10;
          win = Math.floor(bet * base * b.mult);
          msg = `¡TRIPLE ${r1}! +${fmt(win)}`;
        } else if (r1===r2 || r2===r3 || r1===r3) {
          win = Math.floor(bet * 2.2 * b.mult);
          msg = `¡Pareja! +${fmt(win)}`;
        }
        const msgEl = document.getElementById('slot-msg');
        if (win > 0) {
          S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
          msgEl.className = 'text-center text-sm text-emerald-400 mt-2 min-h-[1.4rem] font-medium';
        } else {
          S.stats.lost += bet; sfx('lose');
          msgEl.className = 'text-center text-sm text-rose-400 mt-2 min-h-[1.4rem] font-medium';
        }
        msgEl.textContent = msg;
        tryDropItem(win > 0);
        save(); updateHub();
        setTimeout(() => renderSlots(body), 1400);
      }
    }, 70);
  });
}

/* ---- BLACKJACK ---- */
function createDeck() {
  const suits = ['♠','♥','♦','♣'], vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d = [];
  for (const s of suits) for (const v of vals) d.push({v,s,red: s==='♥'||s==='♦'});
  for (let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
  return d;
}
function handVal(h) {
  let t=0, a=0;
  for (const c of h) {
    if (c.v==='A'){ a++; t+=11; }
    else if (['J','Q','K'].includes(c.v)) t+=10;
    else t+=+c.v;
  }
  while (t>21 && a){ t-=10; a--; }
  return t;
}
function cardHtml(c, hide) {
  if (hide) return `<div class="w-12 h-16 rounded-md bg-slate-800 border-2 border-gold-600 flex items-center justify-center text-gold-500 text-lg">🂠</div>`;
  return `<div class="card-face w-12 h-16 flex flex-col items-center justify-center text-sm font-bold ${c.red?'text-red-600':'text-slate-900'}">
    <span>${c.v}</span><span class="text-base">${c.s}</span></div>`;
}

function renderBJ(body) {
  let deck, player, dealer, bet=0, phase='bet';

  function draw() {
    const pVal = player ? handVal(player) : 0;
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="bg-gradient-to-b from-green-950 to-green-900/40 border border-green-800/50 rounded-2xl p-4 min-h-[200px]">
          <div class="text-[10px] text-green-300/70 mb-1">Crupier ${phase!=='bet' && phase!=='play' ? '('+handVal(dealer)+')' : ''}</div>
          <div class="flex gap-1.5 mb-4 min-h-[64px]">${(dealer||[]).map((c,i)=>cardHtml(c, phase==='play' && i===1)).join('') || '<div class="text-gray-600 text-xs">—</div>'}</div>
          <hr class="border-green-800/40 my-2">
          <div class="text-[10px] text-green-300/70 mb-1">Tú ${player ? '('+pVal+')' : ''}</div>
          <div class="flex gap-1.5 min-h-[64px]">${(player||[]).map(c=>cardHtml(c)).join('') || '<div class="text-gray-600 text-xs">—</div>'}</div>
        </div>
        <div id="bj-msg" class="text-center text-sm font-medium min-h-[1.3rem] text-gold-300"></div>
        <div id="bj-controls"></div>
      </div>
    `;
    const ctrl = document.getElementById('bj-controls');
    if (phase === 'bet') {
      ctrl.innerHTML = buildNumpad(100);
      wireNumpad((b) => {
        bet = b; S.money -= bet; S.stats.games++;
        deck = createDeck();
        player = [deck.pop(), deck.pop()];
        dealer = [deck.pop(), deck.pop()];
        phase = 'play';
        save(); updateHub(); draw();
        if (handVal(player) === 21) endBJ(true, true);
      });
    } else if (phase === 'play') {
      ctrl.innerHTML = `
        <div class="grid grid-cols-3 gap-2">
          <button id="bj-hit" class="py-3 rounded-xl bg-blue-700 font-bold text-sm">Pedir</button>
          <button id="bj-stand" class="py-3 rounded-xl bg-amber-700 font-bold text-sm">Plantarse</button>
          <button id="bj-dbl" class="py-3 rounded-xl bg-purple-700 font-bold text-sm">Doblar</button>
        </div>`;
      document.getElementById('bj-hit').onclick = () => {
        sfx('click'); player.push(deck.pop());
        if (handVal(player) > 21) endBJ(false);
        else draw();
      };
      document.getElementById('bj-stand').onclick = () => { sfx('click'); dealerPlay(); };
      document.getElementById('bj-dbl').onclick = () => {
        if (S.money < bet) return floatTxt('Sin fondos','text-rose-400');
        S.money -= bet; bet *= 2; updateHub();
        player.push(deck.pop());
        if (handVal(player) > 21) endBJ(false);
        else dealerPlay();
      };
    } else {
      ctrl.innerHTML = `<button id="bj-again" class="w-full py-3 rounded-xl bg-gold-600 text-black font-bold">Otra mano</button>`;
      document.getElementById('bj-again').onclick = () => { phase='bet'; player=null; dealer=null; draw(); };
    }
  }

  function dealerPlay() {
    phase = 'done';
    while (handVal(dealer) < 17) dealer.push(deck.pop());
    const pv = handVal(player), dv = handVal(dealer);
    const b = getBonuses();
    const msgEl = () => document.getElementById('bj-msg');
    if (dv > 21 || pv > dv) {
      const win = Math.floor(bet * 2 * b.mult);
      S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
      msgEl().textContent = `¡Ganas! +${fmt(win)}`;
      msgEl().className = 'text-center text-sm font-medium min-h-[1.3rem] text-emerald-400';
      tryDropItem(true);
    } else if (pv === dv) {
      S.money += bet; sfx('coin');
      msgEl().textContent = 'Empate. Apuesta devuelta.';
    } else {
      S.stats.lost += bet; sfx('lose');
      msgEl().textContent = `Pierdes. Crupier ${dv}`;
      msgEl().className = 'text-center text-sm font-medium min-h-[1.3rem] text-rose-400';
      tryDropItem(false);
    }
    save(); updateHub(); draw();
  }

  function endBJ(won, blackjack) {
    phase = 'done';
    const b = getBonuses();
    const msgEl = document.getElementById('bj-msg');
    if (won) {
      const mult = blackjack ? 2.5 : 2;
      const win = Math.floor(bet * mult * b.mult);
      S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
      msgEl.textContent = blackjack ? `¡BLACKJACK! +${fmt(win)}` : `¡Ganas! +${fmt(win)}`;
      msgEl.className = 'text-center text-sm font-medium min-h-[1.3rem] text-emerald-400';
      tryDropItem(true);
    } else {
      S.stats.lost += bet; sfx('lose');
      msgEl.textContent = 'Te pasaste.';
      msgEl.className = 'text-center text-sm font-medium min-h-[1.3rem] text-rose-400';
      tryDropItem(false);
    }
    save(); updateHub(); draw();
  }

  draw();
}

/* ---- ROULETTE ---- */
function renderRoulette(body) {
  let selected = 'red';
  const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

  function draw() {
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="flex justify-center">
          <div id="rwheel" class="w-36 h-36 rounded-full border-4 border-gold-500 bg-gradient-to-br from-slate-900 to-blood-900 flex items-center justify-center text-4xl shadow-xl transition-transform duration-[3.5s] cubic-bezier(0.15,0.85,0.35,1)">🎯</div>
        </div>
        <div id="r-result" class="text-center font-bold text-lg min-h-[1.5rem]"></div>
        <div class="grid grid-cols-3 gap-1.5">
          ${[['red','Rojo ×2','bg-rose-800'],['black','Negro ×2','bg-slate-800'],['even','Par ×2','bg-slate-800'],['odd','Impar ×2','bg-slate-800'],['low','1-18 ×2','bg-slate-800'],['high','19-36 ×2','bg-slate-800']].map(([k,l,bg]) => `
            <button data-rt="${k}" class="rt-btn py-2.5 rounded-lg ${bg} text-xs font-bold border-2 ${selected===k?'border-gold-400':'border-transparent'}">${l}</button>
          `).join('')}
        </div>
        <div id="r-bet">${buildNumpad(50)}</div>
      </div>
    `;
    document.querySelectorAll('.rt-btn').forEach(btn => {
      btn.onclick = () => { sfx('click'); selected = btn.dataset.rt; draw(); };
    });
    wireNumpad((bet) => {
      S.money -= bet; S.stats.games++; updateHub(); save();
      document.getElementById('r-bet').style.pointerEvents = 'none';
      sfx('click');
      const wheel = document.getElementById('rwheel');
      wheel.style.transform = `rotate(${1800 + Math.random()*360}deg)`;
      setTimeout(() => {
        const num = Math.floor(Math.random()*37);
        const isRed = reds.includes(num);
        const isBlack = num!==0 && !isRed;
        const colorLabel = num===0 ? 'Verde' : isRed ? 'Rojo' : 'Negro';
        document.getElementById('r-result').innerHTML = `<span class="${isRed?'text-rose-400':num===0?'text-emerald-400':'text-gray-300'}">${num} · ${colorLabel}</span>`;
        const b = getBonuses();
        let won = false;
        if (selected==='red' && isRed) won = true;
        if (selected==='black' && isBlack) won = true;
        if (selected==='even' && num!==0 && num%2===0) won = true;
        if (selected==='odd' && num!==0 && num%2===1) won = true;
        if (selected==='low' && num>=1 && num<=18) won = true;
        if (selected==='high' && num>=19 && num<=36) won = true;
        if (!won && Math.random() < b.luck * 0.15) won = true;

        if (won) {
          const win = Math.floor(bet * 2 * b.mult);
          S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
          tryDropItem(true);
        } else {
          S.stats.lost += bet; sfx('lose');
          tryDropItem(false);
        }
        save(); updateHub();
        setTimeout(() => renderRoulette(body), 1400);
      }, 3600);
    });
  }
  draw();
}

/* ---- POKER ---- */
function evalPoker(hand) {
  const counts = {};
  hand.forEach(c => counts[c.v] = (counts[c.v]||0)+1);
  const vals = Object.values(counts);
  if (vals.includes(4)) return { name:'Póker', m:25 };
  if (vals.includes(3) && vals.includes(2)) return { name:'Full', m:9 };
  if (vals.includes(3)) return { name:'Trío', m:3 };
  if (vals.filter(v=>v===2).length===2) return { name:'Doble pareja', m:2 };
  if (vals.includes(2)) return { name:'Pareja', m:1.5 };
  return { name:'Nada', m:0 };
}

function renderPoker(body) {
  let deck, hand, holds, phase='bet', bet=0;

  function draw() {
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="bg-gradient-to-b from-green-950 to-black/60 border border-green-800/40 rounded-2xl p-4">
          <div class="text-[10px] text-green-300/60 mb-2 text-center">${phase==='hold'?'Toca para MANTENER':'Tu mano'}</div>
          <div id="pk-cards" class="flex justify-center gap-1.5 min-h-[70px]">
            ${(hand||[]).map((c,i) => `
              <button data-i="${i}" class="card-face w-[52px] h-[72px] flex flex-col items-center justify-center text-sm font-bold ${c.red?'text-red-600':'text-slate-900'} ${holds&&holds[i]?'ring-2 ring-gold-400 scale-105':''} transition">
                ${holds&&holds[i]?'<span class="text-[8px] text-amber-600 font-black">HOLD</span>':''}
                <span>${c.v}</span><span>${c.s}</span>
              </button>
            `).join('') || '<span class="text-gray-600 text-xs">—</span>'}
          </div>
          <div id="pk-eval" class="text-center text-gold-300 text-sm mt-2 font-medium min-h-[1.2rem]"></div>
        </div>
        <div id="pk-msg" class="text-center text-sm font-medium min-h-[1.2rem]"></div>
        <div id="pk-ctrl"></div>
      </div>
    `;
    const ctrl = document.getElementById('pk-ctrl');
    if (phase === 'bet') {
      ctrl.innerHTML = buildNumpad(100);
      wireNumpad((b) => {
        bet=b; S.money-=bet; S.stats.games++;
        deck=createDeck(); hand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
        holds=[false,false,false,false,false]; phase='hold';
        save(); updateHub(); draw();
      });
    } else if (phase === 'hold') {
      document.getElementById('pk-eval').textContent = evalPoker(hand).name;
      document.querySelectorAll('#pk-cards button').forEach(btn => {
        btn.onclick = () => {
          sfx('click');
          holds[+btn.dataset.i] = !holds[+btn.dataset.i];
          draw();
        };
      });
      ctrl.innerHTML = `<button id="pk-draw" class="w-full py-3 rounded-xl bg-emerald-600 font-bold">Cambiar descartadas</button>`;
      document.getElementById('pk-draw').onclick = () => {
        sfx('click');
        for (let i=0;i<5;i++) if (!holds[i]) hand[i]=deck.pop();
        const ev = evalPoker(hand);
        const b = getBonuses();
        const win = Math.floor(bet * ev.m * b.mult);
        document.getElementById('pk-eval').textContent = ev.name;
        const msg = document.getElementById('pk-msg');
        if (win > 0) {
          S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
          msg.textContent = `¡${ev.name}! +${fmt(win)}`;
          msg.className = 'text-center text-sm font-medium min-h-[1.2rem] text-emerald-400';
          tryDropItem(true);
        } else {
          S.stats.lost += bet; sfx('lose');
          msg.textContent = 'Sin premio.';
          msg.className = 'text-center text-sm font-medium min-h-[1.2rem] text-rose-400';
          tryDropItem(false);
        }
        phase = 'done'; save(); updateHub(); draw();
      };
    } else {
      ctrl.innerHTML = `<button id="pk-again" class="w-full py-3 rounded-xl bg-gold-600 text-black font-bold">Otra mano</button>`;
      document.getElementById('pk-again').onclick = () => { phase='bet'; hand=null; draw(); };
    }
  }
  draw();
}

/* ---- HORSES ---- */
const HORSE_NAMES_A = ['Sombra','Trueno','Ceniza','Viento','Sangre','Fantasma','Hierro','Noche','Rayo','Bruma'];
const HORSE_NAMES_B = ['Negro','Rojo','Dorado','Pálido','Salvaje','Maldito','Veloz','Eterno','Cruel','Silente'];
const HORSE_COLORS = ['#e11d48','#3b82f6','#eab308','#22c55e','#a855f7'];

function renderHorses(body) {
  let horses = [], selected = 0, racing = false;

  function genHorses() {
    horses = [];
    const used = new Set();
    for (let i=0;i<5;i++) {
      let name;
      do { name = pick(HORSE_NAMES_A) + ' ' + pick(HORSE_NAMES_B); } while (used.has(name));
      used.add(name);
      horses.push({ id:i, name, color:HORSE_COLORS[i], num:i+1, speed:0.7+Math.random()*0.5 });
    }
  }

  function draw() {
    genHorses();
    body.innerHTML = `
      <div class="max-w-md mx-auto space-y-3">
        <div class="text-xs text-gray-500 text-center">Elige un caballo y apuesta. La carrera es implacable.</div>
        <div id="horse-list" class="space-y-2">
          ${horses.map((h,i) => `
            <button data-h="${i}" class="horse-sel w-full flex items-center gap-3 p-3 rounded-xl border-2 ${selected===i?'border-gold-400 bg-gold-500/10':'border-white/10 bg-black/40'} text-left transition">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" style="background:${h.color}33;color:${h.color}">${h.num}</div>
              <div class="flex-1">
                <div class="font-bold text-sm">${h.name}</div>
                <div class="text-[10px] text-gray-500">Caballo #${h.num}</div>
              </div>
              <div class="text-2xl">🏇</div>
            </button>
          `).join('')}
        </div>
        <div id="race-track" class="hidden space-y-2 mt-2"></div>
        <div id="race-msg" class="text-center font-bold min-h-[1.4rem]"></div>
        <div id="h-bet">${buildNumpad(50)}</div>
      </div>
    `;
    document.querySelectorAll('.horse-sel').forEach(btn => {
      btn.onclick = () => { sfx('click'); selected = +btn.dataset.h; draw(); };
    });
    wireNumpad((bet) => {
      if (racing) return;
      racing = true;
      S.money -= bet; S.stats.games++; updateHub(); save();
      document.getElementById('h-bet').style.pointerEvents = 'none';
      document.getElementById('horse-list').classList.add('hidden');
      const track = document.getElementById('race-track');
      track.classList.remove('hidden');
      track.innerHTML = horses.map(h => `
        <div class="flex items-center gap-2">
          <div class="w-6 text-xs font-bold text-center" style="color:${h.color}">${h.num}</div>
          <div class="horse-track flex-1">
            <div class="horse-runner" id="hr-${h.id}" style="left:2%;color:${h.color}">🏇</div>
          </div>
        </div>
      `).join('');

      sfx('click');
      const b = getBonuses();
      const progress = horses.map(() => 0);
      const speeds = horses.map((h,i) => {
        let sp = h.speed + (Math.random()-0.5)*0.3;
        if (i === selected) sp += b.luck * 0.35;
        return Math.max(0.4, sp);
      });

      const iv = setInterval(() => {
        let finished = false;
        for (let i=0;i<5;i++) {
          progress[i] += speeds[i] * (0.8 + Math.random()*0.5);
          if (progress[i] >= 100) { progress[i]=100; finished=true; }
          const el = document.getElementById('hr-'+i);
          if (el) el.style.left = Math.min(92, progress[i]*0.9) + '%';
        }
        if (finished) {
          clearInterval(iv);
          let best = 0, bestP = -1;
          for (let i=0;i<5;i++) {
            if (progress[i] > bestP || (progress[i]===bestP && Math.random()>0.5)) {
              bestP = progress[i]; best = i;
            }
          }
          for (let i=0;i<5;i++) {
            const el = document.getElementById('hr-'+i);
            if (el) el.style.left = (i===best ? 92 : 40+Math.random()*40) + '%';
          }
          const msg = document.getElementById('race-msg');
          if (best === selected) {
            const win = Math.floor(bet * 4.2 * b.mult);
            S.money += win; S.stats.won += win; sfx('win'); floatTxt('+'+fmt(win));
            msg.innerHTML = `<span class="text-emerald-400">¡${horses[best].name} gana! +${fmt(win)}</span>`;
            tryDropItem(true);
          } else {
            S.stats.lost += bet; sfx('lose');
            msg.innerHTML = `<span class="text-rose-400">Gana #${horses[best].num} ${horses[best].name}. Pierdes.</span>`;
            tryDropItem(false);
          }
          save(); updateHub();
          setTimeout(() => { racing=false; renderHorses(body); }, 2200);
        }
      }, 80);
    });
  }
  draw();
}

/* ---- NAV ---- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    sfx('click');
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active','bg-gold-500','text-black');
      b.classList.add('text-gray-400');
    });
    btn.classList.add('active','bg-gold-500','text-black');
    btn.classList.remove('text-gray-400');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  };
});

document.querySelectorAll('.game-card').forEach(btn => {
  btn.onclick = () => openGame(btn.dataset.game);
});

document.getElementById('btn-back-game').onclick = closeGame;

document.getElementById('btn-settings').onclick = () => {
  sfx('click');
  document.getElementById('modal-settings').classList.remove('hidden');
  document.getElementById('modal-settings').classList.add('flex');
};
document.getElementById('close-settings').onclick = () => {
  sfx('click');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-settings').classList.remove('flex');
};
document.getElementById('vol-music').oninput = (e) => {
  S.settings.music = e.target.value / 100;
  document.getElementById('vol-music-val').textContent = e.target.value + '%';
  applyVolumes(); save();
};
document.getElementById('vol-sfx').oninput = (e) => {
  S.settings.sfx = e.target.value / 100;
  document.getElementById('vol-sfx-val').textContent = e.target.value + '%';
  save();
};
document.getElementById('btn-mute-all').onclick = () => {
  S.settings.muted = !S.settings.muted;
  applyVolumes();
  document.getElementById('btn-mute-all').innerHTML = S.settings.muted
    ? '<i class="fa-solid fa-volume-high mr-1"></i> Activar sonido'
    : '<i class="fa-solid fa-volume-xmark mr-1"></i> Silenciar todo';
  save();
};
document.getElementById('btn-reset').onclick = () => {
  if (confirm('¿Reiniciar todo el progreso? Se perderán reliquias y dinero.')) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
};

document.getElementById('form-start').onsubmit = (e) => {
  e.preventDefault();
  S.name = document.getElementById('input-name').value.trim() || 'Elias Crowe';
  sfx('coin');
  document.getElementById('screen-intro').classList.remove('active');
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-hub').classList.remove('hidden');
  document.getElementById('screen-hub').classList.add('active');
  try { bgMusic.play().catch(()=>{}); } catch(e){}
  applyVolumes();
  updateHub();
  save();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

window.addEventListener('load', () => {
  if (load()) {
    document.getElementById('screen-intro').classList.remove('active');
    document.getElementById('screen-intro').classList.add('hidden');
    document.getElementById('screen-hub').classList.remove('hidden');
    document.getElementById('screen-hub').classList.add('active');
    document.getElementById('vol-music').value = Math.round(S.settings.music*100);
    document.getElementById('vol-sfx').value = Math.round(S.settings.sfx*100);
    document.getElementById('vol-music-val').textContent = Math.round(S.settings.music*100)+'%';
    document.getElementById('vol-sfx-val').textContent = Math.round(S.settings.sfx*100)+'%';
    applyVolumes();
    try { bgMusic.play().catch(()=>{}); } catch(e){}
    updateHub();
  }
});
