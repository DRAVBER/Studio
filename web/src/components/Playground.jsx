import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
export function Playground() {
  const canvasRef = useRef(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 600px), (pointer: coarse)');
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d');
    if (!ctx) return;
    let raf, active = false, dpr = 1, width = 0, height = 0, particles = [];
    const mouse = { x: -2000, y: -2000, active: false }, ripples = [];
    const draw = () => {
      ctx.fillStyle = reduced ? '#0a0812' : 'rgba(10,8,18,0.24)'; ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduced) {
          if (mouse.active) {
            const dx = mouse.x - p.x, dy = mouse.y - p.y, distance = Math.hypot(dx, dy) || 1;
            if (distance < 160) { const force = (1 - distance / 160) * 0.3; p.vx += dx / distance * force; p.vy += dy / distance * force; }
          }
          for (const ripple of ripples) {
            const dx = p.x - ripple.x, dy = p.y - ripple.y, distance = Math.hypot(dx, dy) || 1;
            const diff = Math.abs(distance - ripple.r);
            if (diff < 30) { const force = (1 - diff / 30) * 0.8; p.vx += dx / distance * force; p.vy += dy / distance * force; }
          }
          p.vx = p.vx * 0.97 + (Math.random() - 0.5) * 0.02; p.vy = p.vy * 0.97 + (Math.random() - 0.5) * 0.02;
          p.x = (p.x + p.vx + width) % width; p.y = (p.y + p.vy + height) % height;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `hsla(${p.hue},85%,70%,0.9)`; ctx.fill();
      }
      ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(168,85,247,0.12)';
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < 6400) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]; ripple.r += 4; ripple.alpha *= 0.96;
        if (ripple.alpha < 0.02) { ripples.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(192,132,252,${ripple.alpha * 0.6})`; ctx.stroke();
      }
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.forEach(p => { p.x %= width; p.y %= height; }); draw();
    };
    resize();
    particles = Array.from({ length: reduced ? 40 : mobile ? 55 : 110 }, () => ({
      x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.8, hue: 260 + Math.random() * 60,
    }));
    draw();
    const tick = () => { if (!active || document.hidden || reduced) return; draw(); raf = requestAnimationFrame(tick); };
    const resume = () => { cancelAnimationFrame(raf); if (active && !document.hidden && !reduced) raf = requestAnimationFrame(tick); };
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; resume(); });
    observer.observe(canvas);
    const move = event => { if (mobile || reduced) return; const rect = canvas.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; mouse.active = true; };
    const leave = () => { mouse.active = false; };
    const down = event => { if (reduced) return; const rect = canvas.getBoundingClientRect(); ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, r: 0, alpha: 1 }); };
    const keydown = event => { if (!reduced && ['Enter', ' '].includes(event.key)) { event.preventDefault(); ripples.push({ x: width / 2, y: height / 2, r: 0, alpha: 1 }); } };
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave); canvas.addEventListener('pointerdown', down); canvas.addEventListener('keydown', keydown);
    addEventListener('resize', resize); document.addEventListener('visibilitychange', resume);
    return () => {
      observer.disconnect(); cancelAnimationFrame(raf); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', resume);
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('keydown', keydown);
    };
  }, [reduced, mobile]);
  return <section className="playground" id="playground"><div className="wrap">
    <div className="label">04 — Поиграем</div><h2>Почувствуй <em>магнетизм</em></h2>
    <p className="playground-hint">{reduced ? 'Немного спокойного звёздного света' : mobile ? 'Коснитесь, чтобы создать волну' : 'Поводи мышкой · кликни, чтобы создать волну'}</p>
    </div><div className="playground-canvas-wrap"><canvas ref={canvasRef} className="playground-canvas" role="img"
      tabIndex={reduced ? -1 : 0} aria-label={reduced ? 'Звёздное поле' : 'Интерактивное звёздное поле. Нажмите Enter или коснитесь, чтобы создать волну.'} /></div>
  </section>;
}
