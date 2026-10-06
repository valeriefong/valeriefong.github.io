/* Live figures for valeriefong.github.io. Each module starts only if its elements are on the page. */
(() => {
'use strict';

// ---------- shared helpers ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gauss = r => { let u=0; while(u===0) u=r(); const v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const FONT = '13px "STIX Two Text", Georgia, serif';
const FONT_I = 'italic 13px "STIX Two Text", Georgia, serif';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

function fit(c){
  const d = window.devicePixelRatio||1, b = c.getBoundingClientRect();
  c.width = Math.max(1,Math.round(b.width*d)); c.height = Math.max(1,Math.round(b.height*d));
  const ctx = c.getContext('2d'); ctx.setTransform(d,0,0,d,0,0); return [ctx,b.width,b.height];
}
function hex(h){ h=h.replace('#',''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); }
function mix(a,b,t){ const A=hex(a),B=hex(b); return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`; }
function withAlpha(h,a){ const [r,g,b]=hex(h); return `rgba(${r},${g},${b},${a})`; }

// Redraw hooks for theme changes and resizes
const redraws = [];
function onRedraw(fn){ redraws.push(fn); }
let rz = 0;
addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => redraws.forEach(f=>f())); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => redraws.forEach(f=>f()));
new MutationObserver(() => redraws.forEach(f=>f())).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
if (document.fonts) document.fonts.ready.then(() => redraws.forEach(f=>f()));

// Animation loop that only runs while its element is visible and the tab is shown
function loop(el, frame){
  let running=false, visible=false, raf=0;
  const tick = (ts) => { frame(ts); raf = requestAnimationFrame(tick); };
  const start = () => { if (!running && visible && !reduce && !document.hidden){ running=true; raf=requestAnimationFrame(tick); } };
  const stop = () => { running=false; cancelAnimationFrame(raf); };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(el);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  return {start, stop};
}

// ======================================================================
// 1. A single near-critical mode: e^{(alpha + i beta) t}
// ======================================================================
(function mode(){
  const c = $('mode-canvas'); if (!c) return;
  const slider = $('mode-alpha'), out = $('mode-aout'), readout = $('mode-readout');
  const BETA = 1.6, T = 32;
  let alpha = parseFloat(slider.value), t = 0, last = 0;

  function draw(){
    const [ctx,w,h] = fit(c);
    const ink=css('--ink'), muted=css('--muted'), rule=css('--rule'), ord=css('--ordered'), cha=css('--chaotic');
    ctx.clearRect(0,0,w,h);
    const col = alpha > 0.005 ? cha : ord;
    const amp = Math.max(1, Math.exp(alpha*T));
    // left: complex plane
    const S = Math.min(h, w*0.42), pad = 14, R = S/2 - pad, cx = pad + R, cy = h/2;
    ctx.strokeStyle = rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke();
    ctx.setLineDash([2,4]); ctx.strokeStyle = muted; ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(cx,cy,R/amp,0,2*Math.PI); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    const P = s => { const r = Math.exp(alpha*s)/amp*R; return [cx + r*Math.cos(BETA*s), cy - r*Math.sin(BETA*s)]; };
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
    const n = Math.max(2, Math.floor(t/0.04));
    for (let k=0;k<=n;k++){ const [x,y] = P(k*t/n); k ? ctx.lineTo(x,y) : ctx.moveTo(x,y); }
    ctx.stroke();
    const [dx,dy] = P(t); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx,dy,3.5,0,2*Math.PI); ctx.fill();
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Complex plane', 8, 17);
    // right: real part over time
    const x0 = cx + R + 22, x1 = w - 10, mid = h/2, A = h/2 - 22;
    ctx.strokeStyle = rule; ctx.beginPath(); ctx.moveTo(x0,mid); ctx.lineTo(x1,mid); ctx.stroke();
    ctx.setLineDash([2,4]); ctx.strokeStyle = muted; ctx.globalAlpha=.5; ctx.beginPath();
    for (let k=0;k<=100;k++){ const s=k*T/100, x=x0+(x1-x0)*s/T, y=mid-Math.exp(alpha*s)/amp*A; k?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke();
    ctx.beginPath();
    for (let k=0;k<=100;k++){ const s=k*T/100, x=x0+(x1-x0)*s/T, y=mid+Math.exp(alpha*s)/amp*A; k?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
    const m = Math.max(2, Math.floor(t/0.05));
    for (let k=0;k<=m;k++){ const s=k*t/m, x=x0+(x1-x0)*s/T, y=mid-Math.exp(alpha*s)*Math.cos(BETA*s)/amp*A; k?ctx.lineTo(x,y):ctx.moveTo(x,y); }
    ctx.stroke();
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Activity over time', x0, 17);
  }
  function describe(){
    out.textContent = alpha.toFixed(2).replace('-','−');
    if (alpha < -0.005){
      readout.innerHTML = `<span class="state-ordered">Decaying.</span> The oscillation shrinks by a factor of <i class="m">e</i> every 1/|α| = ${(1/-alpha).toFixed(1)} time units.`;
    } else if (alpha <= 0.005){
      readout.innerHTML = `<span class="state-ordered">On the edge.</span> With α = 0 the oscillation neither grows nor decays.`;
    } else {
      readout.innerHTML = `<span class="state-chaotic">Growing.</span> Past the edge, the oscillation grows by a factor of <i class="m">e</i> every ${(1/alpha).toFixed(1)} time units.`;
    }
  }
  slider.addEventListener('input', () => { alpha = parseFloat(slider.value); describe(); if (reduce) t = T; draw(); });
  const anim = loop(c, ts => { const dt = last ? Math.min(0.05,(ts-last)/1000) : 0; last = ts; t += dt*5; if (t > T + 3) t = 0; draw(); });
  describe(); t = reduce ? T : T*0.7; draw(); onRedraw(draw);
})();

// ======================================================================
// 2. Quasiperiodicity: two frequencies winding on a torus
// ======================================================================
(function torus(){
  const c = $('torus-canvas'); if (!c) return;
  const bRat = $('torus-rational'), bIrr = $('torus-golden'), readout = $('torus-readout');
  const PHI = (Math.sqrt(5)-1)/2;   // 0.618..., irrational
  let rho = PHI, t = 0, spin = 0.6, last = 0;
  const TMAX = 140, Rm = 1, rt = 0.42, TILT = 1.05;

  function proj(a, b, w, h){
    const x0 = (Rm + rt*Math.cos(b))*Math.cos(a), y0 = (Rm + rt*Math.cos(b))*Math.sin(a), z0 = rt*Math.sin(b);
    const x1 = x0*Math.cos(spin) - y0*Math.sin(spin), y1 = x0*Math.sin(spin) + y0*Math.cos(spin);
    const y2 = y1*Math.cos(TILT) - z0*Math.sin(TILT), z2 = y1*Math.sin(TILT) + z0*Math.cos(TILT);
    const s = Math.min(w/3.0, h/2.1);
    return [w/2 + x1*s, h/2 + y2*s, z2];
  }
  function draw(){
    const [ctx,w,h] = fit(c);
    const muted=css('--muted'), rule=css('--rule'), ord=css('--ordered');
    ctx.clearRect(0,0,w,h);
    ctx.lineWidth = 1; ctx.strokeStyle = rule;
    for (let i=0;i<16;i++){ const a=i*2*Math.PI/16; ctx.beginPath(); for (let k=0;k<=40;k++){ const [x,y]=proj(a,k*2*Math.PI/40,w,h); k?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); }
    for (let j=0;j<6;j++){ const b=j*2*Math.PI/6; ctx.beginPath(); for (let k=0;k<=80;k++){ const [x,y]=proj(k*2*Math.PI/80,b,w,h); k?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.stroke(); }
    // trail: angle a = t (around the ring), b = t/rho... use frequencies 1 and rho
    const n = Math.max(2, Math.floor(t/0.03));
    const pts = new Array(n+1);
    for (let k=0;k<=n;k++){ const s = k*t/n; pts[k] = proj(s, s/rho, w, h); }
    ctx.lineWidth = 1.3; ctx.lineJoin = 'round';
    for (const [lo,hi,al] of [[-9,-0.15,0.28],[-0.15,0.15,0.6],[0.15,9,1]]){
      ctx.strokeStyle = withAlpha(ord, al); ctx.beginPath(); let pen=false;
      for (let k=1;k<=n;k++){ const z=(pts[k][2]+pts[k-1][2])/2; if (z>=lo && z<hi){ if(!pen){ctx.moveTo(pts[k-1][0],pts[k-1][1]); pen=true;} ctx.lineTo(pts[k][0],pts[k][1]); } else pen=false; }
      ctx.stroke();
    }
    const p = pts[n]; ctx.fillStyle = ord; ctx.beginPath(); ctx.arc(p[0],p[1],3.5,0,2*Math.PI); ctx.fill();
    ctx.fillStyle = muted; ctx.font = FONT;
    ctx.fillText(rho === PHI ? 'Frequency ratio: golden ratio' : 'Frequency ratio: 3 : 2', 8, 17);
  }
  function setMode(r){
    rho = r; t = 30;
    bRat.setAttribute('aria-pressed', r !== PHI); bIrr.setAttribute('aria-pressed', r === PHI);
    readout.innerHTML = r === PHI
      ? 'The ratio of the two frequencies is irrational, so the path <span class="state-ordered">never closes</span>. Given time it passes arbitrarily close to every point on the torus. This is quasiperiodic motion.'
      : 'The ratio is 3 : 2, a rational number, so the path <span class="state-ordered">closes on itself</span> after a few trips around and then repeats exactly. This is periodic motion.';
    if (reduce) t = TMAX; draw();
  }
  bRat.addEventListener('click', () => setMode(2/3));
  bIrr.addEventListener('click', () => setMode(PHI));
  loop(c, ts => { const dt = last ? Math.min(0.05,(ts-last)/1000) : 0; last = ts; t += dt*4.5; spin += dt*0.12; if (t > TMAX) t = 0; draw(); });
  setMode(PHI); onRedraw(draw);
})();

// ======================================================================
// 3. Transition to chaos in a random rate network: dx/dt = -x + g W tanh(x)
// ======================================================================
(function gainDemo(){
  const specC = $('spec'), trC = $('trace'); if (!specC) return;
  // Eigenvalues of W (g = 1), computed offline with numpy for the exact matrix generated below.
  const EIG = [[0.2244,0.9649],[0.2244,-0.9649],[-0.3744,0.9055],[-0.3744,-0.9055],[-0.9591,0.1762],[-0.9591,-0.1762],[-0.8178,0.4939],[-0.8178,-0.4939],[-0.15,0.9548],[-0.15,-0.9548],[-0.7264,0.5877],[-0.7264,-0.5877],[0.6711,0.7148],[0.6711,-0.7148],[0.9487,0.0],[0.7542,0.6191],[0.7542,-0.6191],[0.7342,0.6143],[0.7342,-0.6143],[-0.4868,0.7883],[-0.4868,-0.7883],[0.8161,0.4078],[0.8161,-0.4078],[0.9018,0.0583],[0.9018,-0.0583],[-0.9189,0.1436],[-0.9189,-0.1436],[0.8734,0.1975],[0.8734,-0.1975],[0.2924,0.8443],[0.2924,-0.8443],[0.0806,0.888],[0.0806,-0.888],[0.7305,0.472],[0.7305,-0.472],[0.6901,0.5391],[0.6901,-0.5391],[0.3882,0.7711],[0.3882,-0.7711],[0.06,0.8613],[0.06,-0.8613],[-0.7185,0.4818],[-0.7185,-0.4818],[-0.2923,0.7706],[-0.2923,-0.7706],[0.3099,0.7531],[0.3099,-0.7531],[0.8144,0.0],[0.4856,0.6578],[0.4856,-0.6578],[-0.6111,0.5423],[-0.6111,-0.5423],[-0.8182,0.0825],[-0.8182,-0.0825],[-0.3876,0.7097],[-0.3876,-0.7097],[-0.7744,0.1829],[-0.7744,-0.1829],[0.7202,0.3193],[0.7202,-0.3193],[0.1939,0.7623],[0.1939,-0.7623],[-0.494,0.6332],[-0.494,-0.6332],[0.0064,0.7716],[0.0064,-0.7716],[0.498,0.5736],[0.498,-0.5736],[-0.0773,0.7279],[-0.0773,-0.7279],[-0.6468,0.372],[-0.6468,-0.372],[-0.6347,0.3274],[-0.6347,-0.3274],[0.6952,0.0247],[0.6952,-0.0247],[-0.7106,0.0295],[-0.7106,-0.0295],[0.412,0.5341],[0.412,-0.5341],[-0.4085,0.5477],[-0.4085,-0.5477],[-0.6651,0.0914],[-0.6651,-0.0914],[0.1796,0.6449],[0.1796,-0.6449],[-0.3532,0.5553],[-0.3532,-0.5553],[-0.4495,0.4818],[-0.4495,-0.4818],[0.6367,0.1334],[0.6367,-0.1334],[0.5562,0.2859],[0.5562,-0.2859],[0.1887,0.5913],[0.1887,-0.5913],[-0.6276,0.0],[-0.4817,0.3866],[-0.4817,-0.3866],[0.453,0.3673],[0.453,-0.3673],[-0.0326,0.5786],[-0.0326,-0.5786],[-0.582,0.0],[0.5905,0.0],[-0.1402,0.5401],[-0.1402,-0.5401],[0.5724,0.0],[0.2794,0.4656],[0.2794,-0.4656],[0.1968,0.5008],[0.1968,-0.5008],[-0.2775,0.4802],[-0.2775,-0.4802],[-0.5176,0.2025],[-0.5176,-0.2025],[0.5153,0.153],[0.5153,-0.153],[0.3211,0.4026],[0.3211,-0.4026],[0.4278,0.2692],[0.4278,-0.2692],[-0.0116,0.4929],[-0.0116,-0.4929],[-0.4604,0.2322],[-0.4604,-0.2322],[-0.2067,0.4558],[-0.2067,-0.4558],[-0.4551,0.0],[0.4269,0.0762],[0.4269,-0.0762],[0.4016,0.0177],[0.4016,-0.0177],[0.1885,0.3002],[0.1885,-0.3002],[0.0162,0.3639],[0.0162,-0.3639],[-0.2336,0.3035],[-0.2336,-0.3035],[0.2661,0.1941],[0.2661,-0.1941],[-0.3179,0.0715],[-0.3179,-0.0715],[-0.1243,0.3176],[-0.1243,-0.3176],[0.1109,0.2614],[0.1109,-0.2614],[-0.2486,0.2184],[-0.2486,-0.2184],[0.2383,0.0],[-0.203,0.2062],[-0.203,-0.2062],[0.0232,0.2195],[0.0232,-0.2195],[-0.0642,0.0831],[-0.0642,-0.0831],[-0.0753,0.0],[-0.0229,0.0],[0.1169,0.0],[0.057,0.0]];
  const N = 160, SEED = 20271206, DT = 0.05, SUB = 4, WINDOW = 300, SHOW = 6;
  const rng = mulberry32(SEED);
  const W = new Float64Array(N*N); const s = 1/Math.sqrt(N);
  for (let i=0;i<N*N;i++) W[i] = gauss(rng)*s;
  const maxRe = Math.max(...EIG.map(e=>e[0])), gCrit = 1/maxRe;
  const kickRng = mulberry32(7);
  const x = new Float64Array(N), r = new Float64Array(N), dx = new Float64Array(N);
  const hist = Array.from({length:SHOW}, () => new Float32Array(WINDOW));
  let head = 0, g = 1.0, quietFor = 0;

  function kick(){ for (let i=0;i<N;i++) x[i] = 1.2*gauss(kickRng); quietFor = 0; }
  function step(){
    for (let i=0;i<N;i++) r[i] = Math.tanh(x[i]);
    for (let i=0;i<N;i++){ let acc=0; const o=i*N; for (let j=0;j<N;j++) acc += W[o+j]*r[j]; dx[i] = -x[i] + g*acc; }
    for (let i=0;i<N;i++) x[i] += DT*dx[i];
  }
  function advance(){
    for (let k=0;k<SUB;k++) step();
    let m = 0;
    for (let n=0;n<SHOW;n++){ const v = Math.tanh(x[n*17]); hist[n][head] = v; m = Math.max(m, Math.abs(v)); }
    head = (head+1) % WINDOW; return m;
  }
  function drawSpec(){
    const [ctx,w,h] = fit(specC);
    const muted=css('--muted'), rule=css('--rule'), ord=css('--ordered'), cha=css('--chaotic');
    ctx.clearRect(0,0,w,h);
    const R = 1.75, pad = 14, sc = (Math.min(w,h)/2 - pad)/R, cx = w/2, cy = h/2;
    const X = v => cx + v*sc, Y = v => cy - v*sc;
    ctx.strokeStyle = rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(-R),cy); ctx.lineTo(X(R),cy); ctx.moveTo(cx,Y(R)); ctx.lineTo(cx,Y(-R)); ctx.stroke();
    ctx.setLineDash([2,4]); ctx.strokeStyle = muted; ctx.globalAlpha=.55;
    ctx.beginPath(); ctx.arc(cx,cy,g*sc,0,2*Math.PI); ctx.stroke(); ctx.globalAlpha=1; ctx.setLineDash([]);
    ctx.strokeStyle = cha; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(X(1),Y(R)); ctx.lineTo(X(1),Y(-R)); ctx.stroke();
    ctx.fillStyle = cha; ctx.font = FONT_I; ctx.fillText('Re = 1', X(1)+5, Y(R)+14);
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Eigenvalues of ', 8, 17);
    const off = 8 + ctx.measureText('Eigenvalues of ').width; ctx.font = FONT_I; ctx.fillText('gW', off, 17);
    for (const [re,im] of EIG){ const a=g*re, b=g*im; ctx.fillStyle = a>1?cha:ord; ctx.beginPath(); ctx.arc(X(a),Y(b),2.3,0,2*Math.PI); ctx.fill(); }
  }
  function drawTrace(){
    const [ctx,w,h] = fit(trC);
    const rule=css('--rule'), ord=css('--ordered'), cha=css('--chaotic'), muted=css('--muted');
    ctx.clearRect(0,0,w,h);
    const top = 28, bot = h-12, mid = (top+bot)/2, amp = (bot-top)/2;
    ctx.strokeStyle = rule; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(10,mid); ctx.lineTo(w-10,mid); ctx.stroke();
    const t = Math.max(0, Math.min(1, (g - 0.8)/(gCrit + 0.25 - 0.8)));
    ctx.strokeStyle = mix(ord, cha, t); ctx.lineWidth = 1.4; ctx.lineJoin='round';
    for (let n=0;n<SHOW;n++){
      ctx.globalAlpha = 0.35 + 0.65*(n+1)/SHOW; ctx.beginPath();
      for (let k=0;k<WINDOW;k++){ const v = hist[n][(head+k)%WINDOW]; const px = 10+(w-20)*k/(WINDOW-1), py = mid - v*amp; k?ctx.lineTo(px,py):ctx.moveTo(px,py); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Activity of six units', 10, 17);
  }
  const gain = $('gain'), gout = $('gout'), readout = $('readout');
  function describe(){
    const lead = g*maxRe; gout.textContent = g.toFixed(2);
    if (lead < 1){
      const tau = 1/(1-lead);
      readout.innerHTML = `<span class="state-ordered">Stable.</span> The rightmost eigenvalue sits at ${lead.toFixed(3)}, so activity near rest decays with timescale 1/(1 − ${lead.toFixed(3)}) ≈ ${tau < 100 ? tau.toFixed(1) : Math.round(tau)} time constants.${tau > 8 ? ' Close to the boundary, it decays slowly.' : ''}`;
    } else {
      readout.innerHTML = `<span class="state-chaotic">Self-sustaining.</span> An eigenvalue has crossed Re = 1, so rest is unstable and the network keeps itself active. For this network that happens at <i class="m">g</i> ≈ ${gCrit.toFixed(3)}; as <i class="m">N</i> grows it approaches 1.`;
    }
  }
  function settleStatic(){ kick(); for (let k=0;k<WINDOW;k++) advance(); drawTrace(); }
  gain.addEventListener('input', () => { g = parseFloat(gain.value); describe(); drawSpec(); if (reduce) settleStatic(); });
  gain.addEventListener('change', () => { if (!reduce) kick(); });
  $('kick').addEventListener('click', () => { if (reduce) settleStatic(); else kick(); });
  loop($('edge'), () => { const m = advance(); if (m < 0.01){ if (++quietFor > 90) kick(); } else quietFor = 0; drawTrace(); });
  describe(); kick();
  if (reduce) settleStatic(); else for (let k=0;k<40;k++) advance();
  drawSpec(); drawTrace(); onRedraw(() => { drawSpec(); drawTrace(); });
})();

// ======================================================================
// 4. Sequence generation: directional recurrence and ReLU readouts
//    x(t) = sum_k a_k e^{alpha_k t} [cos(w_k t) u_k + sin(w_k t) v_k], u_k, v_k orthonormal
// ======================================================================
(function sequence(){
  const trajC = $('seq-traj'), plotC = $('seq-plot'); if (!trajC) return;
  const slider = $('seq-k'), kout = $('seq-kout'), readout = $('seq-readout');
  const T = 400, DTS = 0.2, NS = Math.round(T/DTS)+1, THETA = 0.9;
  const TARGETS = [60, 140, 235, 330];
  let K = parseInt(slider.value,10), seed = 11, play = 240, last = 0;
  let a, al, om, P1, P2, P3, cos0, ys, firstRet, fires;

  function build(){
    const r = mulberry32(seed*1000 + K);
    a = []; al = []; om = []; P1 = []; P2 = []; P3 = [];
    for (let k=0;k<K;k++){
      a.push(0.6 + 0.4*r()); al.push(-(0.001 + 0.003*r())); om.push(0.1 + 0.5*r());
      // projections of u_k and v_k onto three fixed random readout directions
      P1.push([gauss(r),gauss(r)]); P2.push([gauss(r),gauss(r)]); P3.push([gauss(r),gauss(r)]);
    }
    const norm2 = t => { let s=0; for (let k=0;k<K;k++) s += a[k]*a[k]*Math.exp(2*al[k]*t); return s; };
    const dot = (t,s) => { let v=0; for (let k=0;k<K;k++) v += a[k]*a[k]*Math.exp(al[k]*(t+s))*Math.cos(om[k]*(t-s)); return v; };
    cos0 = new Float32Array(NS); ys = TARGETS.map(()=>new Float32Array(NS));
    const n0 = norm2(0), nT = TARGETS.map(norm2);
    for (let i=0;i<NS;i++){
      const t = i*DTS, nt = norm2(t);
      cos0[i] = dot(t,0)/Math.sqrt(nt*n0);
      TARGETS.forEach((tj,j) => { const c = dot(t,tj)/Math.sqrt(nt*nT[j]); ys[j][i] = Math.max(0,(c-THETA)/(1-THETA)); });
    }
    // first return: after the trajectory has left the cone, first time cos >= THETA again
    firstRet = null; let left = false;
    for (let i=1;i<NS;i++){ if (!left && cos0[i] < THETA) left = true; else if (left && cos0[i] >= THETA){ firstRet = i*DTS; break; } }
    // count separate firing episodes per readout
    fires = ys.map(y => { let n=0, on=false; for (let i=0;i<NS;i++){ if (y[i]>0.02 && !on){ n++; on=true; } else if (y[i]<=0.02) on=false; } return n; });
  }
  function traj(t){
    let p=0,q=0,s=0;
    for (let k=0;k<K;k++){ const e=a[k]*Math.exp(al[k]*t), c=Math.cos(om[k]*t)*e, si=Math.sin(om[k]*t)*e;
      p += c*P1[k][0]+si*P1[k][1]; q += c*P2[k][0]+si*P2[k][1]; s += c*P3[k][0]+si*P3[k][1]; }
    return [p,q,s];
  }
  const colors = () => [css('--ordered'), css('--chaotic'), css('--c3'), css('--c4')];

  function drawTraj(){
    const [ctx,w,h] = fit(trajC);
    const muted=css('--muted'), ord=css('--ordered'), cha=css('--chaotic');
    ctx.clearRect(0,0,w,h);
    const pts = []; let mx = 1e-9;
    for (let i=0;i<NS;i+=2){ const [p,q,s] = traj(i*DTS); const X = p*0.82 + s*0.35, Y = q*0.82 - s*0.3; pts.push([X,Y]); mx = Math.max(mx, Math.abs(X), Math.abs(Y)); }
    const sc = (Math.min(w,h)/2 - 16)/mx, cx = w/2, cy = h/2 + 6;
    const upto = reduce ? pts.length : Math.max(2, Math.floor(play/T*pts.length));
    ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
    for (let i=1;i<upto;i++){
      ctx.strokeStyle = mix(ord, cha, i/pts.length); ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(cx+pts[i-1][0]*sc, cy-pts[i-1][1]*sc); ctx.lineTo(cx+pts[i][0]*sc, cy-pts[i][1]*sc); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const e = pts[Math.min(upto, pts.length)-1]; ctx.fillStyle = css('--ink'); ctx.beginPath(); ctx.arc(cx+e[0]*sc, cy-e[1]*sc, 3.5, 0, 2*Math.PI); ctx.fill();
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Activity, projected to 2D', 8, 17);
  }
  function drawPlot(){
    const [ctx,w,h] = fit(plotC);
    const muted=css('--muted'), rule=css('--rule'), ink=css('--ink'), cha=css('--chaotic'), cols = colors();
    ctx.clearRect(0,0,w,h);
    const L = 12, Rr = w-10, X = t => L + (Rr-L)*t/T;
    // top: cosine similarity with the starting state
    const t0 = 28, t1 = h*0.55, yC = v => t1 - (v+1)/2*(t1-t0);
    ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L,yC(0)); ctx.lineTo(Rr,yC(0)); ctx.stroke();
    ctx.setLineDash([3,4]); ctx.strokeStyle = muted; ctx.beginPath(); ctx.moveTo(L,yC(THETA)); ctx.lineTo(Rr,yC(THETA)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i=0;i<NS;i++){ const x=X(i*DTS), y=yC(cos0[i]); i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke();
    if (firstRet !== null){ ctx.strokeStyle = cha; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X(firstRet), t0+4); ctx.lineTo(X(firstRet), t1); ctx.stroke(); }
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Similarity to the starting direction', L, 17);
    ctx.fillText('0.9', Rr-20, yC(THETA)-4);
    // bottom: readouts
    const b0 = h*0.62 + 14, b1 = h - 10, lane = (b1-b0)/TARGETS.length;
    ctx.fillStyle = muted; ctx.fillText('Readout neurons', L, h*0.62 + 4);
    TARGETS.forEach((tj,j) => {
      const base = b0 + lane*(j+1) - 3, A = lane - 6;
      ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L,base); ctx.lineTo(Rr,base); ctx.stroke();
      ctx.strokeStyle = cols[j]; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i=0;i<NS;i++){ const x=X(i*DTS), y=base - ys[j][i]*A; i?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke();
      ctx.fillStyle = cols[j]; ctx.beginPath(); ctx.moveTo(X(tj),base+2); ctx.lineTo(X(tj)-3.5,base+7); ctx.lineTo(X(tj)+3.5,base+7); ctx.fill();
    });
    if (!reduce){ ctx.strokeStyle = withAlpha(ink, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(play), t0); ctx.lineTo(X(play), h-6); ctx.stroke(); }
  }
  function describe(){
    kout.textContent = K;
    const extra = fires.reduce((s,n)=>s+n,0) - TARGETS.length;
    const ret = firstRet === null
      ? `<span class="state-ordered">No return</span> to within 0.9 of the starting direction in ${T} time units.`
      : `<span class="state-chaotic">First return</span> to within 0.9 of the starting direction at <i class="m">t</i> ≈ ${firstRet.toFixed(0)}.`;
    const rd = extra <= 0 ? 'Each readout fires once, at its own moment.' : `The readouts fire ${extra} extra time${extra===1?'':'s'}, so their timing is ambiguous.`;
    readout.innerHTML = `${ret} ${rd}`;
  }
  function rebuild(){ build(); describe(); drawTraj(); drawPlot(); }
  slider.addEventListener('input', () => { K = parseInt(slider.value,10); play = Math.max(play, 120); rebuild(); });
  $('seq-new').addEventListener('click', () => { seed++; play = Math.max(play, 120); rebuild(); });
  loop(trajC, ts => { const dt = last ? Math.min(0.05,(ts-last)/1000) : 0; last = ts; play += dt*28; if (play > T + 40) play = 40; drawTraj(); drawPlot(); });
  rebuild(); onRedraw(() => { drawTraj(); drawPlot(); });
})();

// ======================================================================
// 5. Lyapunov spectrum, computed live by QR reorthonormalization
//    dx/dt = -x + g W tanh(x);  tangent dynamics dQ/dt = J Q,  J = -I + g W diag(1 - tanh^2 x)
// ======================================================================
(function lyapunov(){
  const specC = $('ly-spec'), convC = $('ly-conv'); if (!specC) return;
  const slider = $('ly-g'), gout = $('ly-gout'), readout = $('ly-readout');
  const N = 80, DT = 0.05, STEPS = 6, QR_EVERY = 4, T_TRANS = 40;
  const rng = mulberry32(1);
  const W = new Float64Array(N*N); const s = 1/Math.sqrt(N);
  for (let i=0;i<N*N;i++) W[i] = gauss(rng)*s;
  const x = new Float64Array(N), th = new Float64Array(N), D = new Float64Array(N), dx = new Float64Array(N);
  const Q = new Float64Array(N*N), JQ = new Float64Array(N*N), WD = new Float64Array(N*N);
  const S = new Float64Array(N), est = new Float64Array(N);
  let g = parseFloat(slider.value), t = 0, tAvg = 0, nstep = 0, hist = [];
  const kr = mulberry32(99);

  function reset(){
    for (let i=0;i<N;i++) x[i] = gauss(kr);
    Q.fill(0); for (let i=0;i<N;i++) Q[i*N+i] = 1;   // Q stored row-major: Q[i*N + j] is row i, column j
    S.fill(0); est.fill(0); t = 0; tAvg = 0; nstep = 0; hist = [];
  }
  function qr(){
    // modified Gram-Schmidt on columns of Q; accumulate log of diagonal of R after the transient
    for (let j=0;j<N;j++){
      for (let k=0;k<j;k++){
        let d=0; for (let i=0;i<N;i++) d += Q[i*N+k]*Q[i*N+j];
        for (let i=0;i<N;i++) Q[i*N+j] -= d*Q[i*N+k];
      }
      let nrm=0; for (let i=0;i<N;i++) nrm += Q[i*N+j]*Q[i*N+j]; nrm = Math.sqrt(nrm);
      for (let i=0;i<N;i++) Q[i*N+j] /= nrm;
      if (t > T_TRANS) S[j] += Math.log(nrm);
    }
  }
  function step(){
    for (let i=0;i<N;i++){ th[i] = Math.tanh(x[i]); D[i] = 1 - th[i]*th[i]; }
    for (let i=0;i<N;i++){ let acc=0; const o=i*N; for (let j=0;j<N;j++){ acc += W[o+j]*th[j]; WD[o+j] = g*W[o+j]*D[j]; } dx[i] = -x[i] + g*acc; }
    // JQ = (-I + WD) Q ; Euler update of the tangent vectors uses the same step as the state
    for (let i=0;i<N;i++){ const o=i*N; for (let j=0;j<N;j++){ let acc = -Q[o+j]; for (let k=0;k<N;k++) acc += WD[o+k]*Q[k*N+j]; JQ[o+j] = acc; } }
    for (let i=0;i<N*N;i++) Q[i] += DT*JQ[i];
    for (let i=0;i<N;i++) x[i] += DT*dx[i];
    t += DT; nstep++;
    if (nstep % QR_EVERY === 0){
      qr();
      if (t > T_TRANS){ tAvg = t - T_TRANS; for (let j=0;j<N;j++) est[j] = S[j]/tAvg; hist.push([tAvg, est[0]]); if (hist.length > 4000) hist.splice(0, hist.length - 4000); }
    }
  }
  function kyDim(){
    let sum = 0;
    for (let k=0;k<N;k++){ if (sum + est[k] < 0) return k === 0 ? 0 : k + sum/Math.abs(est[k]); sum += est[k]; }
    return N;
  }
  function drawSpec(){
    const [ctx,w,h] = fit(specC);
    const muted=css('--muted'), rule=css('--rule'), ord=css('--ordered'), cha=css('--chaotic');
    ctx.clearRect(0,0,w,h);
    const L = 34, R = w-10, top = 30, bot = h-26, YMAX = 0.6, YMIN = -2.4;
    const Y = v => top + (YMAX - Math.max(YMIN, Math.min(YMAX, v)))/(YMAX-YMIN)*(bot-top);
    const X = i => L + (R-L)*(i+0.5)/N;
    ctx.strokeStyle = rule; ctx.lineWidth = 1;
    for (const v of [0.5,-1,-2]){ ctx.beginPath(); ctx.moveTo(L,Y(v)); ctx.lineTo(R,Y(v)); ctx.stroke(); }
    ctx.strokeStyle = muted; ctx.beginPath(); ctx.moveTo(L,Y(0)); ctx.lineTo(R,Y(0)); ctx.stroke();
    ctx.fillStyle = muted; ctx.font = FONT; ctx.textAlign = 'right';
    for (const v of [0.5,0,-1,-2]) ctx.fillText(v.toString().replace('-','−'), L-6, Y(v)+4);
    ctx.textAlign = 'left'; ctx.fillText('Lyapunov exponents, largest to smallest', L, 17);
    ctx.fillText('index', R-30, h-8);
    if (tAvg <= 0){ ctx.fillText('Settling past the transient…', L+8, (top+bot)/2); return; }
    for (let i=0;i<N;i++){ ctx.fillStyle = est[i] > 0.005 ? cha : ord; ctx.beginPath(); ctx.arc(X(i), Y(est[i]), 2.6, 0, 2*Math.PI); ctx.fill(); }
  }
  function drawConv(){
    const [ctx,w,h] = fit(convC);
    const muted=css('--muted'), rule=css('--rule'), ink=css('--ink');
    ctx.clearRect(0,0,w,h);
    const L = 34, R = w-10, top = 30, bot = h-26;
    ctx.fillStyle = muted; ctx.font = FONT; ctx.fillText('Largest exponent, running estimate', 10, 17);
    if (hist.length < 2){ return; }
    const tmax = Math.max(50, hist[hist.length-1][0]);
    let lo = Infinity, hi = -Infinity; const from = hist.findIndex(p => p[0] > tmax*0.15);
    for (let i=Math.max(0,from);i<hist.length;i++){ lo = Math.min(lo,hist[i][1]); hi = Math.max(hi,hist[i][1]); }
    lo = Math.min(lo, -0.05); hi = Math.max(hi, 0.05); const padv = (hi-lo)*0.15; lo -= padv; hi += padv;
    const X = t => L + (R-L)*t/tmax, Y = v => top + (hi - Math.max(lo,Math.min(hi,v)))/(hi-lo)*(bot-top);
    ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L,Y(0)); ctx.lineTo(R,Y(0)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText('0', L-6, Y(0)+4); ctx.textAlign = 'left';
    ctx.fillText(`time averaged: ${Math.round(tmax)}`, L, h-8);
    ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath();
    hist.forEach((p,i) => { const xx=X(p[0]), yy=Y(p[1]); i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); }); ctx.stroke();
  }
  function describe(){
    gout.textContent = g.toFixed(2);
    if (tAvg < 30){ readout.innerHTML = 'Averaging the exponents along the trajectory…'; return; }
    const l1 = est[0];
    if (l1 > 0.01){
      readout.innerHTML = `<span class="state-chaotic">Chaotic.</span> The largest exponent is about ${l1.toFixed(3)} per time constant, so nearby states separate exponentially. Kaplan–Yorke dimension ≈ ${kyDim().toFixed(1)}.`;
    } else if (l1 > -0.01){
      readout.innerHTML = `<span class="state-ordered">Marginal.</span> The largest exponent is about ${l1.toFixed(3)}, close to zero: activity neither converges nor separates, as on a limit cycle or torus.`;
    } else {
      readout.innerHTML = `<span class="state-ordered">Stable.</span> All exponents are negative (largest ≈ ${l1.toFixed(3)}), so nearby states converge and activity settles.`;
    }
  }
  slider.addEventListener('input', () => { g = parseFloat(slider.value); gout.textContent = g.toFixed(2); });
  slider.addEventListener('change', () => { reset(); describe(); drawSpec(); drawConv(); });
  $('ly-restart').addEventListener('click', () => { reset(); describe(); drawSpec(); drawConv(); });
  let frames = 0;
  function run(n){ for (let k=0;k<n;k++) step(); }
  loop(specC, () => { run(STEPS); if (++frames % 3 === 0) describe(); drawSpec(); drawConv(); });
  reset();
  if (reduce){ run(Math.round((T_TRANS+200)/DT)); }
  describe(); drawSpec(); drawConv(); onRedraw(() => { drawSpec(); drawConv(); });
  // expose for verification in tests
  window.__lyap = { setG: v => { g = v; reset(); }, run, est, get t(){ return t; }, W, N };
})();

})();
