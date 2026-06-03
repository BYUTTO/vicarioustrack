// ============================================================
// instruments.ts — ProQOL-5 + STSS validated instrument data
// ProQOL-5 © B. Hudnall Stamm 2009 — free to use with attribution, items unaltered, not for sale.
// STSS © 1999 Brian E. Bride — used here for demonstration; a commercial product must obtain
//   written permission from Bride. Flagged intentionally; do not ship commercially without it.
// Items, subscales, reverse-scoring, and cutoff bands are reproduced verbatim from the
// official Stamm (2009/2010) ProQOL manual and Bride et al. (2004) / Bride (2007).
// ============================================================

export type SubscaleId =
  | 'compassion_satisfaction' | 'burnout' | 'secondary_traumatic_stress' // ProQOL
  | 'intrusion' | 'avoidance' | 'arousal';                               // STSS

export interface LikertAnchor { value: number; label: string }
export interface InstrumentItem {
  number: number;
  text: string;
  subscale: SubscaleId;
  reverseScored: boolean;
}
export interface ScoreBand { min: number; max: number; label: string }
export interface Subscale { id: SubscaleId; label: string; items: number[] }
export interface Instrument {
  id: string;
  name: string;
  shortName: string;
  timeframe: string;
  anchors: LikertAnchor[];
  items: InstrumentItem[];
  subscales: Subscale[];
  reverseScoredItems: number[];
}

// Render bracket placeholders ([help]/[helper]/[helping]/[work]) for a given profession.
export function renderItemText(text: string): string {
  return text
    .replace(/\[helping\]/g, 'helping')
    .replace(/\[helper\]/g, 'therapist')
    .replace(/\[help\]/g, 'help')
    .replace(/\[work\]/g, 'work');
}

