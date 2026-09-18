// Small line icons as inline SVG (24 x 24, stroke = currentColor). No icon font, no emoji.
const PATHS = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  shield: "M12 3l7 3v5.5c0 4.6-3 8.2-7 9.5-4-1.3-7-4.9-7-9.5V6z",
  mail: "M4 6.5h16v11H4zM4 7.5l8 6 8-6",
  scale: "M12 4v16M8 20h8M4 7h16M7 7l-3.5 7.5a3.5 3.5 0 0 0 7 0zM17 7l-3.5 7.5a3.5 3.5 0 0 0 7 0z",
  flag: "M5 21V4M5 4.5h12.5l-2.5 4 2.5 4H5",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4.5-5.8",
  landmark: "M3 21h18M5 21v-9M10 21v-9M14 21v-9M19 21v-9M3 11l9-6 9 6z",
  copy: "M9 9h10v11H9zM5 15V4h10",
  check: "M5 12.5l4.5 4.5L19 7.5",
  external: "M7 17L17 7M8 7h9v9",
  retry: "M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3M12 15v2.5",
  cap: "M2.5 9.5L12 5l9.5 4.5L12 14zM6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M21.5 9.5V15",
  megaphone: "M4 10v4h3l7 4V6l-7 4zM17 9.5a3.5 3.5 0 0 1 0 5M7 14v5h3v-5",
  wallet: "M3.5 7.5A2 2 0 0 1 5.5 5.5H18v3M3.5 7.5v10a2 2 0 0 0 2 2h15v-11h-15a2 2 0 0 1-2-2zM16 14.5h.5",
  calendar: "M4 6.5h16v14H4zM4 10.5h16M8 4v4M16 4v4M8 14h3",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
  pen: "M4 20h4l11-11-4-4L4 16zM13 7l4 4",
  chevron: "M8 10l4 4 4-4",
  x: "M7 7l10 10M17 7L7 17",
  alert: "M12 4l9.5 16h-19zM12 10v4M12 17.5v.5",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5",
  list: "M5 7h1M9 7h10M5 12h1M9 12h10M5 17h1M9 17h10",
  book: "M4 5.5h6.5a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5.5h-6.5a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2H20z",
  back: "M19 12H5M11 6l-6 6 6 6",
  gavel: "M13 6l5 5M9 10l5 5M10.5 8.5l2-2 5 5-2 2zM4 20l7-7M15 20h6",
  home: "M4 11l8-7 8 7v9h-5v-5h-6v5H4z",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  bike: "M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5.5 14l3-7h4l3 7M12.5 7h3l3 7M9 14h6",
  car: "M4 14l2-5h12l2 5v5H4zM4 14h16M7 19v1.5M17 19v1.5M7.5 16.5h1M15.5 16.5h1",
  hand: "M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V11M13 10.5V6a1.5 1.5 0 0 1 3 0v6.5M16 12a1.5 1.5 0 0 1 3 0v2.5A6.5 6.5 0 0 1 12.5 21H12a5 5 0 0 1-5-5v-5",
};

export function Icon({ name, className = "size-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
