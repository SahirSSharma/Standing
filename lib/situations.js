// The eight situations on the home page and the short questions that personalise each one.
// Plain data (no JSX) so eval/check.mjs can validate it and app/components/Situations.js can render it.
//
// `q` is the preset question — byte-identical to eval questions q62–q69, so a card can never lead to an
// ungraded answer. `context` lists two to four quick picks; every pick maps to a first-person phrase and
// `compose()` appends them to `q` as one "My situation:" sentence. The phrases only cover distinctions the
// policies actually make (amplified sound, tax dependents, the sixth week, five days to contest a
// citation…), so the answer can change with them. Kinds: "choice" (one chip), "toggle" (yes / no) and
// "range" (a slider; `phrase(value)` words the number).

export const SITUATIONS = [
  {
    id: "conduct",
    icon: "gavel",
    title: "I got a conduct notice",
    hint: "What happens next, and your rights",
    q: "What happens after a conduct complaint is filed against me, and what are my rights?",
    context: [
      {
        id: "about",
        label: "What is it about?",
        kind: "choice",
        options: [
          { value: "integrity", label: "Academic integrity", phrase: "it's an academic integrity allegation" },
          { value: "alcohol", label: "Alcohol or drugs", phrase: "it's about alcohol or drugs" },
          { value: "housing", label: "A housing rule", phrase: "it's about a residential (housing) rule" },
          { value: "other", label: "Something else", phrase: "it's about a non-academic conduct rule" },
        ],
      },
      {
        id: "stage",
        label: "Where are you in the process?",
        kind: "choice",
        options: [
          { value: "notice", label: "Just got the notice", phrase: "I've only received the notice so far" },
          { value: "meeting", label: "Meeting scheduled", phrase: "a meeting with the conduct office is scheduled" },
          { value: "decision", label: "Decision received", phrase: "I've already received a written decision" },
        ],
      },
      {
        id: "days",
        label: "Days since the notice",
        kind: "range",
        min: 0,
        max: 30,
        step: 1,
        default: 2,
        phrase: (v) => (v === 0 ? "I got the notice today" : `I got the notice ${v} day${v === 1 ? "" : "s"} ago`),
        format: (v) => (v === 0 ? "today" : `${v} day${v === 1 ? "" : "s"}`),
      },
    ],
  },
  {
    id: "grade",
    icon: "cap",
    title: "I want to appeal a grade",
    hint: "When you can, and the steps",
    q: "My professor graded me unfairly. Can I appeal my grade and how?",
    context: [
      {
        id: "why",
        label: "What do you think went wrong?",
        kind: "choice",
        options: [
          { value: "bias", label: "Not about my work", phrase: "I think the grade was based on something other than my work (bias or a personal conflict)" },
          { value: "error", label: "A grading error", phrase: "I think it's a clerical or calculation error" },
          { value: "harsh", label: "Just too harsh", phrase: "I just think the grading was too harsh" },
        ],
      },
      {
        id: "talked",
        label: "Talked to the instructor yet?",
        kind: "toggle",
        yes: "I've already raised it with the instructor",
        no: "I haven't spoken to the instructor yet",
      },
      {
        id: "weeks",
        label: "Weeks since the grade was posted",
        kind: "range",
        min: 0,
        max: 16,
        step: 1,
        default: 1,
        phrase: (v) => (v === 0 ? "the grade was posted this week" : `the grade was posted ${v} week${v === 1 ? "" : "s"} ago`),
        format: (v) => (v === 0 ? "this week" : `${v} week${v === 1 ? "" : "s"}`),
      },
    ],
  },
  {
    id: "records",
    icon: "lock",
    title: "Someone wants my grades",
    hint: "Parents, employers, anyone",
    q: "Can UCSD share my grades with my parents without my permission?",
    // The preset names parents (it is eval q64), so the picks stay inside that situation.
    context: [
      {
        id: "dependent",
        label: "Are you claimed as a dependent on their taxes?",
        kind: "choice",
        options: [
          { value: "yes", label: "Yes", phrase: "I'm claimed as a dependent on their taxes" },
          { value: "no", label: "No", phrase: "I'm not a tax dependent of theirs" },
          { value: "unsure", label: "Not sure", phrase: "I'm not sure whether I'm their tax dependent" },
        ],
      },
      {
        id: "release",
        label: "Signed a release for them?",
        kind: "toggle",
        yes: "I've signed a written release naming them",
        no: "I've never signed a release for them",
      },
    ],
  },
  {
    id: "protest",
    icon: "megaphone",
    title: "I want to hold a protest",
    hint: "Where, when, and the rules",
    q: "Can I organize a protest on campus, and what rules apply?",
    context: [
      {
        id: "where",
        label: "Where?",
        kind: "choice",
        options: [
          { value: "library-walk", label: "Library Walk", phrase: "on Library Walk" },
          { value: "price-center", label: "Price Center plaza", phrase: "at the Price Center plaza" },
          { value: "outdoor", label: "Another outdoor spot", phrase: "in another outdoor space on campus" },
          { value: "indoor", label: "Inside a building", phrase: "inside a campus building" },
        ],
      },
      {
        id: "size",
        label: "How many people?",
        kind: "range",
        min: 5,
        max: 500,
        step: 5,
        default: 40,
        phrase: (v) => `about ${v} people`,
        format: (v) => `${v}`,
      },
      {
        id: "sound",
        label: "Amplified sound?",
        kind: "toggle",
        yes: "we'll use amplified sound (a megaphone or speakers)",
        no: "no amplified sound",
      },
      {
        id: "who",
        label: "Who is organizing?",
        kind: "choice",
        options: [
          { value: "me", label: "Just me and friends", phrase: "it's just me and some friends, not a student org" },
          { value: "org", label: "A registered student org", phrase: "a registered student organization is organizing it" },
          { value: "outside", label: "Includes people from off campus", phrase: "some participants are not UCSD students or staff" },
        ],
      },
    ],
  },
  {
    id: "parking",
    icon: "car",
    title: "I got a parking ticket",
    hint: "How to appeal a citation",
    q: "How do I appeal a campus parking citation?",
    context: [
      {
        id: "days",
        label: "Days since the citation",
        kind: "range",
        min: 0,
        max: 30,
        step: 1,
        default: 1,
        phrase: (v) => (v === 0 ? "I got the citation today" : `I got the citation ${v} day${v === 1 ? "" : "s"} ago`),
        format: (v) => (v === 0 ? "today" : `${v} day${v === 1 ? "" : "s"}`),
      },
      {
        id: "why",
        label: "Why do you think it's wrong?",
        kind: "choice",
        options: [
          { value: "permit", label: "I had a valid permit", phrase: "I had a valid permit but it wasn't displayed" },
          { value: "meter", label: "The meter was broken", phrase: "the meter or pay station was broken" },
          { value: "signs", label: "The signs were unclear", phrase: "the signs were unclear" },
          { value: "other", label: "Something else", phrase: "I think the citation was issued in error" },
        ],
      },
    ],
  },
  {
    id: "harassment",
    icon: "hand",
    title: "I'm being harassed",
    hint: "Where to report, what happens",
    q: "What can I do if I am being sexually harassed by another student?",
    // The preset names another student (it is eval q67), so the picks stay inside that situation.
    context: [
      {
        id: "where",
        label: "Where is it happening?",
        kind: "choice",
        options: [
          { value: "campus", label: "On campus", phrase: "it's happening on campus" },
          { value: "online", label: "Online", phrase: "it's happening online" },
          { value: "off", label: "Off campus", phrase: "it's happening off campus" },
        ],
      },
      {
        id: "confidential",
        label: "What do you want?",
        kind: "choice",
        options: [
          { value: "confidential", label: "Confidential support first", phrase: "I want confidential support before deciding anything" },
          { value: "report", label: "A formal report", phrase: "I want to make a formal report" },
          { value: "unsure", label: "Not sure yet", phrase: "I'm not sure yet what I want to happen" },
        ],
      },
    ],
  },
  {
    id: "probation",
    icon: "alert",
    title: "I'm on academic probation",
    hint: "What it means, how to get off it",
    q: "I'm on academic probation (academic notice). What does it mean and how do I get off it?",
    context: [
      {
        id: "gpa",
        label: "Your GPA last quarter",
        kind: "range",
        min: 0,
        max: 4,
        step: 0.1,
        default: 1.8,
        phrase: (v) => `my GPA last quarter was ${v.toFixed(1)}`,
        format: (v) => v.toFixed(1),
      },
      {
        id: "quarters",
        label: "Quarters on academic notice so far",
        kind: "choice",
        options: [
          { value: "1", label: "This is the first", phrase: "this is my first quarter on academic notice" },
          { value: "2", label: "Second", phrase: "this is my second quarter on academic notice" },
          { value: "3", label: "Third or more", phrase: "I've been on academic notice for three or more quarters" },
        ],
      },
      {
        id: "units",
        label: "Units passed in the last three quarters",
        kind: "range",
        min: 0,
        max: 60,
        step: 2,
        default: 40,
        phrase: (v) => `I passed ${v} units over the last three quarters`,
        format: (v) => `${v}`,
      },
    ],
  },
  {
    id: "withdraw",
    icon: "wallet",
    title: "I need to withdraw",
    hint: "Refunds and what you owe",
    q: "If I withdraw from the quarter, do I get my fees refunded?",
    context: [
      {
        id: "week",
        label: "Which week of the quarter is it?",
        kind: "range",
        min: 1,
        max: 10,
        step: 1,
        default: 3,
        phrase: (v) => `it's week ${v} of the quarter`,
        format: (v) => `week ${v}`,
      },
      {
        id: "reason",
        label: "Why?",
        kind: "choice",
        options: [
          { value: "personal", label: "Personal", phrase: "for personal reasons" },
          { value: "medical", label: "Medical", phrase: "for medical reasons" },
          { value: "military", label: "Military service", phrase: "because I'm being called to military service" },
          { value: "money", label: "Money", phrase: "for financial reasons" },
        ],
      },
      {
        id: "aid",
        label: "Receiving financial aid?",
        kind: "toggle",
        yes: "I receive financial aid",
        no: "I don't receive financial aid",
      },
    ],
  },
];

