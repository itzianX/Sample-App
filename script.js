(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'cubeMasterStudio_v2';
  const LEGACY_KEY = 'cube_master_solves';
  const MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
  const MODIFIERS = ['', "'", '2'];
  const OPPOSITE = { R: 'L', L: 'R', U: 'D', D: 'U', F: 'B', B: 'F' };

  const C = { x: v => [v[0], v[2], -v[1]], y: v => [-v[2], v[1], v[0]], z: v => [v[1], -v[0], v[2]] };
  const MV = { R: ['x', p => p[0] == 1, 1], L: ['x', p => p[0] == -1, -1], U: ['y', p => p[1] == 1, 1], D: ['y', p => p[1] == -1, -1], F: ['z', p => p[2] == 1, 1], B: ['z', p => p[2] == -1, -1], M: ['x', p => p[0] == 0, -1], E: ['y', p => p[1] == 0, -1], S: ['z', p => p[2] == 0, 1], r: ['x', p => p[0] >= 0, 1], l: ['x', p => p[0] <= 0, -1], u: ['y', p => p[1] >= 0, 1], d: ['y', p => p[1] <= 0, -1], f: ['z', p => p[2] >= 0, 1], b: ['z', p => p[2] <= 0, -1], x: ['x', () => 1, 1], y: ['y', () => 1, 1], z: ['z', () => 1, 1] };
  const ST = []; for (let x = -1; x <= 1; x++)for (let y = -1; y <= 1; y++)for (let z = -1; z <= 1; z++) [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(n => { if (x * n[0] + y * n[1] + z * n[2] == 1) ST.push({ p: [x, y, z], n }); });
  const IDX = new Map(ST.map((s, i) => [s.p + '|' + s.n, i]));
  const SOLVED = ST.map((s, i) => i);
  const COL = { '0,1,0': '#facc15', '0,-1,0': '#f8fafc', '0,0,1': '#22c55e', '0,0,-1': '#2563eb', '1,0,0': '#ef4444', '-1,0,0': '#fb923c' };
  const PC = {};
  function perm(t) {
    if (PC[t]) return PC[t]; const m = MV[t[0]], base = m[2] == 1 ? 1 : 3, k = t[1] == "'" ? (4 - base) % 4 : t[1] == '2' ? 2 : base, P = SOLVED.slice();
    ST.forEach((s, i) => { if (!m[1](s.p)) return; let p = s.p, n = s.n; for (let q = 0; q < k; q++) { p = C[m[0]](p); n = C[m[0]](n); } P[IDX.get(p + '|' + n)] = i; }); return PC[t] = P;
  }
  const toks = a => a.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  function apply(arr, alg) { for (const t of toks(alg)) { const P = perm(t); arr = P.map(i => arr[i]); } return arr; }
  function inv(alg) { return toks(alg).reverse().map(t => t[1] == "'" ? t[0] : t[1] == '2' ? t : t + "'").join(' '); }
  const caseState = alg => apply(SOLVED, inv(alg));

  function svgTop(arr, oll, arrows) {
    const c = 15, t = 6, o = t + 2, w = 3 * c + 2 * o; let r = `<svg viewBox="0 0 ${w} ${w}" xmlns="http://www.w3.org/2000/svg">`;
    arr.forEach((id, j) => {
      const s = ST[j], k = ST[id].n + '', f = oll && k != '0,1,0' ? '#4b5260' : COL[k], [x, y, z] = s.p, n = s.n + ''; let X, Y, W = c - 1, H = c - 1;
      if (n == '0,1,0') { X = o + (x + 1) * c; Y = o + (z + 1) * c; } else if (y != 1) return;
      else if (n == '0,0,1') { X = o + (x + 1) * c; Y = o + 3 * c + 1; H = t; } else if (n == '0,0,-1') { X = o + (x + 1) * c; Y = o - t - 1; H = t; }
      else if (n == '1,0,0') { X = o + 3 * c + 1; Y = o + (z + 1) * c; W = t; } else if (n == '-1,0,0') { X = o - t - 1; Y = o + (z + 1) * c; W = t; } else return;
      r += `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="2" fill="${f}"/>`;
    }); return r + (arrows ? pllArrows(arr) : '') + '</svg>';
  }
  function svgIso(arr, pair) {
    const k = 15, P = v => ((v[0] - v[2]) * .866 * k + 60).toFixed(1) + ',' + ((-v[1] + .5 * (v[0] + v[2])) * k + 52).toFixed(1); let r = '<svg viewBox="8 2 104 100" xmlns="http://www.w3.org/2000/svg">';
    arr.forEach((id, j) => {
      const s = ST[j]; if (s.n[0] + s.n[1] + s.n[2] < 0) return; const ax = [0, 1, 2].filter(i => !s.n[i]), c = s.p.map((v, i) => v + .5 * s.n[i]);
      const pts = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => { const q = c.slice(); q[ax[0]] += .44 * a; q[ax[1]] += .44 * b; return P(q); }).join(' ');
      const on = !pair || pair.has(id) || ST[id].p.filter(v => !v).length == 2; r += `<polygon points="${pts}" fill="${on ? COL[ST[id].n] : '#050506'}" stroke="${on ? '#0d0e11' : '#2b2f37'}" stroke-width="1.2" stroke-linejoin="round"/>`;
    }); return r + '</svg>';
  }
  function svgNet(arr) {
    const c = 9, G = { '0,1,0': [1, 0, (x, y, z) => [x + 1, z + 1]], '-1,0,0': [0, 1, (x, y, z) => [z + 1, 1 - y]], '0,0,1': [1, 1, (x, y, z) => [x + 1, 1 - y]], '1,0,0': [2, 1, (x, y, z) => [1 - z, 1 - y]], '0,0,-1': [3, 1, (x, y, z) => [1 - x, 1 - y]], '0,-1,0': [1, 2, (x, y, z) => [x + 1, 1 - z]] };
    let r = '<svg viewBox="0 0 110 83" xmlns="http://www.w3.org/2000/svg">';
    arr.forEach((id, j) => { const s = ST[j], g = G[s.n + ''], [a, b] = g[2](...s.p); r += `<rect x="${(g[0] * 3 + a) * c + 1}" y="${(g[1] * 3 + b) * c + 1}" width="${c - 1.5}" height="${c - 1.5}" rx="1.5" fill="${COL[ST[id].n]}"/>`; }); return r + '</svg>';
  }

  const PLL = [['Aa', "x (R' U R') D2 (R U' R') D2 R2 x'"], ['Ab', "x R2 D2 (R U R') D2 (R U' R) x'"], ['E', "x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D') x"], ['F', "(R' U' F') (R U R' U') (R' F R2 U') (R' U' R U) (R' U R)"], ['Ga', "R2 U (R' U R' U') R U' R2 U' D (R' U R) D'"], ['Gb', "(R' U' R) U D' R2 U (R' U R U') R U' R2 D"], ['Gc', "R2 U' (R U' R) U (R' U R2) D' (U R U' R') D"], ['Gd', "(R U R' U') D (R2 U' R U' R') U R' U R2 D'"], ['H', "(M2 U M2) U2 (M2 U M2)"], ['Ja', "x (R2 F R F') R U2 (r' U r) U2 x'"], ['Jb', "(R U R' F') (R U R' U') (R' F R2 U') R'"], ['Na', "(R U R' U) (R U R' F') (R U R' U') (R' F R2 U') R' U2 (R U' R')"], ['Nb', "(R' U R U') (R' F' U' F) (R U R') (F R' F' R) U' R"], ['Ra', "(R U' R' U') (R U R D) (R' U' R D') (R' U2 R')"], ['Rb', "(R' U2 R U2) R' F (R U R' U') R' F' R2"], ['T', "(R U R' U') (R' F R2 U') (R' U' R U) (R' F')"], ['Ua', "(M2 U M) U2 (M' U M2)"], ['Ub', "(M2 U' M) U2 (M' U' M2)"], ['V', "(R' U R' U') y (R' F' R2 U') (R' U R' F) R F y'"], ['Y', "F R U' R' U' R U R' F' (R U R' U') (R' F R F')"], ['Z', "(M' U M2 U) (M2 U) (M' U2) M2"]];
  const OLL = ["R U2 R2 F R F' U2 R' F R F'", "r U r' U2 r U2 R' U2 R U' r'", "r' R2 U R' U r U2 r' U M'", "M U' r U2 r' U' R U' R' M'", "r' U2 R U R' U r", "r U2 R' U' R U' r'", "r U R' U R U2 r'", "r' U' R U' R' U2 r", "R U R' U' R' F R2 U R' U' F'", "R U R' U R' F R F' R U2 R'", "r U R' U R' F R F' R U2 r'", "F R U R' U' F' U F R U R' U' F'", "F U R U' R2 F' R U R U' R'", "R' F R U R' F' R F U' F'", "r' U' r R' U' R U r' U r", "r U r' R U R' U' r U' r'", "R U R' U R' F R F' U2 R' F R F'", "r U R' U R U2 r2 U' R U' R' U2 r", "r' R U R U R' U' M' R' F R F'", "r U R' U' M2 U R U' R' U' M'", "R U2 R' U' R U R' U' R U' R'", "R U2 R2 U' R2 U' R2 U2 R", "R2 D R' U2 R D' R' U2 R'", "r U R' U' r' F R F'", "F' r U R' U' r' F R", "R U2 R' U' R U' R'", "R U R' U R U2 R'", "r U R' U' r' R U R U' R'", "R U R' U' R U' R' F' U' F R U R'", "F R' F R2 U' R' U' R U R' F2", "R' U' F U R U' R' F' R", "R U B' U' R' U R B R'", "R U R' U' R' F R F'", "R U R2 U' R' F R U R U' F'", "R U2 R2 F R F' R U2 R'", "L' U' L U' L' U L U L F' L' F", "F R' F' R U R U' R'", "R U R' U R U' R' U' R' F R F'", "L F' L' U' L U F U' L'", "R' F R U R' U' F' U R", "R U R' U R U2 R' F R U R' U' F'", "R' U' R U' R' U2 R F R U R' U' F'", "R' U' F' U F R", "F U R U' R' F'", "F R U R' U' F'", "R' U' R' F R F' U R", "F' L' U' L U L' U' L U F", "F R U R' U' R U R' U' F'", "r U' r2 U r2 U r2 U' r", "r' U r2 U' r2 U' r2 U r'", "F U R U' R' U R U' R' F'", "R U R' U R U' B U' B' R'", "r' U' R U' R' U R U' R' U2 r", "r U R' U R U' R' U R U2 r'", "R U2 R2 U' R U' R' U2 F R F'", "r U r' U R U' R' U R U' R' r U' r'", "R U R' U' M' U R U' r'"];

  function arrowSvg(a, b, two) {
    // Small, slim arrows: short shaft, compact head, thin outline.
    const cor = a.split(',').every(v => v != 0), O = cor ? '#0d0e11' : '#fff', N = cor ? '#fff' : '#0d0e11';
    const f = k => { const [x, z] = k.split(',').map(Number); return [8 + (x + 1) * 15 + 7, 8 + (z + 1) * 15 + 7]; },
      p = f(a), q = f(b), L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L,
      GAP = 3.8, HL = 3, HW = 1.8, P = [p[0] + ux * GAP, p[1] + uy * GAP], Q = [q[0] - ux * GAP, q[1] - uy * GAP], n = v => v.toFixed(1);
    const head = (t, d) => { const bx = t[0] - ux * d * HL, by = t[1] - uy * d * HL; return `<polygon points="${n(t[0])},${n(t[1])} ${n(bx - uy * d * HW)},${n(by + ux * d * HW)} ${n(bx + uy * d * HW)},${n(by - ux * d * HW)}"/>`; };
    const body = `<line x1="${n(P[0])}" y1="${n(P[1])}" x2="${n(Q[0])}" y2="${n(Q[1])}"/>` + head(Q, 1) + (two ? head(P, -1) : '');
    return `<g stroke="${O}" stroke-width="2.1" stroke-linejoin="round" fill="${O}">${body}</g><g stroke="${N}" stroke-width="0.8" stroke-linejoin="round" fill="${N}">${body}</g>`;
  }
  function pllArrows(arr) { const mv = {}; arr.forEach((id, j) => { const s = ST[j]; if (s.n + '' != '0,1,0') return; const h = ST[id].p; if (s.p[0] != h[0] || s.p[2] != h[2]) mv[s.p[0] + ',' + s.p[2]] = h[0] + ',' + h[2]; }); const done = {}; let o = ''; for (const a in mv) { if (done[a]) continue; const b = mv[a], two = mv[b] === a; if (two) done[b] = 1; o += arrowSvg(a, b, two); } return o; }

  const F2LD = [["F' U2 F U F' U' F", "Pair apart in U"], ["U2 R2 U2 R' U' R U' R2", "Pair apart in U"], ["U2 F2 U2 F U F' U F2", "Pair apart in U"], ["R U2 R' U' R U R'", "Pair apart in U"], ["U2 F' U' F2 R' F' R", "Pair apart in U"], ["U R U2 R' U R U' R'", "Pair apart in U"], ["U' F' U2 F2 R' F' R", "Pair apart in U"], ["R U' R' U2 R U R'", "Pair apart in U"], ["U F' U F U' F' U' F", "Pair apart in U"], ["R U' R U2 R2 U' R2 U' R2", "Pair apart in U"], ["F U2 F2 U' F2 U' F'", "Pair apart in U"], ["U R U' R'", "Pair apart in U"], ["U R U R' U2 F' U' F", "Pair apart in U"], ["U' R U R' U2 R U' R'", "Pair apart in U"], ["F' U' F", "Pair apart in U"], ["U' R U2 R' U2 R U' R'", "Pair apart in U"], ["F R' F' R", "Pair apart in U"], ["R' U2 R2 U R2 U R", "Pair apart in U"], ["R U' R' U2 F' U' F", "Pair apart in U"], ["U' R U' R' U R U R'", "Pair apart in U"], ["R2 U2 F R2 F' U2 R2", "Pair apart in U"], ["R U R'", "Pair apart in U"], ["U F' U' F U2 F' U F", "Pair apart in U"], ["U' R U R' U R U R'", "Pair apart in U"], ["R2 U R2 U R2 U2 R2", "Corner in U, edge in slot"], ["F' U F R U2 R'", "Corner in U, edge in slot"], ["U' R U' R' U2 R U' R'", "Corner in U, edge in slot"], ["U' R U R' U F' U' F", "Corner in U, edge in slot"], ["U R U R' U2 R U R'", "Corner in U, edge in slot"], ["U F' U' F U' R U R'", "Corner in U, edge in slot"], ["U R U' R' F R' F' R", "Corner in slot, edge in U"], ["R' U' R' U' R2 U R U R", "Corner in slot, edge in U"], ["F' U F2 R' F' R", "Corner in slot, edge in U"], ["U' R U R' U' R U R'", "Corner in slot, edge in U"], ["U R' F R F2 U' F", "Corner in slot, edge in U"], ["U' R U' R' U R U' R'", "Corner in slot, edge in U"], ["R U' R U2 F R2 F' U2 R2", "Both in slot"], ["R U2 R U R' U R U2 R2", "Both in slot"], ["R U F R U R' U' F' R'", "Both in slot"], ["R2 U2 R' U' R U' R' U2 R'", "Both in slot"], ["R F U R U' R' F' U' R'", "Both in slot"]];
  // Groups conjugates (R U R'), triggers (R U R' U'), (R' F R F') etc. in parentheses. Never changes the moves.
  function paren(alg) {
    if (alg.includes('(')) return alg;
    const t = alg.split(/\s+/).filter(Boolean), out = [], rotation = x => /^[xyz]/.test(x);
    const isInv = (a, b) => a[0] === b[0] && ((a[1] === "'" && !b[1]) || (!a[1] && b[1] === "'"));
    let i = 0;
    while (i < t.length) {
      const [a, b, c, d] = [t[i], t[i + 1], t[i + 2], t[i + 3]];
      if (b && c && d && ![a, b, c, d].some(rotation) && a[0] !== b[0] && isInv(a, c) && isInv(b, d)) { out.push(`(${a} ${b} ${c} ${d})`); i += 4; }
      else if (b && c && ![a, b, c].some(rotation) && a[0] !== b[0] && isInv(a, c)) { out.push(`(${a} ${b} ${c})`); i += 3; }
      else { out.push(a); i++; }
    }
    return out.join(' ');
  }
  const TRIGGER_NOTE = ' Moves in ( ) are triggers: do each group as one smooth chunk.';
  // Standard textbook groupings for well-known OLLs (same moves, just bracketed).
  const OLLP = { 9: "(R U R' U') (R' F R2) (U R' U') F'", 10: "(R U R' U) (R' F R F') (R U2 R')", 12: "F (R U R' U') F' U F (R U R' U') F'", 14: "(R' F R) U (R' F' R) (F U' F')", 17: "(R U R' U) (R' F R F') U2 (R' F R F')", 20: "(r U R' U') M2 (U R U' R') U' M'", 22: "R U2 (R2 U' R2 U' R2) U2 R", 23: "R2 D (R' U2 R) D' (R' U2 R')", 24: "(r U R' U') (r' F R F')", 27: "(R U R' U) (R U2 R')", 28: "(r U R' U') (r' R U R U' R')", 30: "(F R' F R2 U') (R' U' R U) R' F2", 32: "(R U B' U') (R' U R B R')", 34: "(R U R2 U') (R' F R U) (R U' F')", 41: "(R U R' U) (R U2 R') F (R U R' U') F'", 42: "(R' U' R U') (R' U2 R) F (R U R' U') F'", 43: "R' U' (F' U F) R", 46: "R' U' (R' F R F') U R", 52: "(R U R' U) (R U' B U' B') R'", 55: "(R U2 R2) (U' R U' R') U2 (F R F')" };
  const ALGORITHMS = [...F2LD.map(([m, c], i) => ({ id: 'f2l-' + (i + 1), cat: 'F2L', name: 'F2L ' + (i + 1), moves: paren(m), description: c + '. Colored stickers are the pair to insert into the front-right slot; black stickers are not part of the case. Turn U first to line the pieces up if needed.' + TRIGGER_NOTE })), ...OLL.map((m, i) => ({ id: 'oll-' + (i + 1), cat: 'OLL', name: 'OLL ' + (i + 1), moves: OLLP[i + 1] || paren(m), description: 'Orient the last layer. Grey stickers on the diagram are the ones that are not yellow yet.' + TRIGGER_NOTE })), ...PLL.map(([n, m]) => ({ id: 'pll-' + n.toLowerCase(), cat: 'PLL', name: n + ' Perm', moves: paren(m), description: 'Permute the last layer once it is oriented. Arrows show where each piece goes; two heads mean a swap. Add a U turn before or after as needed.' + TRIGGER_NOTE }))];

  ALGORITHMS.forEach(a => { a.plain = a.moves.replace(/[()]/g, '').replace(/\s+/g, ' ').trim(); });

  let state = { solves: [], favorites: [], practice: {}, ratings: {}, scramble: '', inspection: false, profile: null };
  let phase = 'idle'; // idle, holding, inspection, running
  let holdTimer = null, tickTimer = null, inspectionTimer = null;
  let startedAt = 0, inspectionStarted = 0, elapsed = 0, inspectionEnabled = false, readyArmed = false;
  let pendingPenalty = 0, currentAlgorithm = null, practiceQueue = [], practiceIndex = 0, answerVisible = false, toastTimer = null;

  function normProfile(p) {
    p = p && typeof p === 'object' ? p : {};
    const out = {
      name: typeof p.name === 'string' ? p.name.replace(/\s+/g, ' ').trim().slice(0, 24) : '',
      createdAt: Number.isFinite(p.createdAt) ? p.createdAt : 0,
      usageMs: Number.isFinite(p.usageMs) && p.usageMs > 0 ? p.usageMs : 0,
      days: Array.isArray(p.days) ? [...new Set(p.days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-3650) : [],
      totalSolves: Number.isFinite(p.totalSolves) && p.totalSolves > 0 ? p.totalSolves : 0,
      welcomed: !!p.welcomed
    };
    const solves = Array.isArray(state.solves) ? state.solves : [];
    out.totalSolves = Math.max(out.totalSolves, solves.length);
    if (!out.createdAt) out.createdAt = solves.length ? Math.min(Date.now(), ...solves.map(s => Number.isFinite(s.date) ? s.date : Date.now())) : Date.now();
    if (!out.days.length) solves.forEach(s => { if (Number.isFinite(s.date) && !out.days.includes(dayKey(new Date(s.date)))) out.days.push(dayKey(new Date(s.date))); });
    return out;
  }
  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const parsed = JSON.parse(raw); state = { ...state, ...parsed }; }
      else {
        const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
        if (Array.isArray(legacy)) state.solves = legacy.filter(s => s && Number.isFinite(s.time)).map(s => ({ id: s.id || Date.now() + Math.random(), time: s.time, penalty: [0, 1, 2].includes(s.penalty) ? s.penalty : 0, scramble: s.scramble || '', date: s.date || Date.now() }));
      }
    } catch (e) { console.warn('Saved session could not be read:', e); state.solves = []; }
    if (!Array.isArray(state.solves)) state.solves = [];
    if (!Array.isArray(state.favorites)) state.favorites = [];
    if (!state.practice || typeof state.practice !== 'object') state.practice = {};
    if (!state.ratings || typeof state.ratings !== 'object') state.ratings = {};
    state.profile = normProfile(state.profile);
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Storage is full or unavailable. Export your session to keep a backup.'); }
  }
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }
  function format(ms) {
    if (ms === Infinity || ms === null || !Number.isFinite(ms)) return 'DNF';
    ms = Math.max(0, ms);
    const mins = Math.floor(ms / 60000), secs = Math.floor(ms / 1000) % 60, cs = Math.floor(ms % 1000 / 10);
    return mins ? `${mins}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}` : `${secs}.${String(cs).padStart(2, '0')}`;
  }
  function effective(s) { return s.penalty === 2 ? Infinity : s.time + (s.penalty === 1 ? 2000 : 0); }
  function average(n) {
    if (state.solves.length < n) return '—';
    const times = state.solves.slice(0, n).map(effective).sort((a, b) => a - b);
    if (times.filter(t => t === Infinity).length > 1) return 'DNF';
    times.shift(); times.pop();
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return Number.isFinite(avg) ? format(Math.round(avg)) : 'DNF';
  }
  function sessionAverage() {
    if (!state.solves.length) return '—';
    const vals = state.solves.map(effective);
    if (vals.every(v => v === Infinity)) return 'DNF';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Number.isFinite(avg) ? format(Math.round(avg)) : 'DNF';
  }
  function renderStats() {
    const valid = state.solves.filter(s => s.penalty !== 2).map(effective);
    $('statCount').textContent = state.solves.length;
    $('statBest').textContent = valid.length ? format(Math.min(...valid)) : '—';
    $('statAo5').textContent = average(5); $('statAo12').textContent = average(12);
    $('sessionAvg').textContent = sessionAverage();
    $('lastSolve').textContent = state.solves.length ? format(effective(state.solves[0])) : '—';
    $('plus2Count').textContent = state.solves.filter(s => s.penalty === 1).length;
    $('dnfCount').textContent = state.solves.filter(s => s.penalty === 2).length;
  }
  function renderHistory() {
    const host = $('historyList'); host.innerHTML = '';
    if (!state.solves.length) { host.innerHTML = '<div class="empty">No solves yet. Start your first timed solve.</div>'; return; }
    state.solves.slice(0, 100).forEach((s, i) => {
      const row = document.createElement('div'); row.className = 'history-row';
      const index = document.createElement('span'); index.className = 'solve-index'; index.textContent = state.solves.length - i;
      const time = document.createElement('span'); time.className = 'solve-time' + (s.penalty === 1 ? ' plus2' : s.penalty === 2 ? ' dnf' : ''); time.textContent = s.penalty === 2 ? 'DNF' : format(s.time + (s.penalty === 1 ? 2000 : 0)) + (s.penalty === 1 ? '+' : '');
      const actions = document.createElement('div'); actions.className = 'solve-buttons';
      [['+2', 1], ['DNF', 2], ['×', 'delete']].forEach(([label, kind]) => {
        const b = document.createElement('button'); b.className = 'btn small'; b.textContent = label; b.setAttribute('aria-label', kind === 'delete' ? 'Delete solve' : `Toggle ${label} penalty`);
        if (kind === s.penalty) b.style.borderColor = kind === 1 ? 'var(--yellow)' : kind === 2 ? 'var(--red)' : '';
        b.addEventListener('click', () => {
          if (kind === 'delete') { state.solves = state.solves.filter(x => x.id !== s.id); }
          else s.penalty = s.penalty === kind ? 0 : kind;
          persist(); renderAll();
        }); actions.appendChild(b);
      });
      row.append(index, time, actions); host.appendChild(row);
    });
  }
  function renderSpark() { const v = state.solves.slice(0, 20).reverse().map(effective).map(t => t === Infinity ? null : t), ok = v.filter(t => t != null), h = $('spark'); if (ok.length < 2) { h.innerHTML = ''; return; } const mn = Math.min(...ok), mx = Math.max(...ok), W = 200, H = 44, pts = v.map((t, i) => t == null ? null : [(i * W / (v.length - 1)).toFixed(1), (H - 4 - (t - mn) / ((mx - mn) || 1) * (H - 8)).toFixed(1)]).filter(Boolean); h.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--green)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><small>Last ${v.length} solves · best ${format(mn)} · slowest ${format(mx)}</small>`; }
  function renderAll() { renderStats(); renderHistory(); renderSpark(); renderPracticeStats(); renderProfileChip(); }
  function generateScramble(length = 20) {
    const out = []; let prev = '', prev2 = '';
    while (out.length < length) {
      const face = MOVES[Math.floor(Math.random() * MOVES.length)];
      if (face === prev) continue;
      if (face === prev2 && OPPOSITE[face] === prev) continue;
      out.push(face + MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)]);
      prev2 = prev; prev = face;
    }
    return out.join(' ');
  }
  function drawNet() { try { $('scrambleNet').innerHTML = svgNet(apply(SOLVED, state.scramble)); } catch (e) { $('scrambleNet').innerHTML = ''; } }
  function newScramble() {
    if (phase === 'running' || phase === 'inspection') { toast('Stop the timer before changing the scramble.'); return; }
    state.scramble = generateScramble(); $('scrambleText').textContent = state.scramble; drawNet(); persist();
  }
  function displayTimer(ms) { $('timeDisplay').textContent = format(ms); }
  function setPhase(next) {
    phase = next; document.body.classList.toggle('solving', next === 'running');
    const face = $('timerFace'), time = $('timeDisplay'), hint = $('timerHint');
    face.classList.toggle('arming', next === 'holding'); face.classList.remove('ready');
    face.classList.toggle('running', next === 'running');
    face.classList.toggle('inspection', next === 'inspection');
    time.classList.toggle('running-text', next === 'running');
    time.classList.toggle('arming-text', next === 'holding'); time.classList.remove('ready-text');
    if (next === 'idle') { hint.textContent = 'Hold screen or Space to ready · release to start'; $('timerStatus').textContent = 'Ready when you are · inspection is optional'; }
    if (next === 'holding') { hint.textContent = 'Keep holding until it turns green'; $('timerStatus').textContent = 'Arming…'; }
    if (next === 'inspection') { hint.textContent = 'Inspection · release/press to start'; $('timerStatus').textContent = 'Inspection in progress'; }
    if (next === 'running') { hint.textContent = 'Tap or press Space to stop'; $('timerStatus').textContent = 'Solve in progress'; }
  }
  function clearClocks() { clearTimeout(holdTimer); clearInterval(tickTimer); clearInterval(inspectionTimer); holdTimer = tickTimer = inspectionTimer = null; }
  function startRunning() {
    const it = phase === 'inspection' ? performance.now() - inspectionStarted : 0; pendingPenalty = it > 17000 ? 2 : it > 15000 ? 1 : 0;
    clearClocks(); startedAt = performance.now(); setPhase('running');
    tickTimer = setInterval(() => displayTimer(performance.now() - startedAt), 10);
  }
  function saveSolve(ms) {
    state.solves.unshift({ id: Date.now() + Math.random(), time: Math.round(ms), penalty: pendingPenalty, scramble: state.scramble, date: Date.now() });
    pendingPenalty = 0; state.profile.totalSolves++; persist(); renderAll(); newScramble();
  }
  function stopRunning() {
    elapsed = performance.now() - startedAt; clearClocks(); displayTimer(elapsed); setPhase('idle'); saveSolve(elapsed);
  }
  function beginPress() {
    if (phase === 'running') { stopRunning(); return; }
    if (phase === 'inspection') { startRunning(); return; }
    if (phase === 'holding') return;
    if (phase === 'idle') {
      readyArmed = false;
      setPhase('holding');
      holdTimer = setTimeout(() => {
        if (phase !== 'holding') return;
        readyArmed = true; $('timerFace').classList.replace('arming', 'ready'); $('timeDisplay').classList.replace('arming-text', 'ready-text');
        if (inspectionEnabled) {
          phase = 'inspection'; inspectionStarted = performance.now(); setPhase('inspection'); $('timeDisplay').textContent = '15';
          inspectionTimer = setInterval(() => { const t = performance.now() - inspectionStarted, r = 15000 - t; $('timeDisplay').textContent = r > 0 ? String(Math.ceil(r / 1000)) : t < 17000 ? '+2' : 'DNF'; $('timerStatus').textContent = t < 8000 ? 'Inspection' : t < 12000 ? '8 seconds passed' : t < 15000 ? '12 seconds passed' : t < 17000 ? 'Over 15s: +2 penalty' : 'Over 17s: DNF'; }, 100);
        } else {
          $('timerHint').textContent = 'Ready — release to start';
          $('timerStatus').textContent = 'Ready';
        }
      }, 350);
    }
  }
  function releasePress() {
    if (phase === 'holding') {
      clearTimeout(holdTimer);
      if (readyArmed) { readyArmed = false; startRunning(); }
      else setPhase('idle');
    } else if (phase === 'inspection') {
      startRunning();
    }
  }
  function toggleTimerKeyboard() {
    if (phase === 'running') stopRunning();
    else if (phase === 'inspection') startRunning();
    else if (phase === 'idle') beginPress();
    else if (phase === 'holding') { clearTimeout(holdTimer); setPhase('idle'); }
  }
  $('timerFace').addEventListener('pointerdown', e => { if (e.button !== undefined && e.button !== 0) return; e.preventDefault(); if (phase === 'running' || phase === 'inspection') beginPress(); else beginPress(); });
  $('timerFace').addEventListener('pointerup', e => { e.preventDefault(); releasePress(); });
  $('timerFace').addEventListener('pointercancel', releasePress);
  $('timerFace').addEventListener('keydown', e => { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if (e.repeat) return; beginPress(); } });
  $('timerFace').addEventListener('keyup', e => { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); releasePress(); } });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName) || !$('view-timer').classList.contains('active') || document.querySelector('.modal-backdrop.open')) return;
    e.preventDefault();
    if (phase === 'running' || phase === 'inspection') toggleTimerKeyboard();
    else beginPress();
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) releasePress(); });
  $('inspectionToggle').addEventListener('click', () => {
    inspectionEnabled = !inspectionEnabled;
    $('inspectionToggle').textContent = `Inspection: ${inspectionEnabled ? 'On' : 'Off'}`;
    $('inspectionToggle').style.borderColor = inspectionEnabled ? 'var(--yellow)' : '';
    toast(`Inspection ${inspectionEnabled ? 'enabled (15 seconds)' : 'disabled'}`);
  });
  $('newScramble').addEventListener('click', newScramble);
  $('copyScramble').addEventListener('click', () => copyText(state.scramble, 'Scramble copied'));
  $('clearHistory').addEventListener('click', () => {
    if (!state.solves.length) return;
    if (confirm('Clear all solves from this device? This cannot be undone unless you exported a backup.')) { state.solves = []; persist(); renderAll(); }
  });
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'Cube Master', version: 2, exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'cube-master-session.json'; a.click(); URL.revokeObjectURL(url); toast('Session exported');
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text()), incoming = data.state || data;
      if (!incoming || !Array.isArray(incoming.solves)) throw new Error('This file does not contain a Cube Master session.');
      if (!confirm(`Import ${incoming.solves.length} solves? This replaces the current local session.`)) return;
      state.solves = incoming.solves.filter(s => Number.isFinite(s.time) && [0, 1, 2].includes(s.penalty)).map(s => ({ ...s, id: s.id || Date.now() + Math.random() }));
      state.favorites = Array.isArray(incoming.favorites) ? incoming.favorites.filter(id => ALGORITHMS.some(a => a.id === id)) : [];
      state.practice = incoming.practice && typeof incoming.practice === 'object' ? incoming.practice : {};
      state.ratings = incoming.ratings && typeof incoming.ratings === 'object' ? incoming.ratings : {};
      if (incoming.profile) { const ip = normProfile(incoming.profile); state.profile = { ...ip, name: ip.name || state.profile.name, welcomed: true }; } else state.profile = normProfile(state.profile);
      persist(); renderAll(); toast('Session imported');
    } catch (err) { alert('Could not import file: ' + err.message); }
    finally { e.target.value = ''; }
  });
  async function copyText(text, msg) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text); else {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); if (!ok) throw new Error('copy failed');
      } toast(msg || 'Copied');
    } catch (e) { toast('Copy unavailable in this browser'); }
  }

  const SVGC = {}; const PAIR = new Set(SOLVED.filter(i => { const p = ST[i].p; return p[0] == 1 && p[2] == 1 && p[1] <= 0 })); function makeCube(id) { const it = ALGORITHMS.find(a => a.id === id), w = document.createElement('div'); w.className = 'cube-svg'; w.setAttribute('aria-hidden', 'true'); w.innerHTML = SVGC[id] || (SVGC[id] = it.cat === 'F2L' ? svgIso(caseState(it.moves), PAIR) : svgTop(caseState(it.moves), it.cat === 'OLL', it.cat === 'PLL')); return w; }
  function favoriteButton(item) {
    const b = document.createElement('button'); b.className = 'btn small'; const fav = state.favorites.includes(item.id); b.textContent = fav ? '★ Saved' : '☆ Save'; b.setAttribute('aria-label', fav ? 'Remove favorite' : 'Add favorite');
    b.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(item.id); renderAlgorithms(); if (currentAlgorithm && currentAlgorithm.id === item.id) syncFavoriteButton(); }); return b;
  }
  function toggleFavorite(id) {
    state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [...state.favorites, id]; persist(); renderPracticeStats(); toast(state.favorites.includes(id) ? 'Added to favorites' : 'Removed from favorites');
  }
  function renderAlgorithms() {
    const host = $('algoGrid'), query = $('algoSearch').value.trim().toLowerCase(), cat = $('algoCategory').value, sort = $('algoSort').value;
    let list = ALGORITHMS.filter(a => (cat === 'all' || a.cat === cat) && (`${a.name} ${a.plain} ${a.moves} ${a.cat} ${a.description}`).toLowerCase().includes(query));
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'favorites') list.sort((a, b) => Number(state.favorites.includes(b.id)) - Number(state.favorites.includes(a.id)) || a.name.localeCompare(b.name));
    $('algoCount').textContent = `${list.length} CASE${list.length === 1 ? '' : 'S'}`; host.innerHTML = '';
    if (!list.length) { host.innerHTML = '<div class="empty">No matching algorithms. Try another search or category.</div>'; return; }
    list.forEach(item => {
      const card = document.createElement('article'); card.className = 'algo-card' + (state.ratings[item.id] === 'good' ? ' mastered' : ''); card.dataset.cat = item.cat; card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', `Open ${item.name}`);
      const head = document.createElement('div'); head.className = 'algo-card-head'; const h = document.createElement('h3'); h.textContent = item.name; const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = item.cat; head.append(h, tag);
      const cubeWrap = document.createElement('div'); cubeWrap.className = 'mini-cube'; cubeWrap.appendChild(makeCube(item.id, item.cat));
      const moves = document.createElement('div'); moves.className = 'algo-moves'; moves.textContent = item.moves;
      const foot = document.createElement('div'); foot.className = 'algo-card-foot'; const detail = document.createElement('span'); detail.className = 'muted'; detail.style.fontSize = '11px'; detail.textContent = 'View details →'; foot.append(detail, favoriteButton(item));
      card.append(head, cubeWrap, moves, foot); card.addEventListener('click', e => { if (e.target.closest('button')) return; openAlgorithm(item); }); card.addEventListener('keydown', e => { if (e.key === 'Enter') { openAlgorithm(item); } }); host.appendChild(card);
    });
  }
  function openAlgorithm(item) {
    currentAlgorithm = item; $('modalCategory').textContent = item.cat; $('modalTitle').textContent = item.name; $('modalMoves').textContent = item.moves; $('modalDescription').textContent = item.description;
    $('modalCube').replaceChildren(makeCube(item.id, item.cat)); syncFavoriteButton(); $('algoModal').classList.add('open'); $('closeModal').focus();
  }
  function syncFavoriteButton() { if (!currentAlgorithm) return; $('favoriteAlgo').textContent = state.favorites.includes(currentAlgorithm.id) ? '★ Remove favorite' : '☆ Add favorite'; }
  function closeModal() { $('algoModal').classList.remove('open'); }
  $('closeModal').addEventListener('click', closeModal);
  $('algoModal').addEventListener('click', e => { if (e.target === $('algoModal')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeProfile(); } });
  $('copyAlgo').addEventListener('click', () => currentAlgorithm && copyText(currentAlgorithm.moves, 'Algorithm copied'));
  $('favoriteAlgo').addEventListener('click', () => { if (currentAlgorithm) { toggleFavorite(currentAlgorithm.id); syncFavoriteButton(); renderAlgorithms(); } });
  $('practiceThis').addEventListener('click', () => { if (!currentAlgorithm) return; closeModal(); switchView('practice'); $('practiceCategory').value = currentAlgorithm.cat; buildPracticeQueue(currentAlgorithm.id); });

  function buildPracticeQueue(forceId = null) {
    const category = $('practiceCategory').value;
    let list = ALGORITHMS.filter(a => category === 'all' || a.cat === category || (category === 'favorites' && state.favorites.includes(a.id)) || (category === 'todo' && state.ratings[a.id] !== 'good'));
    if (!list.length) { practiceQueue = []; practiceIndex = 0; renderPractice(); toast('No cases in this practice filter yet.'); return; }
    // Bring "Again" cards forward, then shuffle to make recall practice less predictable.

    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[list[i], list[j]] = [list[j], list[i]]; }
    const pr = a => ({ again: 0, hard: 1, undefined: 2, good: 3 })[state.ratings[a.id]]; list.sort((a, b) => pr(a) - pr(b));
    practiceQueue = list.map(a => a.id).slice(0, +$('practiceSize').value || 9999); practiceIndex = 0; if (forceId && !practiceQueue.includes(forceId)) practiceQueue.unshift(forceId);
    if (forceId && practiceQueue.includes(forceId)) practiceIndex = practiceQueue.indexOf(forceId);
    answerVisible = false; renderPractice();
  }
  function currentPracticeItem() { return ALGORITHMS.find(a => a.id === practiceQueue[practiceIndex]); }
  function renderPractice() {
    const item = currentPracticeItem(); answerVisible = false; $('ratingControls').hidden = true; $('practiceAlgo').classList.add('hidden-answer'); $('revealAnswer').hidden = false;
    if (!item) { $('practiceTag').textContent = 'PRACTICE'; $('practiceName').textContent = 'No cases available'; $('practicePrompt').textContent = 'Choose another category or save some favorites.'; $('practiceAlgo').textContent = ''; $('practiceCube').replaceChildren(); $('sessionBar').style.width = '0'; $('practiceProgress').textContent = 'CARD 0 / 0'; return; }
    $('practiceTag').textContent = item.cat; $('practiceName').textContent = item.name; $('practiceCube').replaceChildren(makeCube(item.id)); $('sessionBar').style.width = (practiceIndex / practiceQueue.length * 100) + '%'; $('practicePrompt').textContent = 'Say the algorithm for this case, then reveal it.'; $('practiceAlgo').textContent = item.moves; $('practiceProgress').textContent = `CARD ${practiceIndex + 1} / ${practiceQueue.length}`;
  }
  function renderPracticeStats() {
    const vals = Object.entries(state.ratings).filter(([k]) => ALGORITHMS.some(a => a.id === k)).map(e => e[1]); $('reviewedCount').textContent = vals.length; $('goodCount').textContent = vals.filter(v => v === 'good').length;
    $('mastery').innerHTML = '<div class="legend"><span><b style="background:var(--green)"></b>Learned</span><span><b style="background:var(--yellow)"></b>Hard</span><span><b style="background:var(--red)"></b>Again</span></div>' + ['F2L', 'OLL', 'PLL'].map(c => { const all = ALGORITHMS.filter(a => a.cat === c), n = r => all.filter(a => state.ratings[a.id] === r).length, p = r => (n(r) / all.length * 100).toFixed(1); return `<div class="m-row"><div class="m-top"><b>${c}</b><span>${n('good')} / ${all.length} learned</span></div><div class="bar"><i class="g" style="width:${p('good')}%"></i><i class="h" style="width:${p('hard')}%"></i><i class="a" style="width:${p('again')}%"></i></div></div>`; }).join('');
  }
  $('revealAnswer').addEventListener('click', () => { if (!currentPracticeItem()) return; answerVisible = true; $('practiceAlgo').classList.remove('hidden-answer'); $('revealAnswer').hidden = true; $('ratingControls').hidden = false; });
  $('nextPractice').addEventListener('click', () => { if (!practiceQueue.length) buildPracticeQueue(); else { practiceIndex = (practiceIndex + 1) % practiceQueue.length; renderPractice(); } });
  $('ratingControls').addEventListener('click', e => {
    const b = e.target.closest('[data-rate]'); if (!b) return; const item = currentPracticeItem(); if (!item) return;
    state.ratings[item.id] = b.dataset.rate; state.practice[item.id] = { lastReviewed: Date.now(), rating: b.dataset.rate }; persist(); renderPracticeStats();
    if (b.dataset.rate === 'again' && practiceQueue.length > 1) { practiceQueue.splice(practiceIndex, 1); practiceQueue.splice(Math.min(practiceIndex + 2, practiceQueue.length), 0, item.id); practiceIndex = practiceIndex % practiceQueue.length; }
    else practiceIndex = (practiceIndex + 1) % practiceQueue.length;
    renderPractice(); toast(b.dataset.rate === 'good' ? 'Nice work — recall recorded' : b.dataset.rate === 'hard' ? 'Marked as hard' : 'We’ll revisit this one');
  });
  $('practiceCategory').addEventListener('change', () => buildPracticeQueue()); $('practiceSize').addEventListener('change', () => buildPracticeQueue());
  $('resetPractice').addEventListener('click', () => { if (confirm('Reset all practice ratings? Favorites will be kept.')) { state.ratings = {}; state.practice = {}; persist(); buildPracticeQueue(); renderPracticeStats(); toast('Practice progress reset'); } });
  function switchView(view) {
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    if (view === 'algorithms') renderAlgorithms();
    if (view === 'practice' && !practiceQueue.length) buildPracticeQueue();
    if (view === 'notation') N3.show();
  }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  ['algoSearch', 'algoCategory', 'algoSort'].forEach(id => $(id).addEventListener(id === 'algoSearch' ? 'input' : 'change', renderAlgorithms));

  $('qPlus2').onclick = () => { const x = state.solves[0]; if (x) { x.penalty = x.penalty === 1 ? 0 : 1; persist(); renderAll(); } }; $('qDnf').onclick = () => { const x = state.solves[0]; if (x) { x.penalty = x.penalty === 2 ? 0 : 2; persist(); renderAll(); } }; $('qDel').onclick = () => { if (state.solves.length) { state.solves.shift(); persist(); renderAll(); } };
  /* ===================== Local profile (no sign-in) ===================== */
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let lastTick = Date.now(), wasVisible = document.visibilityState === 'visible';
  function trackUsage() {
    const now = Date.now(), dt = now - lastTick; lastTick = now;
    if (wasVisible && dt > 0 && dt < 60000) state.profile.usageMs += dt;   // only count time the app was on screen
    wasVisible = document.visibilityState === 'visible';
    const k = dayKey(); if (!state.profile.days.includes(k)) state.profile.days.push(k);
  }
  function persistQuiet() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { } }
  const fmtUse = ms => ms < 3600000 ? `${Math.floor(ms / 60000)} min` : `${(ms / 3600000).toFixed(1)} h`;
  function renderProfileChip() {
    const n = state.profile.name;
    $('profileAvatar').textContent = n ? Array.from(n)[0].toUpperCase() : '?';
    $('profileLabel').textContent = n || 'Set name';
    $('profileBtn').setAttribute('aria-label', n ? `Profile: ${n}` : 'Set up your profile');
  }
  function fillProfileStats() {
    const p = state.profile;
    $('pfSolves').textContent = p.totalSolves; $('pfHours').textContent = fmtUse(p.usageMs); $('pfDays').textContent = p.days.length;
    $('pfSince').textContent = new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function openProfile() {
    trackUsage(); fillProfileStats();
    $('profileName').value = state.profile.name;
    $('profileLead').textContent = state.profile.name ? 'Saved on this device only. No account or sign-in needed.' : 'Welcome! Enter a name to personalise Cube Master. No account or sign-in needed.';
    $('profileModal').classList.add('open'); setTimeout(() => $('profileName').focus(), 60);
  }
  function closeProfile() { $('profileModal').classList.remove('open'); }
  function saveProfile() {
    const name = $('profileName').value.replace(/\s+/g, ' ').trim().slice(0, 24);
    state.profile.name = name; state.profile.welcomed = true; persist(); renderProfileChip(); closeProfile();
    toast(name ? `Hi ${name}! Profile saved` : 'Name cleared');
  }
  $('profileBtn').addEventListener('click', openProfile);
  $('closeProfile').addEventListener('click', closeProfile);
  $('profileModal').addEventListener('click', e => { if (e.target === $('profileModal')) closeProfile(); });
  $('profileSave').addEventListener('click', saveProfile);
  $('profileName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveProfile(); } });
  setInterval(() => { trackUsage(); persistQuiet(); if ($('profileModal').classList.contains('open')) fillProfileStats(); }, 15000);
  document.addEventListener('visibilitychange', () => { trackUsage(); persistQuiet(); });
  window.addEventListener('pagehide', () => { trackUsage(); persistQuiet(); });

  /* ===================== Install button (PWA) ===================== */
  let deferredInstall = null;
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (!isStandalone()) $('installBtn').hidden = false; });
  $('installBtn').addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (_) { }
    deferredInstall = null; $('installBtn').hidden = true;
  });
  window.addEventListener('appinstalled', () => { deferredInstall = null; $('installBtn').hidden = true; toast('Cube Master installed'); });

  /* ===================== 3D notation cube ===================== */
  const N3 = (() => {
    // CSS 3D space: x → right, y → DOWN, z → towards you. U = y -1, D = y +1, F = z +1, B = z -1, R = x +1, L = x -1.
    const S = 60, H = S / 2, ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const COLORS = { U: '#f8fafc', D: '#facc15', F: '#16a34a', B: '#2563eb', R: '#dc2626', L: '#f97316' };
    const FACE_T = { F: `translateZ(${H}px)`, B: `rotateY(180deg) translateZ(${H}px)`, R: `rotateY(90deg) translateZ(${H}px)`, L: `rotateY(-90deg) translateZ(${H}px)`, U: `rotateX(90deg) translateZ(${H}px)`, D: `rotateX(-90deg) translateZ(${H}px)` };
    // [axis, which cubies move, degrees for a clockwise (unprimed) turn]
    const MOVES = {
      R: ['x', p => p[0] === 1, 90], L: ['x', p => p[0] === -1, -90], U: ['y', p => p[1] === -1, -90], D: ['y', p => p[1] === 1, 90], F: ['z', p => p[2] === 1, 90], B: ['z', p => p[2] === -1, -90],
      M: ['x', p => p[0] === 0, -90], E: ['y', p => p[1] === 0, 90], S: ['z', p => p[2] === 0, 90],
      r: ['x', p => p[0] >= 0, 90], l: ['x', p => p[0] <= 0, -90], u: ['y', p => p[1] <= 0, -90], d: ['y', p => p[1] >= 0, 90], f: ['z', p => p[2] >= 0, 90], b: ['z', p => p[2] <= 0, -90],
      x: ['x', () => true, 90], y: ['y', () => true, -90], z: ['z', () => true, 90]
    };
    const NAME = { R: 'Right face', L: 'Left face', U: 'Up face', D: 'Down face', F: 'Front face', B: 'Back face', M: 'Middle slice', E: 'Equator slice', S: 'Standing slice', r: 'Right wide turn', l: 'Left wide turn', u: 'Up wide turn', d: 'Down wide turn', f: 'Front wide turn', b: 'Back wide turn', x: 'Rotation x', y: 'Rotation y', z: 'Rotation z' };
    const WHAT = { R: 'the right face', L: 'the left face', U: 'the top face', D: 'the bottom face', F: 'the front face', B: 'the back face', M: 'the middle layer between L and R', E: 'the middle layer between U and D', S: 'the middle layer between F and B', r: "the right two layers together (R + M')", l: 'the left two layers together (L + M)', u: "the top two layers together (U + E')", d: 'the bottom two layers together (D + E)', f: 'the front two layers together (F + S)', b: "the back two layers together (B + S')", x: 'the whole cube', y: 'the whole cube', z: 'the whole cube' };
    const FOLLOWS = { M: 'L', E: 'D', S: 'F', r: 'R', l: 'L', u: 'U', d: 'D', f: 'F', b: 'B', x: 'R', y: 'U', z: 'F' };
    const GROUPS = [['Face turns', 'RLUDFB'], ['Slice turns', 'MES'], ['Wide turns (two layers)', 'rludfb'], ['Whole-cube rotations', 'xyz']];
    const REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mul3 = (A, B) => { const C = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += A[i * 3 + k] * B[k * 3 + j]; C[i * 3 + j] = s; } return C; };
    const mulv = (A, v) => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];
    const rot = (axis, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return axis === 'x' ? [1, 0, 0, 0, c, -s, 0, s, c] : axis === 'y' ? [c, 0, s, 0, 1, 0, -s, 0, c] : [c, -s, 0, s, c, 0, 0, 0, 1]; };
    const q = v => +v.toFixed(5);
    const css = (R, t) => `matrix3d(${[R[0], R[3], R[6], 0, R[1], R[4], R[7], 0, R[2], R[5], R[8], 0, t[0], t[1], t[2], 1].map(q).join(',')})`;
    const invTok = t => t.length === 1 ? t + "'" : t[1] === "'" ? t[0] : t;

    let scene, stage, built = false, wired = false;
    const cubies = [];
    let queue = [], busy = false, gen = 0, played = [], mod = '', vx = -26, vy = -38, drag = null;

    function render(c, Q) {
      const R = Q ? mul3(Q, c.R) : c.R, t = (Q ? mulv(Q, c.p) : c.p).map(v => v * S);
      c.el.style.transform = css(R, t);
    }
    function build() {
      scene.innerHTML = ''; cubies.length = 0;
      for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
        const el = document.createElement('div'); el.className = 'cubie';
        const center = [x, y, z].filter(v => v === 0).length === 2;
        [['R', x === 1], ['L', x === -1], ['U', y === -1], ['D', y === 1], ['F', z === 1], ['B', z === -1]].forEach(([k, on]) => {
          const f = document.createElement('div'); f.className = 'cf' + (on ? '' : ' in'); f.style.transform = FACE_T[k];
          if (on) { f.style.setProperty('--c', COLORS[k]); f.style.setProperty('--lc', k === 'U' || k === 'D' ? '#15171c' : '#fff'); f.innerHTML = '<i class="st"></i>' + (center ? `<b>${k}</b>` : ''); }
          el.appendChild(f);
        });
        scene.appendChild(el);
        const c = { el, p: [x, y, z], p0: [x, y, z], R: ID.slice() }; cubies.push(c); render(c);
      }
      built = true;
    }
    function resetCube() {
      gen++; queue = []; busy = false; played = []; cubies.forEach(c => { c.p = c.p0.slice(); c.R = ID.slice(); render(c); }); renderLog();
    }
    function applyView() {
      const k = stage.clientWidth ? Math.max(.55, Math.min(1.3, Math.min(stage.clientWidth, stage.clientHeight) / 285)) : 1;
      scene.style.transform = `scale3d(${k},${k},${k}) rotateX(${vx}deg) rotateY(${vy}deg)`;
    }
    function describe(tok) {
      const base = tok[0], m = tok.slice(1), face = 'RLUDFB'.includes(base), verb = 'xyz'.includes(base) ? 'Rotate' : 'Turn';
      const amt = m === '2' ? '180°, a half turn (direction does not matter)'
        : m === "'" ? "90° the opposite way (the prime ' reverses the turn)"
          : face ? '90° clockwise as you look straight at that face' : `90° in the same direction as ${FOLLOWS[base]}`;
      return `${verb} ${WHAT[base]} ${amt}.`;
    }
    function setNow(tok) {
      $('n3Token').textContent = tok; $('n3Name').textContent = NAME[tok[0]] + (tok[1] === "'" ? ' · prime' : tok[1] === '2' ? ' · double' : ''); $('n3Desc').textContent = describe(tok);
    }
    function renderLog() {
      const el = $('n3Log'); el.textContent = played.length ? played.slice(-24).join(' ') : 'Moves you play appear here.'; el.classList.toggle('empty-log', !played.length);
    }
    function enqueue(tok, record = true) { queue.push({ tok, record }); if (!busy) next(); }
    function next() {
      const it = queue.shift(); if (!it) { busy = false; return; }
      busy = true; const myGen = gen, tok = it.tok, base = tok[0], m = tok.slice(1), [axis, pred, deg] = MOVES[base];
      const total = m === '2' ? deg * 2 : m === "'" ? -deg : deg, group = cubies.filter(c => pred(c.p));
      let dur = REDUCE ? 1 : (m === '2' ? 420 : 280); if (queue.length > 5) dur *= .55;
      setNow(tok); if (it.record) { played.push(tok); renderLog(); }
      const t0 = performance.now();
      const frame = now => {
        if (myGen !== gen) return;
        const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const Q = rot(axis, total * e); group.forEach(c => render(c, Q));
        if (k < 1) requestAnimationFrame(frame);
        else {
          const Qf = rot(axis, total);
          group.forEach(c => { c.R = mul3(Qf, c.R).map(v => Math.round(v) + 0); c.p = mulv(Qf, c.p).map(v => Math.round(v) + 0); render(c); });
          next();
        }
      };
      requestAnimationFrame(frame);
    }
    function parseSeq(str) {
      const out = [];
      for (const raw of str.replace(/[()]/g, ' ').replace(/[’`]/g, "'").split(/\s+/).filter(Boolean)) {
        const t = raw.replace(/^([RLUDFB])w/, (a, l) => l.toLowerCase()), mm = t.match(/^([RLUDFBMESrludfbxyz])(2'|'2|2|')?$/);
        if (!mm) return { bad: raw };
        out.push(mm[1] + (mm[2] ? (mm[2] === "'" ? "'" : '2') : ''));
      }
      return { moves: out };
    }
    function playSeq(str, fromSolved) {
      const r = parseSeq(str); if (r.bad) { toast(`"${r.bad}" is not a valid move`); return; }
      if (!r.moves.length) { toast('Type some moves first'); return; }
      if (fromSolved) resetCube(); r.moves.forEach(t => enqueue(t));
    }
    function buildPad() {
      const host = $('n3Pad'); host.innerHTML = '';
      GROUPS.forEach(([title, letters]) => {
        const g = document.createElement('div'); g.className = 'pad-group';
        const h = document.createElement('span'); h.className = 'eyebrow'; h.textContent = title;
        const pad = document.createElement('div'); pad.className = 'pad' + (letters.length === 3 ? ' pad3' : '');
        [...letters].forEach(l => { const b = document.createElement('button'); b.className = 'btn'; b.dataset.move = l; b.textContent = l + mod; b.setAttribute('aria-label', `${NAME[l]}${mod === "'" ? ' prime' : mod === '2' ? ' double' : ''}`); pad.appendChild(b); });
        g.append(h, pad); host.appendChild(g);
      });
    }
    function setStyle(style) {
      state.cubeStyle = style === 'stickerless' ? 'stickerless' : 'stickered';
      scene.classList.toggle('stickerless', state.cubeStyle === 'stickerless');
      document.querySelectorAll('[data-cubestyle]').forEach(b => { const on = b.dataset.cubestyle === state.cubeStyle; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      $('n3Tag').textContent = state.cubeStyle.toUpperCase();
    }
    function setLabels(on) { state.cubeLabels = !!on; scene.classList.toggle('labels', !!on); $('n3Labels').checked = !!on; }
    function wire() {
      wired = true;
      $('n3Pad').addEventListener('click', e => { const b = e.target.closest('[data-move]'); if (b) enqueue(b.dataset.move + mod); });
      document.querySelectorAll('[data-mod]').forEach(b => b.addEventListener('click', () => {
        mod = b.dataset.mod; document.querySelectorAll('[data-mod]').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); }); buildPad();
      }));
      document.querySelectorAll('[data-cubestyle]').forEach(b => b.addEventListener('click', () => { setStyle(b.dataset.cubestyle); persist(); }));
      $('n3Labels').addEventListener('change', e => { setLabels(e.target.checked); persist(); });
      $('n3Undo').addEventListener('click', () => { const last = played.pop(); if (!last) { toast('Nothing to undo'); return; } renderLog(); enqueue(invTok(last), false); });
      $('n3Reset').addEventListener('click', () => { resetCube(); setNow('R'); toast('Cube reset'); });
      $('n3View').addEventListener('click', () => { vx = -26; vy = -38; applyView(); });
      $('n3Play').addEventListener('click', () => playSeq($('n3Seq').value, false));
      $('n3Seq').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); playSeq($('n3Seq').value, false); } });
      document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => { $('n3Seq').value = b.dataset.demo; playSeq(b.dataset.demo, true); }));
      stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; try { stage.setPointerCapture(e.pointerId); } catch (_) { } stage.classList.add('dragging'); });
      stage.addEventListener('pointermove', e => {
        if (!drag) return; vy += (e.clientX - drag.x) * .6; vx = Math.max(-89, Math.min(89, vx - (e.clientY - drag.y) * .6)); drag = { x: e.clientX, y: e.clientY }; applyView();
      });
      ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { drag = null; stage.classList.remove('dragging'); }));
      stage.addEventListener('keydown', e => {
        const d = { ArrowLeft: [0, -12], ArrowRight: [0, 12], ArrowUp: [12, 0], ArrowDown: [-12, 0] }[e.key]; if (!d) return;
        e.preventDefault(); vx = Math.max(-89, Math.min(89, vx + d[0])); vy += d[1]; applyView();
      });
      window.addEventListener('resize', () => { if (built) applyView(); });
    }
    function show() {
      scene = $('n3Scene'); stage = $('n3Stage');
      if (!built) { build(); buildPad(); renderLog(); setNow('R'); }
      if (!wired) wire();
      setStyle(state.cubeStyle); setLabels(state.cubeLabels !== false); applyView();
    }
    return { show };
  })();

  safeLoad(); trackUsage();
  if (!state.scramble) state.scramble = generateScramble();
  $('scrambleText').textContent = state.scramble; drawNet();
  renderAll(); renderAlgorithms(); buildPracticeQueue();
  if (!state.profile.name && !state.profile.welcomed) setTimeout(() => { if (!document.querySelector('.modal-backdrop.open') && phase === 'idle') { state.profile.welcomed = true; persist(); openProfile(); } }, 900);
})();

if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); }); }