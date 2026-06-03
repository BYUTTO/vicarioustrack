import { STSS_TOTAL_BANDS, PROQOL5_BANDS } from './instruments';

export interface CheckInSnapshot {
  date: string;          // ISO date of the weekly check-in
  cs: number;            // ProQOL Compassion Satisfaction raw (10–50)
  bo: number;            // ProQOL Burnout raw (10–50)
  sts: number;           // ProQOL Secondary Traumatic Stress raw (10–50)
  stssTotal: number;     // STSS total (17–85)
  intrusion: number;
  avoidance: number;
  arousal: number;
}

export interface Clinician {
  id: string;
  name: string;
  role: string;
  avatar: string;
  caseloadNote: string;  // context (e.g. % sexual-abuse caseload — the paper's risk factor)
  history: CheckInSnapshot[]; // oldest → newest
  missedWeeks: number;   // consecutive missed check-ins (engagement risk)
}

function weeksAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString().slice(0, 10);
}

function snap(week: number, cs: number, bo: number, sts: number, intrusion: number, avoidance: number, arousal: number): CheckInSnapshot {
  return { date: weeksAgo(week), cs, bo, sts, stssTotal: intrusion + avoidance + arousal, intrusion, avoidance, arousal };
}

export const CLINICIANS: Clinician[] = [
  {
    // THE WOW CASE: steady deterioration into Severe STS over 8 weeks.
    id: 'c1',
    name: 'Dr. Sarah Chen',
    role: 'Trauma Therapist',
    avatar: 'SC',
    caseloadNote: '84% child sexual-abuse caseload',
    missedWeeks: 0,
    history: [
      snap(7, 40, 24, 26, 8, 12, 8),   // baseline — healthy-ish
      snap(6, 38, 27, 29, 9, 13, 9),
      snap(5, 36, 31, 33, 11, 15, 10),
      snap(4, 33, 34, 37, 12, 17, 12),
      snap(3, 30, 38, 41, 14, 19, 13),  // STSS total 46 → High
      snap(2, 27, 41, 44, 15, 21, 14),
      snap(1, 24, 44, 47, 17, 22, 15),  // STSS total 54 → Severe
      snap(0, 22, 46, 49, 18, 23, 16),  // STSS total 57 → Severe; CS Low, BO High, STS High
    ],
  },
  {
    // Healthy & stable
    id: 'c2',
    name: 'Marcus Webb',
    role: 'Clinical Social Worker',
    avatar: 'MW',
    caseloadNote: '40% trauma caseload',
    missedWeeks: 0,
    history: [
      snap(7, 44, 18, 19, 6, 9, 6),
      snap(6, 45, 17, 18, 5, 9, 6),
      snap(5, 43, 19, 20, 6, 10, 6),
      snap(4, 44, 18, 19, 6, 9, 7),
      snap(3, 46, 16, 18, 5, 8, 5),
      snap(2, 45, 17, 19, 6, 9, 6),
      snap(1, 44, 18, 20, 6, 10, 6),
      snap(0, 45, 17, 18, 5, 9, 6),
    ],
  },
  {
    // Watch case: recently crossed into Moderate STS
    id: 'c3',
    name: 'Elena Rodriguez',
    role: 'Trauma Therapist',
    avatar: 'ER',
    caseloadNote: '67% domestic-violence caseload',
    missedWeeks: 0,
    history: [
      snap(7, 41, 22, 24, 7, 11, 7),
      snap(6, 40, 23, 26, 8, 12, 8),
      snap(5, 39, 25, 28, 9, 12, 8),
      snap(4, 38, 26, 30, 9, 13, 9),
      snap(3, 37, 27, 31, 10, 13, 9),
      snap(2, 36, 28, 33, 10, 14, 10),
      snap(1, 35, 29, 34, 11, 14, 10),
      snap(0, 35, 30, 36, 12, 15, 11),  // STSS total 38 → Moderate (just crossed clinical threshold)
    ],
  },
  {
    // Engagement risk: looked fine, but stopped checking in
    id: 'c4',
    name: 'James Okafor',
    role: 'Clinical Counselor',
    avatar: 'JO',
    caseloadNote: '55% trauma caseload',
    missedWeeks: 3,
    history: [
      snap(7, 42, 21, 22, 7, 10, 7),
      snap(6, 41, 22, 23, 7, 11, 7),
      snap(5, 40, 23, 25, 8, 11, 8),
      snap(4, 39, 25, 27, 9, 12, 8),
      // missed weeks 3, 2, 1, 0 — last check-in was 4 weeks ago
    ],
  },
];

