// The policies Standing reads, grouped into the life areas a question is routed to.
// `npm run ingest` ingests exactly this list; data/docs.json carries area, name, label and summary.
// summary = one line the router reads to pick an area; name = the short label the UI shows.

export const AREAS = [
  { id: 'records', name: 'Records & privacy', blurb: 'Who can see your grades, records and email', icon: 'lock' },
  { id: 'conduct', name: 'Conduct, integrity & grievances', blurb: 'Notices, hearings, cheating, complaints', icon: 'scale' },
  { id: 'academics', name: 'Grades & academic standing', blurb: 'Grades, appeals, drops, retakes, probation', icon: 'cap' },
  { id: 'speech', name: 'Speech, events & organizations', blurb: 'Protests, events, alcohol, student orgs', icon: 'megaphone' },
  { id: 'safety', name: 'Safety, discrimination & accommodations', blurb: 'Harassment, disability access, emergencies', icon: 'shield' },
  { id: 'money', name: 'Money, parking & campus life', blurb: 'Refunds, billing holds, parking, scooters', icon: 'wallet' },
];

const ppm = (id, area, name, summary, extra = {}) => ({ id, source: 'ppm', ppm: extra.ppm ?? id, label: extra.label ?? `PPM ${id}`, area, name, summary });
const senate = (n, area, name, summary) => ({ id: `SR-${n}`, source: 'senate', label: `Senate Regulation ${n}`,
  url: `https://senate.ucsd.edu/Operating-Procedures/Senate-Manual/Regulations/${n}`, area, name, summary });

