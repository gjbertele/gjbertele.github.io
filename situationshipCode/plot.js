

    const circleRadius = 13;
    const A = {x: 300, y: 40}, B = {x: 40, y: 490}, C = {x: 560, y: 490};
    const svg = document.getElementById('board');
    const tri = document.getElementById('tri');
    const layer = document.getElementById('points');
    const pathEl = document.getElementById('path');
    const NS = 'http://www.w3.org/2000/svg';
  
    let points = [];          // {x, y, el}
    let selected = null;
    let dragging = null;
  
    // --- geometry ---
    function barycentric(p) {
      const d = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
      const a = ((B.y - C.y) * (p.x - C.x) + (C.x - B.x) * (p.y - C.y)) / d;
      const b = ((C.y - A.y) * (p.x - C.x) + (A.x - C.x) * (p.y - C.y)) / d;
      return [a, b, 1 - a - b];
    }
    function inside(p) { return barycentric(p).every(w => w >= 0); }
  
    function closestOnSegment(p, s, e) {
      const dx = e.x - s.x, dy = e.y - s.y;
      const t = Math.max(0, Math.min(1, ((p.x - s.x) * dx + (p.y - s.y) * dy) / (dx * dx + dy * dy)));
      return {x: s.x + t * dx, y: s.y + t * dy};
    }
    // Keep a point inside the triangle: if outside, snap to the nearest edge.
    function clamp(p) {
      if (inside(p)) return p;
      let best = null, bestD = Infinity;
      for (const [s, e] of [[A, B], [B, C], [C, A]]) {
        const q = closestOnSegment(p, s, e);
        const dist = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
        if (dist < bestD) { bestD = dist; best = q; }
      }
      return best;
    }
    function toSvg(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const m = pt.matrixTransform(svg.getScreenCTM().inverse());
      return {x: m.x, y: m.y};
    }
  
    // --- points ---
    function place(p) {
      p.el.setAttribute('cx', p.x.toFixed(1));
      p.el.setAttribute('cy', p.y.toFixed(1));
      p.label.setAttribute('x', p.x.toFixed(1));
      p.label.setAttribute('y', p.y.toFixed(1));
      drawPath();
    }
    // Line connecting each point to the one added before it.
    function drawPath() {
      pathEl.setAttribute('points', points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    }
    // Labels show the order points were added; renumber after any add or remove.
    function renumber() {
      points.forEach((p, i) => {
        p.label.textContent = i + 1;
        p.el.setAttribute('aria-label', `Point ${i + 1}. Drag or use arrow keys to move, Delete to remove.`);
      });
      drawPath();
    }
    function select(p) {
      if (selected) selected.el.classList.remove('sel');
      selected = p;
      if (p) { p.el.classList.add('sel'); }
    }

    function addPoint(pos) {
      const el = document.createElementNS(NS, 'circle');
      el.setAttribute('r', circleRadius);
      el.setAttribute('class', 'pt');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      const label = document.createElementNS(NS, 'text');
      label.setAttribute('class', 'lbl');
      const p = {x: pos.x, y: pos.y, el, label};
      points.push(p);
      layer.appendChild(el);
      layer.appendChild(label);
      place(p);
      renumber();
  
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);
        dragging = p;
        svg.classList.add('dragging');
        select(p);
      });
      el.addEventListener('pointermove', e => {
        if (dragging !== p) return;
        Object.assign(p, clamp(toSvg(e)));
        place(p);
      });
      const stop = () => { dragging = null; svg.classList.remove('dragging'); };
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointercancel', stop);
      el.addEventListener('dblclick', e => { e.stopPropagation(); removePoint(p); });
      el.addEventListener('focus', () => select(p));
      el.addEventListener('keydown', e => {
        const step = e.shiftKey ? 10 : 2;
        const moves = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]};
        if (moves[e.key]) {
          e.preventDefault();
          Object.assign(p, clamp({x: p.x + moves[e.key][0], y: p.y + moves[e.key][1]}));
          place(p);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault(); removePoint(p);
        }
      });
      select(p);
      return p;
    }
    function removePoint(p) {
      p.el.remove();
      p.label.remove();
      points = points.filter(q => q !== p);
      if (selected === p) select(null);
      renumber();
    }
  
    tri.addEventListener('click', e => {
      const pos = toSvg(e);
      if (inside(pos)) addPoint(pos);
    });
    svg.addEventListener('click', e => { if (e.target === svg) select(null); });
    document.getElementById('clear').addEventListener('click', () => {
      window.location.replace(window.location.href);
    });