// ─── Interpretation helpers ───
export function proqolBand(raw: number): string {
  return PROQOL5_BANDS.find(b => raw >= b.min && raw <= b.max)!.label;
}
export function stssSeverity(total: number): string {
  return STSS_TOTAL_BANDS.find(b => total >= b.min && total <= b.max)!.label;
}

export type AlertLevel = 'urgent' | 'attention' | 'ok';

export function clinicianAlertLevel(c: Clinician): AlertLevel {
  if (c.missedWeeks >= 3) return 'attention';
  const latest = c.history[c.history.length - 1];
  if (!latest) return 'attention';
  if (latest.stssTotal >= 44 || latest.bo >= 42 || latest.sts >= 42) return 'urgent';
  if (latest.stssTotal >= 38 || latest.cs <= 22) return 'attention';
  return 'ok';
}

export interface SupervisionPrompt {
  level: AlertLevel;
  trigger: string;   // what crossed
  prompt: string;    // suggested supervision action
}

// Rule-based supervision agenda prompts, mapped to which instrument/subscale crossed.
export function supervisionPrompts(latest: CheckInSnapshot, missedWeeks: number): SupervisionPrompt[] {
  const out: SupervisionPrompt[] = [];

  if (missedWeeks >= 3) {
    out.push({ level: 'attention', trigger: `${missedWeeks} consecutive missed check-ins`, prompt: 'Re-engage directly. Non-response can itself signal distress or disengagement — schedule a brief individual check-in and re-establish the weekly cadence.' });
  }

  if (latest.stssTotal >= 49) {
    out.push({ level: 'urgent', trigger: `STSS total ${latest.stssTotal} — Severe`, prompt: 'Schedule individual supervision within 48 hours. Review current trauma caseload and consider temporary caseload rebalancing or a brief protected period. Assess for need of EAP / external clinical support.' });
  } else if (latest.stssTotal >= 44) {
    out.push({ level: 'urgent', trigger: `STSS total ${latest.stssTotal} — High`, prompt: 'Prioritize this clinician in the next supervision session. Review the specific cases driving secondary stress and current coping strategies.' });
  } else if (latest.stssTotal >= 38) {
    out.push({ level: 'attention', trigger: `STSS total ${latest.stssTotal} — clinically meaningful`, prompt: 'Add to the supervision agenda. Total ≥ 38 is associated with clinically meaningful secondary traumatic stress; check in on symptom trajectory.' });
  }

  if (latest.intrusion >= 15) {
    out.push({ level: 'attention', trigger: `Elevated Intrusion subscale (${latest.intrusion})`, prompt: 'Intrusion symptoms present (re-experiencing, disturbing dreams). Assess for nightmares/flashbacks and consider a trauma-focused consultation or referral.' });
  }
  if (latest.arousal >= 13) {
    out.push({ level: 'attention', trigger: `Elevated Arousal subscale (${latest.arousal})`, prompt: 'Arousal symptoms present (sleep, concentration, irritability). Review sleep hygiene and workload pacing.' });
  }

  if (latest.bo >= 42) {
    out.push({ level: 'urgent', trigger: `ProQOL Burnout ${latest.bo} — High`, prompt: 'Explore workload, autonomy, and systemic frustrations. Review PTO usage and protected administrative time.' });
  }
  if (latest.cs <= 22) {
    out.push({ level: 'attention', trigger: `ProQOL Compassion Satisfaction ${latest.cs} — Low`, prompt: 'Reconnect the clinician to meaningful wins and professional-development goals; low compassion satisfaction compounds fatigue.' });
  }

  return out;
}
