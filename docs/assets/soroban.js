/* Reusable soroban components: Soroban.svg(value), Soroban.rod(el,opts), Soroban.quiz(el,items) */
window.Soroban = (function () {
  const COL = { h: '#2f7fd0', e: ['#e8a317', '#e8a317', '#e8a317', '#e8a317'] };
  function bead(y, col, i, kind, cls) {
    const cx = 60, t = y, b = y + 32, m = y + 16;
    return `<polygon${cls ? ` class="${cls}"` : ''} data-k="${kind}" data-i="${i}" points="${cx-44},${m} ${cx-14},${t} ${cx+14},${t} ${cx+44},${m} ${cx+14},${b} ${cx-14},${b}" fill="${col}" stroke="rgba(0,0,0,.28)" stroke-width="1.5"/>`;
  }
  // One vertical rod, value 0..9: heaven bead on top, bar, four earth beads below.
  // Optional target t: beads whose position differs from t get class "need" (used to pulse them).
  function svg(v, t) {
    const h = v >= 5, e = v % 5, has = t !== undefined && t !== null;
    const th = t >= 5, te = t % 5;
    let s = `<svg viewBox="0 0 120 300" role="img" aria-label="عمود سوروبان يعرض ${v}">`;
    s += `<rect x="2" y="2" width="116" height="296" rx="12" fill="#141414"/>`;
    s += `<rect x="58" y="10" width="4" height="280" fill="#eadfb0"/>`;
    s += `<rect x="6" y="96" width="108" height="8" rx="2" fill="#f2f2f2"/>`;
    s += bead(h ? 62 : 12, COL.h, 0, 'h', has && h !== th ? 'need' : '');
    for (let k = 0; k < 4; k++) s += bead(k < e ? 106 + 32 * k : 158 + 32 * k, COL.e[k], k, 'e', has && (k < e) !== (k < te) ? 'need' : '');
    return s + '</svg>';
  }
  // Tappable rod: tapping a bead moves it (with the beads that must go with it) to or from the bar.
  function rod(el, opts) {
    opts = opts || {};
    let v = opts.value || 0, need = null;
    const draw = () => { el.innerHTML = svg(v, need); };
    el.addEventListener('click', ev => {
      const p = ev.target.closest('polygon'); if (!p) return;
      const i = +p.dataset.i, h = v >= 5 ? 5 : 0, e = v % 5;
      if (p.dataset.k === 'h') v = (h ? 0 : 5) + e;
      else v = h + (i < e ? i : i + 1);
      need = null; draw(); opts.onChange && opts.onChange(v);
    });
    draw();
    return { get: () => v, set: x => { v = x; need = null; draw(); }, hint: t => { need = t; draw(); } };
  }
  // Retrieval quiz. items: [{p: html, o: [...], a: correctIndex, x: explanation}]
  function quiz(el, items) {
    let i = 0, score = 0, done = false;
    const show = () => {
      done = false;
      if (i >= items.length) {
        el.innerHTML = `<p class="rule">النتيجة: ${score} من ${items.length}</p><p>${score === items.length ? 'ممتاز. أعد الاختبار بعد يومين لتثبيت المعلومة.' : 'لا بأس — أعد المحاولة غدًا؛ الاسترجاع المتكرر هو ما يثبّت المعلومة.'}</p><button class="btn ghost" data-r>أعد الاختبار</button>`;
        return;
      }
      const q = items[i];
      el.innerHTML = `<p class="q-n">سؤال ${i + 1} من ${items.length}</p><div class="q-p">${q.p}</div><div class="q-o">${q.o.map((o, j) => `<button class="opt" data-j="${j}">${o}</button>`).join('')}</div><p class="fb" aria-live="polite"></p>`;
    };
    el.addEventListener('click', ev => {
      if (ev.target.closest('[data-r]')) { i = 0; score = 0; show(); return; }
      if (ev.target.closest('[data-n]')) { i++; show(); return; }
      const b = ev.target.closest('.opt'); if (!b || done) return;
      done = true;
      const q = items[i], j = +b.dataset.j, right = j === q.a;
      if (right) score++;
      el.querySelectorAll('.opt').forEach((o, k) => { if (k === q.a) o.classList.add('right'); else if (k === j) o.classList.add('wrong'); });
      const fb = el.querySelector('.fb');
      fb.innerHTML = `<span class="${right ? 'ok' : 'no'}">${right ? 'صحيح.' : 'ليس تمامًا.'}</span> <span style="font-weight:400">${q.x}</span>`;
      fb.insertAdjacentHTML('afterend', `<button class="btn" data-n>التالي</button>`);
    });
    show();
  }
  // Two rods side by side: tens on the left, units on the right (always left-to-right, even on RTL pages).
  function pairSvg(v) {
    const t = Math.floor(v / 10) % 10, u = v % 10;
    return `<div class="pair" dir="ltr" role="img" aria-label="عمودان يعرضان ${v}"><div class="ten">${svg(t)}</div><div class="unit">${svg(u)}</div></div>`;
  }
  // Two tappable rods. value = 10 × tens + units.
  function pair(el, opts) {
    opts = opts || {};
    const v0 = opts.value || 0;
    el.innerHTML = '<div class="pair" dir="ltr"><div class="ten"></div><div class="unit"></div></div>';
    const fire = () => opts.onChange && opts.onChange(get());
    const t = rod(el.querySelector('.ten'), { value: Math.floor(v0 / 10) % 10, onChange: fire });
    const u = rod(el.querySelector('.unit'), { value: v0 % 10, onChange: fire });
    const get = () => 10 * t.get() + u.get();
    return { get, set: v => { t.set(Math.floor(v / 10) % 10); u.set(v % 10); } };
  }
  return { svg, rod, quiz, pairSvg, pair };
})();
