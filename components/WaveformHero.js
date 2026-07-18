// Eight individual wave lines — one for each classmate "wave" — start
// staggered on the left and gradually converge into a single shared line
// on the right, visualizing "8WAVES" becoming one CONNECT-ed line.

const WIDTH = 1200;
const HEIGHT = 200;
const BASELINE = 100;
const CONVERGE_START = 0.5; // fraction of width where lines begin merging
const LINE_COUNT = 8;

function smoothstep(t) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function rgbToHex([r, g, b]) {
  const c = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(a.map((av, i) => av + (b[i] - av) * t));
}

// Brand gradient: teal -> violet -> coral
function colorForIndex(i, total) {
  const t = i / (total - 1);
  if (t <= 0.5) return lerpColor("#2DD4BF", "#8B5CF6", t * 2);
  return lerpColor("#8B5CF6", "#FF6B4A", (t - 0.5) * 2);
}

function buildPath({ amplitude, phase, frequency }) {
  const samples = 220;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * WIDTH;
    const t = x / WIDTH;
    let envelope = 1;
    if (t > CONVERGE_START) {
      const localT = (t - CONVERGE_START) / (1 - CONVERGE_START);
      envelope = 1 - smoothstep(localT);
    }
    const y = BASELINE + amplitude * envelope * Math.sin(t * frequency * Math.PI * 2 + phase);
    d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

export default function WaveformHero() {
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => {
    const phase = (i / LINE_COUNT) * Math.PI * 2;
    const amplitude = 18 + (i % 3) * 6; // slight organic variance
    const frequency = 3;
    return {
      d: buildPath({ amplitude, phase, frequency }),
      color: colorForIndex(i, LINE_COUNT),
      opacity: 0.55 + (i / LINE_COUNT) * 0.35,
      duration: 6 + i * 1.1,
      reverse: i % 2 === 0,
    };
  });

  return (
    <svg
      className="waveform"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={line.d}
          fill="none"
          stroke={line.color}
          strokeOpacity={line.opacity}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 6"
          style={{
            animation: `wave-drift ${line.duration}s linear infinite ${line.reverse ? "reverse" : "normal"}`,
          }}
        />
      ))}
    </svg>
  );
}
