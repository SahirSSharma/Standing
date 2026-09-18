// Section headings arrive in the manual's all-caps ("DISCLOSURE OF DIRECTORY INFORMATION"); shown in
// sentence case with acronyms, names and grade letters kept ("THE P AND NP GRADES" → "The P and NP grades"),
// and a trailing "(FERPA)"-style parenthetical dropped. Used by the source cards and the policy pages.
const CASED = { uc: "UC", vcsa: "VCSA", ferpa: "FERPA", i: "I", ip: "IP", p: "P", np: "NP", s: "S", u: "U", w: "W" };

export default function sentenceCase(heading) {
  const words = heading.toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/:$/, "").split(/\s+/);
  return words
    .map((w, i) =>
      CASED[w] ?? (i === 0 || ["exhibit", "appendix"].includes(words[i - 1]) ? w[0].toUpperCase() + w.slice(1) : w)
    )
    .join(" ")
    .replace("san diego", "San Diego")
    .replace("family educational rights and privacy act", "Family Educational Rights and Privacy Act");
}
