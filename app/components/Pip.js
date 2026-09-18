// Pip, Standing's sea lion. One inline SVG, posed with a prop, animated with CSS classes from
// globals.css (pip-* keyframes; every one is switched off under prefers-reduced-motion):
//   pose="happy"   sits up and smiles (hero, verdict)         wave     → the right flipper waves once
//   pose="point"   same, arm raised toward the speech bubble  talking  → the mouth moves for ~2 s
//   pose="reading" head down over a page (the loading state)  bob      → the whole body bobs
//   pose="cheer"   both eyes closed-happy, flipper up, sparkle (verdict: yes)
//   pose="sorry"   soft brows, flippers open (a refusal)
//   pose="face"    just the head, for 16–32 px marks (header, favicon)
// Decorative by default (aria-hidden); pass `label` to expose it as an image.
const INK = "#14213D";
const GOLD = "#E9B949";
const PAPER = "#FAF7F2";
const BELLY = "#3B4C78";

export default function Pip({ pose = "happy", wave = false, talking = false, bob = false, label, className = "" }) {
  const cls = [
    "pip",
    `pip-${pose}`,
    wave && "pip-wave",
    talking && "pip-talking",
    bob && "pip-bob",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  if (pose === "face") {
    return (
      <svg viewBox="0 0 120 120" className={cls} {...a11y}>
        <circle cx="60" cy="60" r="52" fill={INK} />
        <ellipse cx="60" cy="80" rx="24" ry="17" fill={PAPER} />
        <circle cx="60" cy="72" r="7" fill={INK} />
        <path d="M42 84l10 1M42 92l10-1M78 84l-10 1M78 92l-10-1" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="42" cy="50" r="11" fill="#fff" />
        <circle cx="78" cy="50" r="11" fill="#fff" />
        <circle cx="44" cy="52" r="5.5" fill={INK} />
        <circle cx="80" cy="52" r="5.5" fill={INK} />
        <circle cx="46" cy="50" r="2" fill="#fff" />
        <circle cx="82" cy="50" r="2" fill="#fff" />
      </svg>
    );
  }

  const reading = pose === "reading";
  const cheer = pose === "cheer";
  const sorry = pose === "sorry";
  const point = pose === "point";

  return (
    <svg viewBox="0 0 120 120" className={cls} {...a11y}>
      {/* tail flippers */}
      <ellipse cx="42" cy="111" rx="13" ry="5" fill={INK} transform="rotate(-18 42 111)" />
      <ellipse cx="78" cy="111" rx="13" ry="5" fill={INK} transform="rotate(18 78 111)" />
      {/* body and belly */}
      <path d="M60 34 C42 34 34 58 36 84 C37 100 46 112 60 112 C74 112 83 100 84 84 C86 58 78 34 60 34Z" fill={INK} />
      <path d="M60 60 C51 60 47 78 48 92 C49 102 54 108 60 108 C66 108 71 102 72 92 C73 78 69 60 60 60Z" fill={BELLY} />
      {/* left flipper (viewer's left): holds the page when reading, opens when sorry */}
      {reading ? (
        <g className="pip-page">
          <rect x="22" y="70" width="26" height="30" rx="3" fill="#fff" stroke={INK} strokeWidth="2" transform="rotate(12 35 85)" />
          <path d="M28 78h14M28 84h14M28 90h8" stroke={GOLD} strokeWidth="2" strokeLinecap="round" transform="rotate(12 35 85)" />
          <ellipse cx="38" cy="86" rx="6" ry="15" fill={INK} transform="rotate(60 38 86)" />
        </g>
      ) : sorry ? (
        <ellipse cx="30" cy="80" rx="6" ry="15" fill={INK} transform="rotate(70 30 80)" />
      ) : (
        <ellipse cx="35" cy="88" rx="6" ry="15" fill={INK} transform="rotate(30 35 88)" />
      )}
      {/* right flipper: the arm that waves, points and cheers (pivot at the shoulder, 78 75) */}
      {sorry ? (
        <ellipse cx="90" cy="80" rx="6" ry="15" fill={INK} transform="rotate(-70 90 80)" />
      ) : (
        <g className={`pip-arm${cheer || point ? " pip-arm-up" : ""}`}>
          <ellipse cx="85" cy="88" rx="6" ry="15" fill={INK} transform="rotate(-30 85 88)" />
        </g>
      )}
      {cheer && <path d="M98 34l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={GOLD} className="pip-sparkle" />}
      {/* scarf */}
      <path d="M40 57 Q60 67 80 57 L80 63 Q60 73 40 63Z" fill={GOLD} />
      <path d="M76 61l7 12-8 1z" fill={GOLD} />
      {/* head */}
      <g className="pip-head">
        <circle cx="60" cy="38" r="23" fill={INK} />
        <circle cx="39" cy="42" r="3.5" fill={INK} />
        <circle cx="81" cy="42" r="3.5" fill={INK} />
        <ellipse cx="60" cy="48" rx="12" ry="8.5" fill={PAPER} />
        <circle cx="60" cy="44" r="3.4" fill={INK} />
        <path d="M50 49.5l6 .5M50 53l6-.5M70 49.5l-6 .5M70 53l-6-.5" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        {/* eyes */}
        {cheer ? (
          <path d="M46 35 Q51 30 56 35M64 35 Q69 30 74 35" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        ) : (
          <>
            <circle cx="51" cy="35" r="5.2" fill="#fff" />
            <circle cx="69" cy="35" r="5.2" fill="#fff" />
            <circle cx={reading ? 53 : 52} cy={reading ? 37.5 : 36} r="2.7" fill={INK} />
            <circle cx={reading ? 71 : 70} cy={reading ? 37.5 : 36} r="2.7" fill={INK} />
            <circle cx="53" cy="35" r="1" fill="#fff" />
            <circle cx="71" cy="35" r="1" fill="#fff" />
            {/* eyelids: scaleY 0 → 1 for a blink */}
            <circle cx="51" cy="35" r="5.4" fill={INK} className="pip-lid" />
            <circle cx="69" cy="35" r="5.4" fill={INK} className="pip-lid" />
          </>
        )}
        {sorry && <path d="M45 28l8 3M75 28l-8 3" stroke={INK} strokeWidth="2" strokeLinecap="round" />}
        {/* mouth: closed and open variants, toggled while talking */}
        {cheer ? (
          <path d="M53 51 Q60 59 67 51" stroke={INK} strokeWidth="1.8" fill="#fff" strokeLinecap="round" />
        ) : sorry ? (
          <path d="M56 54 Q60 51.5 64 54" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        ) : (
          <>
            <path d="M55 52 Q60 56 65 52" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" className="pip-mouth-closed" />
            <ellipse cx="60" cy="53.5" rx="3.4" ry="2.8" fill={INK} className="pip-mouth-open" />
          </>
        )}
      </g>
    </svg>
  );
}
