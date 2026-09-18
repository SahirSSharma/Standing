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
