function wavePath(amplitude, yOffset) {
  // Builds a smooth sine-like path with exactly 8 crests across the viewBox,
  // the literal "8 waves" the platform is named after.
  const width = 1200;
  const crests = 8;
  const step = width / crests;
  let d = `M 0 ${yOffset}`;
  for (let i = 0; i < crests; i++) {
    const x1 = i * step + step / 4;
    const x2 = i * step + step / 2;
    const x3 = i * step + (3 * step) / 4;
    const x4 = (i + 1) * step;
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` C ${x1} ${yOffset + dir * amplitude}, ${x2} ${yOffset + dir * amplitude}, ${x2} ${yOffset}`;
    d += ` C ${x3} ${yOffset - dir * amplitude}, ${x4} ${yOffset - dir * amplitude}, ${x4} ${yOffset}`;
  }
  return d;
}

export default function WaveformHero() {
  return (
    <svg className="waveform" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
      <path className="w3" d={wavePath(46, 100)} />
      <path className="w2" d={wavePath(34, 90)} />
      <path className="w1" d={wavePath(22, 80)} />
    </svg>
  );
}
