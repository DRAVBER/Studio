import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

export function ProfileCard({ profile }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState(null);
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  useEffect(() => { if (!enabled) setTilt(null); }, [enabled]);

  const onMove = (e) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({
      '--mx': `${(x + 0.5) * 100}%`,
      '--my': `${(y + 0.5) * 100}%`,
      transform: `perspective(1000px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(0)`,
    });
  };

  const onLeave = () => setTilt(null);

  return (
    <div
      ref={ref}
      className="profile-card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={tilt || {}}
    >
      <div className="profile-glow" aria-hidden="true" />

      <div className="profile-photo-wrap">
        <img
          className="profile-photo"
          src={profile.photo}
          alt={profile.name}
          loading="lazy"
          draggable="false"
        />
        <div className="profile-status">
          <span className="pulse" />
          {profile.status}
        </div>
      </div>

      <div className="profile-info">
        <h3 className="profile-name">{profile.name}</h3>
        <p className="profile-role">{profile.role}</p>
        <p className="profile-location">{profile.location}</p>
        <p className="profile-bio">{profile.bio}</p>

        <div className="profile-skills">
          {profile.skills.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>

        <div className="profile-facts">
          {profile.facts.map((f) => (
            <div key={f.label}>
              <b>{f.value}</b>
              <small>{f.label}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}