// ---------------------------- ProQOL-5 ----------------------------
export const PROQOL5: Instrument = {
  id: 'proqol5',
  name: 'Professional Quality of Life Scale, Version 5 (ProQOL-5)',
  shortName: 'ProQOL-5',
  timeframe: 'last 30 days',
  anchors: [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Sometimes' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Very Often' },
  ],
  reverseScoredItems: [1, 4, 15, 17, 29],
  subscales: [
    { id: 'compassion_satisfaction', label: 'Compassion Satisfaction', items: [3, 6, 12, 16, 18, 20, 22, 24, 27, 30] },
    { id: 'burnout', label: 'Burnout', items: [1, 4, 8, 10, 15, 17, 19, 21, 26, 29] },
    { id: 'secondary_traumatic_stress', label: 'Secondary Traumatic Stress', items: [2, 5, 7, 9, 11, 13, 14, 23, 25, 28] },
  ],
  items: [
    { number: 1, text: 'I am happy.', subscale: 'burnout', reverseScored: true },
    { number: 2, text: 'I am preoccupied with more than one person I [help].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 3, text: 'I get satisfaction from being able to [help] people.', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 4, text: 'I feel connected to others.', subscale: 'burnout', reverseScored: true },
    { number: 5, text: 'I jump or am startled by unexpected sounds.', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 6, text: 'I feel invigorated after working with those I [help].', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 7, text: 'I find it difficult to separate my personal life from my life as a [helper].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 8, text: 'I am not as productive at work because I am losing sleep over traumatic experiences of a person I [help].', subscale: 'burnout', reverseScored: false },
    { number: 9, text: 'I think that I might have been affected by the traumatic stress of those I [help].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 10, text: 'I feel trapped by my job as a [helper].', subscale: 'burnout', reverseScored: false },
    { number: 11, text: 'Because of my [helping], I have felt "on edge" about various things.', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 12, text: 'I like my work as a [helper].', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 13, text: 'I feel depressed because of the traumatic experiences of the people I [help].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 14, text: 'I feel as though I am experiencing the trauma of someone I have [helped].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 15, text: 'I have beliefs that sustain me.', subscale: 'burnout', reverseScored: true },
    { number: 16, text: 'I am pleased with how I am able to keep up with [helping] techniques and protocols.', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 17, text: 'I am the person I always wanted to be.', subscale: 'burnout', reverseScored: true },
    { number: 18, text: 'My work makes me feel satisfied.', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 19, text: 'I feel worn out because of my work as a [helper].', subscale: 'burnout', reverseScored: false },
    { number: 20, text: 'I have happy thoughts and feelings about those I [help] and how I could help them.', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 21, text: 'I feel overwhelmed because my case [work] load seems endless.', subscale: 'burnout', reverseScored: false },
    { number: 22, text: 'I believe I can make a difference through my work.', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 23, text: 'I avoid certain activities or situations because they remind me of frightening experiences of the people I [help].', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 24, text: 'I am proud of what I can do to [help].', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 25, text: 'As a result of my [helping], I have intrusive, frightening thoughts.', subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 26, text: 'I feel "bogged down" by the system.', subscale: 'burnout', reverseScored: false },
    { number: 27, text: 'I have thoughts that I am a "success" as a [helper].', subscale: 'compassion_satisfaction', reverseScored: false },
    { number: 28, text: "I can't recall important parts of my work with trauma victims.", subscale: 'secondary_traumatic_stress', reverseScored: false },
    { number: 29, text: 'I am a very caring person.', subscale: 'burnout', reverseScored: true },
    { number: 30, text: 'I am happy that I chose to do this work.', subscale: 'compassion_satisfaction', reverseScored: false },
  ],
};

// ProQOL: same raw bands for all three subscales (Stamm: ≤22 low, 23–41 moderate, ≥42 high).
export const PROQOL5_BANDS: ScoreBand[] = [
  { min: 10, max: 22, label: 'Low' },
  { min: 23, max: 41, label: 'Moderate' },
  { min: 42, max: 50, label: 'High' },
];

const reverseProqol = (raw: number) => 6 - raw;

export function scoreProqolSubscale(responses: Record<number, number>, subscale: SubscaleId): { raw: number; band: string } {
  const items = PROQOL5.subscales.find(s => s.id === subscale)!.items;
  const raw = items.reduce((sum, n) => sum + (PROQOL5.reverseScoredItems.includes(n) ? reverseProqol(responses[n]) : responses[n]), 0);
  const band = PROQOL5_BANDS.find(b => raw >= b.min && raw <= b.max)!.label;
  return { raw, band };
}

// ------------------------------ STSS ------------------------------
export const STSS: Instrument = {
  id: 'stss',
  name: 'Secondary Traumatic Stress Scale (Bride et al., 2004)',
  shortName: 'STSS',
  timeframe: 'past 7 days',
  anchors: [
    { value: 1, label: 'Never' },
    { value: 2, label: 'Rarely' },
    { value: 3, label: 'Occasionally' },
    { value: 4, label: 'Often' },
    { value: 5, label: 'Very Often' },
  ],
  reverseScoredItems: [],
  subscales: [
    { id: 'intrusion', label: 'Intrusion', items: [2, 3, 6, 10, 13] },
    { id: 'avoidance', label: 'Avoidance', items: [1, 5, 7, 9, 12, 14, 17] },
    { id: 'arousal', label: 'Arousal', items: [4, 8, 11, 15, 16] },
  ],
  items: [
    { number: 1, text: 'I felt emotionally numb.', subscale: 'avoidance', reverseScored: false },
    { number: 2, text: 'My heart started pounding when I thought about my work with clients.', subscale: 'intrusion', reverseScored: false },
    { number: 3, text: 'It seemed as if I was reliving the trauma(s) experienced by my client(s).', subscale: 'intrusion', reverseScored: false },
    { number: 4, text: 'I had trouble sleeping.', subscale: 'arousal', reverseScored: false },
    { number: 5, text: 'I felt discouraged about the future.', subscale: 'avoidance', reverseScored: false },
    { number: 6, text: 'Reminders of my work with clients upset me.', subscale: 'intrusion', reverseScored: false },
    { number: 7, text: 'I had little interest in being around others.', subscale: 'avoidance', reverseScored: false },
    { number: 8, text: 'I felt jumpy.', subscale: 'arousal', reverseScored: false },
    { number: 9, text: 'I was less active than usual.', subscale: 'avoidance', reverseScored: false },
    { number: 10, text: "I thought about my work with clients when I didn't intend to.", subscale: 'intrusion', reverseScored: false },
    { number: 11, text: 'I had trouble concentrating.', subscale: 'arousal', reverseScored: false },
    { number: 12, text: 'I avoided people, places, or things that reminded me of my work with clients.', subscale: 'avoidance', reverseScored: false },
    { number: 13, text: 'I had disturbing dreams about my work with clients.', subscale: 'intrusion', reverseScored: false },
    { number: 14, text: 'I wanted to avoid working with some clients.', subscale: 'avoidance', reverseScored: false },
    { number: 15, text: 'I was easily annoyed.', subscale: 'arousal', reverseScored: false },
    { number: 16, text: 'I expected something bad to happen.', subscale: 'arousal', reverseScored: false },
    { number: 17, text: 'I noticed gaps in my memory about client sessions.', subscale: 'avoidance', reverseScored: false },
  ],
};

// STSS total-score severity (Bride 2007). 49+ = severe. ≥38 is clinically meaningful.
export const STSS_TOTAL_BANDS: ScoreBand[] = [
  { min: 17, max: 27, label: 'Little / none' },
  { min: 28, max: 37, label: 'Mild' },
  { min: 38, max: 43, label: 'Moderate' },
  { min: 44, max: 48, label: 'High' },
  { min: 49, max: 85, label: 'Severe' },
];

export const STSS_CLINICAL_THRESHOLD = 38; // total ≥ 38 is clinically meaningful

export function scoreStss(responses: Record<number, number>): { total: number; severity: string; intrusion: number; avoidance: number; arousal: number } {
  const sub = (id: SubscaleId) => STSS.subscales.find(s => s.id === id)!.items.reduce((t, n) => t + responses[n], 0);
  const total = STSS.items.reduce((t, i) => t + responses[i.number], 0);
  const severity = STSS_TOTAL_BANDS.find(b => total >= b.min && total <= b.max)!.label;
  return { total, severity, intrusion: sub('intrusion'), avoidance: sub('avoidance'), arousal: sub('arousal') };
}