export const DOCS = [
  // Records & privacy
  ppm('160-2', 'records', 'Student records & privacy', 'FERPA at UCSD: directory information, who may see or receive student records and grades, parents, written consent, subpoenas, holds on disclosure'),
  ppm('480-3', 'records', 'Records about individuals', 'How offices must handle records containing information about individuals: access, accuracy, retention, disclosure limits'),
  ppm('135-5', 'records', 'Electronic communications privacy', 'Privacy of UCSD email, network and computer accounts; when the university may read, monitor or disclose electronic communications'),
  ppm('160-3', 'records', 'Official email', 'UCSD may send official notices to student email; students are responsible for reading it; forwarding and delivery rules'),
  ppm('135-9', 'records', 'IT acceptable use', 'Acceptable use of UCSD computers, networks and accounts: prohibited activities, sharing passwords, copyright, consequences'),
  // Conduct, integrity & grievances
  ppm('160-10', 'conduct', 'Student conduct procedures', 'Student conduct process: notice of alleged violation, meetings, hearings, evidence, sanctions, interim measures, appeals, records'),
  ppm('160-11', 'conduct', 'Student grievances', 'How a student files a grievance against a university office or employee, confidentiality, retaliation, timelines'),
  { id: 'SR-APPX2', source: 'senate', label: 'Senate Appendix 2', url: 'https://senate.ucsd.edu/operating-procedures/senate-manual/appendices/2/', area: 'conduct', name: 'Academic integrity policy',
    summary: 'Policy on Integrity of Scholarship: cheating and plagiarism, how allegations are reported, the review process, sanctions, appeals, records' },
  ppm('200-28', 'conduct', 'Hazing prevention', 'Interim hazing prevention procedures: definition of hazing, reporting, investigation, consequences for students and organizations'),
  ppm('270-8', 'conduct', 'Substance abuse', 'University policy on alcohol and drug abuse: prohibited conduct, sanctions, help and treatment resources'),
  // Grades & academic standing
  senate('500', 'academics', 'Grading policy', 'Grades and grade points, incomplete (I) grades, in-progress, pass/no pass, grade changes, GPA, satisfactory/unsatisfactory'),
  senate('501', 'academics', 'Adding, dropping & withdrawing', 'Deadlines and rules for adding and dropping courses, withdrawal from a quarter, W grades'),
  senate('502', 'academics', 'Grade appeals', 'Appealing a grade when non-academic criteria were used: talking to the instructor, department chair, committee, timelines, confidentiality'),
  senate('505', 'academics', 'Repeating courses', 'Repeating a course: which grades may be repeated, how many units, how the GPA is recalculated'),
  senate('515', 'academics', 'Academic probation & progress', 'Progress toward degrees, academic probation, subject to disqualification, dismissal and readmission'),
  senate('516', 'academics', 'Minimum progress', 'Minimum progress requirement: units required per quarter, deficits, consequences'),
  senate('600', 'academics', 'Graduation requirements', 'Campuswide undergraduate graduation requirements: units, residence, GPA, American history and institutions, entry-level writing, DEI'),
  ppm('120-9', 'academics', 'Course materials fees', 'When a course may charge a materials fee, what it can cover, approval and refunds'),
  ppm('100-4', 'academics', 'Research misconduct', 'Fabrication, falsification and plagiarism in research: allegations, inquiry, investigation, findings and appeals'),
  // Speech, events & organizations
  ppm('510-1-IX', 'speech', 'Protests & expressive activity', 'Expressive Activity Time, Place and Manner Policy: protests, demonstrations, amplified sound, encampments, masks, where and when speech is allowed on campus', { ppm: '510-1 Section IX', label: 'PPM 510-1 §IX' }),
  ppm('510-1-VA', 'speech', 'Major events on campus', 'Policy on Major Events: hosting large events, security costs, approvals, timelines, outside speakers', { ppm: '510-1 Section V.A', label: 'PPM 510-1 §V.A' }),
  ppm('510-1-XIII', 'speech', 'Alcohol at events', 'Alcohol policy: alcohol at campus events, permits, who may serve, student events, residential areas', { ppm: '510-1 Section XIII', label: 'PPM 510-1 §XIII' }),
  ppm('160-8', 'speech', 'Student governments', 'Which student governments UCSD officially recognizes and their authority'),
  ppm('160-9', 'speech', 'Student organizations', 'Registering a student organization, eligibility, privileges, use of the university name, discipline of organizations'),
  ppm('510-10', 'speech', 'University name & logos', 'Use of the UC San Diego name, seals and trademarks by students, organizations and outside parties'),
  // Safety, discrimination & accommodations
  ppm('200-19', 'safety', 'Sexual violence & harassment', 'Reporting and responding to sexual violence and sexual harassment: reporting options, Title IX office, supportive measures, confidentiality'),
  ppm('200-23', 'safety', 'Discrimination complaints', 'Procedures for discrimination and harassment complaint resolution: filing, investigation, timelines, outcomes, retaliation'),
  ppm('200-9', 'safety', 'Disability access', 'Disability access guidelines: accommodations, accessible facilities, service animals, complaints'),
  ppm('230-017', 'safety', 'Faculty–student relationships', 'Romantic, dating or sexual relationships between academic appointees and undergraduate students are prohibited; reporting and consequences'),
  ppm('270-9', 'safety', 'Lactation accommodation', 'Lactation accommodation: break time and private space for students and employees who are nursing'),
  ppm('460-8', 'safety', 'Emergency notifications', 'Emergency notification policy: when and how the campus alerts students, Triton Alert, timely warnings'),
  ppm('160-6', 'safety', 'Campus response to a student death', 'Protocol for campus notification and support after a student dies'),
  ppm('200-16', 'safety', 'International student visas', 'Visa services for international students and scholars: which office handles F-1/J-1 status, responsibilities, fees'),
  // Money, parking & campus life
  ppm('300-70', 'money', 'Fee deferments, waivers & refunds', 'Student fee deferments, waivers, exemptions and refunds: refund schedule after withdrawal, who qualifies for a waiver'),
  ppm('300-29', 'money', 'Student billing & holds', 'Student billing and collection: due dates, late fees, holds on registration and transcripts, collections'),
  ppm('545-2', 'money', 'Parking permits & citations', 'Parking permits and policies: permit types, where to park, citations and appeals, towing'),
  ppm('545-5', 'money', 'License plate readers (parking)', 'Automated license plate reader use by parking services: what is collected, retention, access'),
  ppm('460-7', 'money', 'License plate readers (police)', 'Automated license plate reader use by the police department: data collection, retention, sharing, audits'),
  ppm('460-2', 'money', 'Lost & found', 'Found and unclaimed property: where lost items go, how long they are kept, how to claim'),
  ppm('270-11', 'money', 'Scooters, e-bikes & skateboards', 'Micromobility device policy: where scooters, e-bikes and skateboards may ride and park, speed limits, enforcement'),
  ppm('270-7', 'money', 'Smoking & vaping', 'Smoke and tobacco-free policy: smoking, vaping and tobacco banned on campus property, enforcement'),
  ppm('270-5', 'money', 'Dogs on campus', 'Dog control regulations: leashes, where dogs are allowed, impound'),
];

for (const d of DOCS) if (!AREAS.some((a) => a.id === d.area)) throw new Error(`catalog: unknown area ${d.area} on ${d.id}`);
