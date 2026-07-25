/* =========================================================================
   CS2 Pack Opening — logic
   Player pool, weighted rarity RNG, the walkout reveal animation,
   coins economy and a persisted club. Vanilla JS, no dependencies.
   ========================================================================= */
(() => {
  'use strict';

  /* ------------------------------------------------------------ persistence */
  const STORE_KEY = 'cs2_pack_v1';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  };
  const state = Object.assign({ coins: 4000, club: {}, lastClaim: 0 }, load());
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} };

  /* --------------------------------------------------------------- flags */
  // t: 'h' horizontal bands · 'v' vertical bands · 'cross' Nordic · 'solid'
  const FLAGS = {
    UA:{t:'h',c:['#0057b7','#ffd700']},
    FR:{t:'v',c:['#0055a4','#fff','#ef4135']},
    DK:{t:'cross',c:['#c8102e','#fff']},
    SE:{t:'cross',c:['#006aa7','#fecc00']},
    NO:{t:'cross',c:['#ef2b2d','#fff']},
    FI:{t:'cross',c:['#fff','#003580']},
    BA:{t:'h',c:['#001489','#fecb00']},
    BR:{t:'h',c:['#009c3b','#ffdf00','#009c3b']},
    RU:{t:'h',c:['#fff','#0039a6','#d52b1e']},
    EE:{t:'h',c:['#0072ce','#000','#fff']},
    CA:{t:'v',c:['#ff0000','#fff','#ff0000']},
    LV:{t:'h',c:['#9e1b32','#fff','#9e1b32']},
    LT:{t:'h',c:['#fdb913','#006a44','#c1272d']},
    HU:{t:'h',c:['#cd2a3e','#fff','#436f4d']},
    RO:{t:'v',c:['#002b7f','#fcd116','#ce1126']},
    IL:{t:'h',c:['#fff','#0038b8','#fff']},
    SK:{t:'h',c:['#fff','#0b4ea2','#ee1c25']},
    TR:{t:'solid',c:['#e30a17']},
    MN:{t:'v',c:['#c4272e','#015197','#c4272e']},
    ZA:{t:'h',c:['#007749','#ffb612','#de3831']},
    DE:{t:'h',c:['#000','#dd0000','#ffce00']},
    PL:{t:'h',c:['#fff','#dc143c']},
    KZ:{t:'solid',c:['#00afca']},
  };
  const flagHTML = (code) => {
    const f = FLAGS[code] || { t:'solid', c:['#888'] };
    if (f.t === 'cross') {
      return `<div style="position:relative;flex:1;background:${f.c[0]}">
        <span style="position:absolute;left:34%;top:0;bottom:0;width:26%;background:${f.c[1]}"></span>
        <span style="position:absolute;top:34%;left:0;right:0;height:30%;background:${f.c[1]}"></span></div>`;
    }
    if (f.t === 'solid') return `<div style="flex:1;background:${f.c[0]}"></div>`;
    const dir = f.t === 'v' ? 'row' : 'column';
    return `<div style="display:flex;flex:1;flex-direction:${dir}">` +
      f.c.map(c => `<i style="flex:1;background:${c}"></i>`).join('') + `</div>`;
  };

  /* ------------------------------------------------------------- players */
  // [name, position, team, nation, rating, tier]
  const RAW = [
    // ---- ICONS (legends) ----
    ['s1mple','AWP','NAVI','UA',99,'icon'],
    ['ZywOo','AWP','VITALITY','FR',98,'icon'],
    ['device','AWP','ASTRALIS','DK',96,'icon'],
    ['NiKo','RIF','G2','BA',96,'icon'],
    ['coldzera','LUR','LEGENDS','BR',95,'icon'],
    ['GeT_RiGHT','RIF','LEGENDS','SE',95,'icon'],
    // ---- GOLD ----
    ['donk','RIF','SPIRIT','RU',94,'gold'],
    ['m0NESY','AWP','G2','RU',92,'gold'],
    ['sh1ro','AWP','SPIRIT','RU',90,'gold'],
    ['ropz','LUR','VITALITY','EE',90,'gold'],
    ['Twistzz','RIF','LIQUID','CA',89,'gold'],
    ['Ax1Le','RIF','CLOUD9','RU',89,'gold'],
    ['w0nderful','AWP','NAVI','UA',89,'gold'],
    ['broky','AWP','FAZE','LV',88,'gold'],
    ['huNter','RIF','G2','BA',88,'gold'],
    ['electroNic','RIF','VIRTUS.PRO','RU',88,'gold'],
    ['frozen','RIF','FAZE','SK',88,'gold'],
    ['jL','RIF','VITALITY','LT',88,'gold'],
    ['flameZ','ENT','VITALITY','IL',88,'gold'],
    ['b1t','RIF','NAVI','UA',87,'gold'],
    ['torzsi','AWP','MOUZ','HU',87,'gold'],
    ['iM','RIF','LIQUID','RO',86,'gold'],
    // ---- SILVER ----
    ['Spinx','RIF','VITALITY','IL',85,'silver'],
    ['Brollan','RIF','MOUZ','SE',84,'silver'],
    ['FalleN','AWP','FURIA','BR',84,'silver'],
    ['Magisk','SUP','FALCONS','DK',84,'silver'],
    ['blameF','RIF','ASTRALIS','DK',84,'silver'],
    ['xantares','ENT','ETERNAL FIRE','TR',84,'silver'],
    ['karrigan','IGL','FAZE','DK',83,'silver'],
    ['Perfecto','SUP','NAVI','RU',83,'silver'],
    ['rain','ENT','FAZE','NO',83,'silver'],
    ['NAF','RIF','LIQUID','CA',83,'silver'],
    ['gla1ve','IGL','ASTRALIS','DK',82,'silver'],
    ['chopper','IGL','SPIRIT','RU',82,'silver'],
    ['apEX','IGL','VITALITY','FR',81,'silver'],
    ['Snappi','IGL','ENCE','DK',80,'silver'],
    ['HooXi','IGL','G2','DK',79,'silver'],
    // ---- BRONZE ----
    ['910','AWP','THE MONGOLZ','MN',77,'bronze'],
    ['Jimpphat','RIF','MOUZ','FI',77,'bronze'],
    ['xfl0ud','RIF','THE MONGOLZ','MN',76,'bronze'],
    ['SunPayus','AWP','ASTRALIS','DK',76,'bronze'],
    ['Techno','AWP','THE MONGOLZ','MN',75,'bronze'],
    ['Kylar','RIF','PARIVISION','RU',74,'bronze'],
    ['MATYS','RIF','GAMERLEGION','PL',73,'bronze'],
    ['fame','ENT','VIRTUS.PRO','RU',73,'bronze'],
    ['nqz','AWP','IMPERIAL','BR',72,'bronze'],
    ['zweih','RIF','GAMERLEGION','DE',72,'bronze'],
    ['kyxsan','SUP','FAZE','ZA',71,'bronze'],
    ['kraghen','AWP','ASTRALIS','DK',70,'bronze'],
    ['deko','RIF','NAVI JR','UA',70,'bronze'],
    ['salazar','SUP','9 PANDAS','KZ',69,'bronze'],
    ['Senzu','RIF','THE HUNS','MN',68,'bronze'],
    ['ICY','ENT','PASSION UA','UA',67,'bronze'],
  ];

  // Role emphasis on the six CS2 stats:
  // FIR firepower · UTL utility · SNP sniping · IMP impact · CLT clutch · OPN opening
  const ROLE = {
    AWP:{FIR:-1,UTL:-4,SNP:7,IMP:2,CLT:1,OPN:3},
    RIF:{FIR:5,UTL:0,SNP:-6,IMP:3,CLT:1,OPN:1},
    ENT:{FIR:4,UTL:-2,SNP:-6,IMP:2,CLT:-3,OPN:7},
    IGL:{FIR:-4,UTL:6,SNP:-4,IMP:1,CLT:5,OPN:-2},
    SUP:{FIR:-2,UTL:7,SNP:-4,IMP:0,CLT:3,OPN:-3},
    LUR:{FIR:1,UTL:-1,SNP:-3,IMP:4,CLT:6,OPN:-3},
  };
  const STAT_KEYS = ['FIR','UTL','SNP','IMP','CLT','OPN'];
  const hash = (s) => { let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i))|0; return h; };
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));

  const PLAYERS = RAW.map(([name,pos,team,nation,rating,tier]) => {
    const r = ROLE[pos] || ROLE.RIF;
    const h = hash(name);
    const stats = {};
    STAT_KEYS.forEach((k,i) => {
      const jitter = ((h >> (i*3)) & 7) - 3;             // -3..+4 deterministic
      stats[k] = clamp(Math.round(rating + r[k] + jitter), 42, 99);
    });
    return { name, pos, team, nation, rating, tier, stats };
  });
  const BY_TIER = { bronze:[], silver:[], gold:[], icon:[] };
  PLAYERS.forEach(p => BY_TIER[p.tier].push(p));

  /* ------------------------------------------------------------- packs */
  const PACKS = [
    { id:'starter', name:'Starter Crate', cost:300,  accent:'#e0a56c', badge:'Common',
      desc:'A cheap crack. Mostly commons — but everyone starts somewhere.',
      odds:{ bronze:78, silver:19, gold:2.8, icon:0.2 } },
    { id:'prime',   name:'Prime Crate',   cost:900,  accent:'#cfd3d9', badge:'Uncommon',
      desc:'A better floor and real gold potential in every pull.',
      odds:{ bronze:40, silver:44, gold:15, icon:1 } },
    { id:'elite',   name:'Elite Crate',   cost:2500, accent:'#ffd75e', badge:'Rare',
      desc:'Gold-heavy. This is where you chase the top-tier pros.',
      odds:{ bronze:8, silver:34, gold:55, icon:3 } },
    { id:'vault',   name:'Legends Vault',  cost:9000, accent:'#fdfbf3', badge:'Ultra Rare',
      desc:'The best odds at an Icon walkout anywhere. Pure heaters.',
      odds:{ bronze:0, silver:20, gold:68, icon:12 } },
  ];
  const SELL = { bronze:60, silver:220, gold:750, icon:3000 };
  const sellValue = (c) => Math.round(SELL[c.tier] * (0.6 + c.rating/100));

  const TIER_LABEL = { bronze:'Bronze', silver:'Silver', gold:'Gold', icon:'Icon' };
  const GLOW = { bronze:'#e69a5a', silver:'#e6e9ee', gold:'#ffd75e', icon:'#fff4cf' };

  /* --------------------------------------------------------------- RNG */
  const pickTier = (odds) => {
    const total = Object.values(odds).reduce((a,b)=>a+b,0);
    let r = Math.random() * total;
    for (const t of ['bronze','silver','gold','icon']) {
      r -= odds[t] || 0;
      if (r <= 0) return t;
    }
    return 'bronze';
  };
  const pull = (pack) => {
    let tier = pickTier(pack.odds);
    if (!BY_TIER[tier].length) tier = 'gold';
    const pool = BY_TIER[tier];
    return pool[(Math.random() * pool.length) | 0];
  };

  /* ----------------------------------------------------------- SVG bits */
  const SILH = `<svg viewBox="0 0 120 150" fill="#828282"><circle cx="60" cy="44" r="30"/><path d="M8 150c4-36 24-54 52-54s48 18 52 54z"/></svg>`;
  const SHIELD = `<svg class="shield" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 1 20 4v9c0 6-4 10-9 12-5-2-9-6-9-12V4z"/><path d="M11 3v20" opacity=".5"/></svg>`;
  const crateSVG = (accent, cls='crate-svg') => `
    <svg class="${cls}" viewBox="0 0 120 100" fill="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#141414"/>
        </linearGradient>
        <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#2a2a2a"/>
        </linearGradient>
      </defs>
      <rect x="14" y="30" width="92" height="62" rx="9" fill="url(#cg)" stroke="#000" stroke-width="1.5"/>
      <rect x="14" y="30" width="92" height="22" rx="9" fill="url(#cl)"/>
      <rect x="14" y="49" width="92" height="3" fill="${accent}" opacity=".9"/>
      <rect x="20" y="8" width="80" height="26" rx="7" fill="url(#cl)" stroke="#000" stroke-width="1.5"/>
      <circle cx="21" cy="40" r="2.4" fill="#0c0c0c"/><circle cx="99" cy="40" r="2.4" fill="#0c0c0c"/>
      <circle cx="21" cy="83" r="2.4" fill="#0c0c0c"/><circle cx="99" cy="83" r="2.4" fill="#0c0c0c"/>
      <g stroke="${accent}" stroke-width="2.4" opacity=".95">
        <circle cx="60" cy="66" r="12" fill="none"/>
        <path d="M60 50v9M60 73v9M44 66h9M67 66h9" stroke-linecap="round"/>
      </g>
      <circle cx="60" cy="66" r="3" fill="${accent}"/>
    </svg>`;

  /* --------------------------------------------------------- build card */
  const buildCard = (c, extra='') => {
    const stats = STAT_KEYS.map(k =>
      `<div class="stat"><div class="lb">${k}</div><div class="vl" data-v="${c.stats[k]}">${c.stats[k]}</div></div>`
    ).join('');
    return `<div class="fut ${c.tier} ${extra}">
      <div class="shape frame"></div>
      <div class="shape face"></div>
      <div class="shape shine"></div>
      <div class="content">
        <div class="top">
          <div class="rating-block">
            <div class="rating">${c.rating}</div>
            <div class="rline"><i></i><span class="dia"></span><i></i></div>
            <div class="pos">${c.pos}</div>
          </div>
          <div class="silh">${SILH}</div>
        </div>
        <div class="name"><span>${c.name}</span></div>
        <div class="meta">
          <div class="flag">${flagHTML(c.nation)}</div>
          <div class="msep"></div>
          <div class="team">${SHIELD}<b>${c.team}</b></div>
        </div>
        <div class="stats">${stats}</div>
      </div>
    </div>`;
  };

  /* ------------------------------------------------------------- DOM */
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const el = {
    coins:     $('#coins-val'),
    store:     $('#screen-store'),
    club:      $('#screen-club'),
    packs:     $('#packs'),
    tabStore:  $('#tab-store'),
    tabClub:   $('#tab-club'),
    overlay:   $('#overlay'),
    stage:     $('#stage'),
    toast:     $('#toast'),
    modal:     $('#modal'),
    modalBody: $('#modal-body'),
    claim:     $('#claim'),
    mute:      $('#mute'),
  };

  const fmt = (n) => n.toLocaleString('en-US');
  const renderCoins = () => { el.coins.textContent = fmt(state.coins); };

  let toastT;
  const toast = (msg) => {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.toast.classList.remove('show'), 2200);
  };

  /* ------------------------------------------------------------- sound */
  let AC, muted = !!state.muted;
  const audio = () => (AC = AC || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f0, f1, dur, type='sine', gain=0.14) => {
    if (muted) return;
    try {
      const ac = audio(), o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(f1, ac.currentTime + dur);
      g.gain.setValueAtTime(gain, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch {}
  };
  const whoosh = () => tone(180, 900, 0.5, 'sawtooth', 0.08);
  const ding = (tier) => {
    const base = { bronze:392, silver:466, gold:523, icon:659 }[tier] || 523;
    tone(base, base, 0.5, 'triangle', 0.16);
    setTimeout(() => tone(base*1.5, base*1.5, 0.6, 'sine', 0.12), 90);
    if (tier === 'icon' || tier === 'gold') setTimeout(() => tone(base*2, base*2, 0.7, 'sine', 0.1), 190);
  };
  const setMute = (m) => {
    muted = m; state.muted = m; save();
    el.mute.innerHTML = m
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>';
  };

  /* --------------------------------------------------------- store view */
  const renderStore = () => {
    el.packs.innerHTML = PACKS.map(p => {
      const odds = `<span>G ${p.odds.gold}%</span><span>Icon ${p.odds.icon}%</span>`;
      const canAfford = state.coins >= p.cost;
      return `<div class="pack" style="--pk:${p.accent}">
        <div class="pack-badge">${p.badge}</div>
        ${crateSVG(p.accent)}
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="odds">${odds}</div>
        <button class="buy" data-pack="${p.id}" ${canAfford ? '' : 'disabled'}>
          <span class="coin"></span>${fmt(p.cost)}
        </button>
      </div>`;
    }).join('');
  };

  /* ----------------------------------------------------- club / collection */
  const clubArray = () => Object.values(state.club).sort((a,b) => b.rating - a.rating || b.count - a.count);
  const renderClub = () => {
    const arr = clubArray();
    const total = arr.reduce((n,c) => n + c.count, 0);
    const best  = arr.length ? arr[0].rating : 0;
    const head = `<div class="club-head">
      <div class="stat-pill"><b>${total}</b><span>Cards pulled</span></div>
      <div class="stat-pill"><b>${arr.length}</b><span>Unique</span></div>
      <div class="stat-pill"><b>${best || '—'}</b><span>Best rating</span></div>
    </div>`;
    if (!arr.length) {
      el.club.innerHTML = head + `<div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></svg>
        Your club is empty. Open a crate to pull your first card.</div>`;
      return;
    }
    const grid = arr.map(c => `<div class="cell" data-name="${c.name}">
      ${c.count > 1 ? `<span class="dupe">×${c.count}</span>` : ''}
      ${buildCard(c, 'sm')}
    </div>`).join('');
    el.club.innerHTML = head + `<div class="grid">${grid}</div>`;
  };

  const addToClub = (c) => {
    const cur = state.club[c.name];
    if (cur) cur.count += 1;
    else state.club[c.name] = Object.assign({ count: 1 }, c);
    save();
  };

  /* ---------------------------------------------------- opening sequence */
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  let busy = false;

  const spawnSparks = (n, color) => {
    for (let i=0;i<n;i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      const ang = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 260;
      s.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--ty', Math.sin(ang) * dist + 'px');
      s.style.setProperty('--sz', (4 + Math.random()*8) + 'px');
      s.style.setProperty('--sc', color);
      s.style.setProperty('--dur', (0.7 + Math.random()*0.9) + 's');
      el.stage.appendChild(s);
      requestAnimationFrame(() => s.classList.add('go'));
      setTimeout(() => s.remove(), 1800);
    }
  };

  const countUp = (card) => {
    $$('.vl', card).forEach(node => {
      const target = +node.dataset.v;
      const start = performance.now(), dur = 650;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        node.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
        else node.textContent = target;
      };
      requestAnimationFrame(step);
    });
  };

  const openPack = async (pack) => {
    if (busy) return;
    if (state.coins < pack.cost) { toast('Not enough coins'); return; }
    busy = true;
    state.coins -= pack.cost; renderCoins(); save();

    const card = pull(pack);
    const glow = GLOW[card.tier];

    // overlay scene
    el.overlay.style.setProperty('--pk', pack.accent);
    el.overlay.style.setProperty('--glow', glow);
    el.stage.innerHTML = `
      <div class="flash" id="flash"></div>
      <div class="rays" id="rays"></div>
      <div class="beam" id="beam"></div>
      <div class="opener" id="opener">
        ${crateSVG(pack.accent, 'crate-svg')}
        <div class="tap-hint">Tap to open</div>
      </div>`;
    el.overlay.classList.add('show');
    try { audio().resume(); } catch {}

    const opener = $('#opener');
    const doReveal = () => reveal(card, pack);
    opener.addEventListener('click', doReveal, { once: true });
    // safety auto-open if the user just stares at it
    autoTimer = setTimeout(() => { if (document.body.contains(opener)) doReveal(); }, 4200);
  };

  let autoTimer;
  const reveal = async (card, pack) => {
    clearTimeout(autoTimer);
    const glow = GLOW[card.tier];
    const opener = $('#opener'), flash = $('#flash'), beam = $('#beam'), rays = $('#rays');
    if (!opener || opener.dataset.done) return;
    opener.dataset.done = '1';

    opener.classList.add('gone');
    whoosh();
    flash.classList.add('pop');
    beam.classList.add('fire');
    if (card.tier === 'gold' || card.tier === 'icon') rays.classList.add('spin');

    await wait(300);
    spawnSparks(card.tier === 'icon' ? 34 : card.tier === 'gold' ? 20 : 8, glow);

    // reveal card (back → flip → front)
    const rev = document.createElement('div');
    rev.className = 'reveal';
    rev.innerHTML = `
      <div class="flipper">
        <div class="flip-inner" id="flipInner">
          <div class="face-back"><div class="card-back">
            <svg class="cb-mark" viewBox="0 0 100 100" fill="none" stroke="${glow}" stroke-width="4" stroke-linecap="round">
              <circle cx="50" cy="50" r="34"/><path d="M50 8v22M50 70v22M8 50h22M70 50h22"/><circle cx="50" cy="50" r="6" fill="${glow}" stroke="none"/>
            </svg>
          </div></div>
          <div class="face-front">${buildCard(card)}</div>
        </div>
      </div>
      <div class="reveal-actions" id="revActions"></div>`;
    el.stage.appendChild(rev);
    requestAnimationFrame(() => rev.classList.add('show'));

    await wait(180);
    const flip = $('#flipInner');
    flip.classList.add('flip');
    ding(card.tier);

    await wait(1000);
    countUp(rev);
    if (card.tier === 'icon') spawnSparks(26, glow);

    // record + actions
    addToClub(card);
    const sv = sellValue(card);
    const affordAgain = state.coins >= pack.cost;
    $('#revActions').innerHTML = `
      <div class="tier-tag">${TIER_LABEL[card.tier]} · ${card.name}</div>
      <button class="btn primary" id="rev-keep">Add to Club</button>
      <button class="btn" id="rev-sell"><span class="coin"></span>Quick Sell ${fmt(sv)}</button>
      <button class="btn" id="rev-again" ${affordAgain ? '' : 'disabled'}>Open Another · ${fmt(pack.cost)}</button>`;

    $('#rev-keep').onclick = () => { closeOverlay(); toast(`${card.name} added to your club`); };
    $('#rev-sell').onclick = () => {
      // undo the add and refund
      const cur = state.club[card.name];
      if (cur) { cur.count -= 1; if (cur.count <= 0) delete state.club[card.name]; }
      state.coins += sv; renderCoins(); save();
      closeOverlay(); toast(`Quick sold ${card.name} for ${fmt(sv)} coins`);
    };
    $('#rev-again').onclick = () => { closeOverlay(); setTimeout(() => openPack(pack), 120); };
    busy = false;
  };

  const closeOverlay = () => {
    el.overlay.classList.remove('show');
    el.stage.innerHTML = '';
    busy = false;
    renderStore();
    if (el.club.classList.contains('active')) renderClub();
  };

  /* ------------------------------------------------------------- modal */
  const openModal = (name) => {
    const c = state.club[name];
    if (!c) return;
    const sv = sellValue(c);
    el.modalBody.innerHTML = `
      ${buildCard(c)}
      <div class="reveal-actions">
        <div class="tier-tag" style="--glow:${GLOW[c.tier]};color:${GLOW[c.tier]}">${TIER_LABEL[c.tier]} · ${c.count > 1 ? c.count + ' copies' : '1 copy'}</div>
        <button class="btn" id="m-sell"><span class="coin"></span>Quick Sell ${fmt(sv)}</button>
        <button class="btn primary" id="m-close">Close</button>
      </div>`;
    el.modal.classList.add('show');
    $('#m-close').onclick = () => el.modal.classList.remove('show');
    $('#m-sell').onclick = () => {
      const cur = state.club[name];
      cur.count -= 1; if (cur.count <= 0) delete state.club[name];
      state.coins += sv; renderCoins(); save();
      el.modal.classList.remove('show'); renderClub();
      toast(`Quick sold ${name} for ${fmt(sv)} coins`);
    };
  };

  /* ------------------------------------------------------------- claim */
  const CLAIM_MS = 15000, CLAIM_AMT = 500;
  const tickClaim = () => {
    const left = state.lastClaim + CLAIM_MS - Date.now();
    if (left > 0) {
      el.claim.disabled = true;
      el.claim.querySelector('span').textContent = Math.ceil(left/1000) + 's';
    } else {
      el.claim.disabled = false;
      el.claim.querySelector('span').textContent = '+500';
    }
  };

  /* --------------------------------------------------------- navigation */
  const show = (which) => {
    const store = which === 'store';
    el.store.classList.toggle('active', store);
    el.club.classList.toggle('active', !store);
    el.tabStore.classList.toggle('active', store);
    el.tabClub.classList.toggle('active', !store);
    if (store) renderStore(); else renderClub();
  };

  /* ------------------------------------------------------------- wire */
  el.packs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pack]');
    if (!btn) return;
    const pack = PACKS.find(p => p.id === btn.dataset.pack);
    if (pack) openPack(pack);
  });
  el.club.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) openModal(cell.dataset.name);
  });
  el.tabStore.onclick = () => show('store');
  el.tabClub.onclick  = () => show('club');
  el.mute.onclick = () => setMute(!muted);
  el.modal.addEventListener('click', (e) => { if (e.target === el.modal) el.modal.classList.remove('show'); });
  el.claim.onclick = () => {
    if (state.lastClaim + CLAIM_MS - Date.now() > 0) return;
    state.coins += CLAIM_AMT; state.lastClaim = Date.now(); renderCoins(); save();
    renderStore(); toast(`+${CLAIM_AMT} coins claimed`);
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { el.modal.classList.remove('show'); if (busy === false && el.overlay.classList.contains('show')) closeOverlay(); }
  });

  /* ------------------------------------------------------------- init */
  renderCoins();
  setMute(muted);
  show('store');
  setInterval(tickClaim, 500); tickClaim();

  // expose for debugging
  window.__cs2 = { state, PLAYERS, BY_TIER, buildCard, save };
})();