export const situationById = (id) => SITUATIONS.find((s) => s.id === id);

/** The starting value of every pick: the first option, "no", or the slider's default. */
export function defaults(situation) {
  const out = {};
  for (const c of situation.context) {
    out[c.id] = c.kind === "choice" ? c.options[0].value : c.kind === "toggle" ? false : c.default;
  }
  return out;
}

/** The first-person phrase for one pick. */
export function phrase(c, value) {
  if (c.kind === "choice") return (c.options.find((o) => o.value === value) ?? c.options[0]).phrase;
  if (c.kind === "toggle") return value ? c.yes : c.no;
  return c.phrase(Number(value));
}

/** The on-screen value for a slider. */
export function format(c, value) {
  return c.format ? c.format(Number(value)) : String(value);
}

/** The question actually sent: the preset plus one "My situation:" sentence. */
export function compose(situation, values) {
  const parts = situation.context.map((c) => phrase(c, values[c.id]));
  return `${situation.q} My situation: ${parts.join("; ")}.`;
}

/** Every combination of picks (sliders at min, default and max) — for the offline check. */
export function combinations(situation) {
  let combos = [{}];
  for (const c of situation.context) {
    const values =
      c.kind === "choice" ? c.options.map((o) => o.value) : c.kind === "toggle" ? [false, true] : [c.min, c.default, c.max];
    combos = combos.flatMap((base) => values.map((v) => ({ ...base, [c.id]: v })));
  }
  return combos;
}
