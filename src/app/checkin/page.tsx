'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROQOL5, STSS, renderItemText, scoreProqolSubscale, scoreStss, type Instrument } from '@/lib/instruments';
import { useClinicians, todayISO } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ChevronLeft, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

const SEV_COLOR: Record<string, string> = {
  'Severe': 'text-fail', 'High': 'text-fail', 'Moderate': 'text-warn', 'Mild': 'text-inkmute', 'Little / none': 'text-pass', 'Low': 'text-pass',
};

export default function CheckinPage() {
  const { clinicians, submitCheckIn } = useClinicians();
  const [asId, setAsId] = useState('c2'); // default: Marcus Webb (stable → flips on the dashboard)
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const asClinician = clinicians.find(c => c.id === asId);

  const allItems = useMemo(() => [
    ...PROQOL5.items.map(i => ({ key: `proqol-${i.number}`, instrument: PROQOL5, ...i })),
    ...STSS.items.map(i => ({ key: `stss-${i.number}`, instrument: STSS, ...i })),
  ], []);

  const answered = Object.keys(responses).length;
  const total = allItems.length;
  const allAnswered = answered === total;

  const setAnswer = (key: string, value: number) => setResponses(r => ({ ...r, [key]: value }));

  const handleSubmit = () => {
    const proqolResp: Record<number, number> = {};
    PROQOL5.items.forEach(i => { proqolResp[i.number] = responses[`proqol-${i.number}`]; });
    const stssResp: Record<number, number> = {};
    STSS.items.forEach(i => { stssResp[i.number] = responses[`stss-${i.number}`]; });
    const cs = scoreProqolSubscale(proqolResp, 'compassion_satisfaction');
    const bo = scoreProqolSubscale(proqolResp, 'burnout');
    const sts = scoreProqolSubscale(proqolResp, 'secondary_traumatic_stress');
    const stss = scoreStss(stssResp);
    submitCheckIn(asId, {
      date: todayISO(),
      cs: cs.raw, bo: bo.raw, sts: sts.raw,
      stssTotal: stss.total, intrusion: stss.intrusion, avoidance: stss.avoidance, arousal: stss.arousal,
    });
    setSubmitted(true);
  };

  const autoFill = () => {
    // Demo affordance: fill plausible moderate responses so a walkthrough isn't 47 clicks.
    const filled: Record<string, number> = {};
    allItems.forEach((it, idx) => { filled[it.key] = 2 + (idx % 3); }); // varies 2–4
    setResponses(filled);
  };

  const results = useMemo(() => {
    if (!submitted) return null;
    const proqolResp: Record<number, number> = {};
    PROQOL5.items.forEach(i => { proqolResp[i.number] = responses[`proqol-${i.number}`]; });
    const stssResp: Record<number, number> = {};
    STSS.items.forEach(i => { stssResp[i.number] = responses[`stss-${i.number}`]; });
    return {
      cs: scoreProqolSubscale(proqolResp, 'compassion_satisfaction'),
      bo: scoreProqolSubscale(proqolResp, 'burnout'),
      sts: scoreProqolSubscale(proqolResp, 'secondary_traumatic_stress'),
      stss: scoreStss(stssResp),
    };
  }, [submitted, responses]);

  if (submitted && results) {
    const flagged = results.stss.total >= 38 || results.bo.band === 'High' || results.sts.band === 'High' || results.cs.band === 'Low';
    return (
      <div className="min-h-screen bg-paper">
        <CheckinNav />
        <div className="max-w-xl mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-full bg-passbg flex items-center justify-center mx-auto mb-3"><CheckCircle className="h-6 w-6 text-pass" /></div>
            <h1 className="text-xl font-bold text-ink">Check-in complete</h1>
            <p className="text-sm text-inkmute mt-1">Recorded for {asClinician?.name} this week. Here&apos;s the private summary.</p>
          </div>

          <div className="bg-card rounded-xl border border-line p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="Compassion Satisfaction" raw={results.cs.raw} band={results.cs.band} />
              <ResultCard label="Burnout" raw={results.bo.raw} band={results.bo.band} />
              <ResultCard label="Sec. Traumatic Stress" raw={results.sts.raw} band={results.sts.band} />
            </div>
            <div className="rounded-lg bg-paper p-3 flex items-center justify-between">
              <span className="text-sm text-inkmute">STSS total (Bride)</span>
              <span className={`font-semibold ${SEV_COLOR[results.stss.severity]}`}>{results.stss.total} · {results.stss.severity}</span>
            </div>
          </div>

          <div className={`rounded-xl border p-4 mt-4 ${flagged ? 'border-warn/30 bg-warnbg' : 'border-pass/30 bg-passbg'}`}>
            <p className={`text-sm ${flagged ? 'text-warn' : 'text-pass'}`}>
              {flagged
                ? 'One or more scores crossed a clinical threshold this week. Your supervisor will see an alert with suggested supervision prompts — this is a support signal, not a performance flag.'
                : 'No thresholds crossed this week. Your supervisor sees a stable status. Keep checking in weekly so trends stay visible.'}
            </p>
          </div>

          <div className="flex gap-3 mt-5 justify-center">
            <Link href={`/dashboard?updated=${asId}`}><Button className="bg-accent hover:bg-accent-hover text-accent-fg gap-1.5">See {asClinician?.name.split(' ')[0]} on the dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
            <Button variant="outline" onClick={() => { setSubmitted(false); setResponses({}); }}>Start over</Button>
          </div>
          <p className="text-xs text-inkfaint text-center mt-4">ProQOL-5 is not diagnostic. Scores screen for professional quality of life; clinical interpretation belongs with a qualified supervisor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <CheckinNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-ink">Weekly Check-in</h1>
          <p className="text-sm text-inkmute mt-1">Two brief validated scales. Answer honestly for the timeframe noted — about 5 minutes.</p>
        </div>

        {/* Demo affordance: which clinician is completing this — drives where it lands on the dashboard */}
        <div className="bg-card rounded-xl border border-line p-3.5 mb-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">{asClinician?.avatar}</div>
          <div className="flex-1">
            <label className="text-xs text-inkmute block">Completing as</label>
            <select value={asId} onChange={e => setAsId(e.target.value)} className="text-sm font-medium text-ink bg-transparent focus:outline-none">
              {clinicians.map(c => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
            </select>
          </div>
          <span className="text-xs text-inkfaint hidden sm:block">Your submission updates this clinician on the supervisor dashboard.</span>
        </div>

        {/* Sticky progress + demo autofill */}
        <div className="sticky top-0 z-10 bg-paper py-2 mb-4 flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${(answered / total) * 100}%` }} />
            </div>
            <p className="text-xs text-inkfaint mt-1">{answered} of {total} answered</p>
          </div>
          <button onClick={autoFill} className="flex items-center gap-1 text-xs text-inkfaint hover:text-accent transition-colors shrink-0">
            <Sparkles className="h-3 w-3" /> Auto-fill (demo)
          </button>
        </div>

        <InstrumentSection instrument={PROQOL5} responses={responses} onAnswer={setAnswer} keyPrefix="proqol" />
        <InstrumentSection instrument={STSS} responses={responses} onAnswer={setAnswer} keyPrefix="stss" />

        <div className="sticky bottom-0 bg-gradient-to-t from-paper via-paper to-transparent pt-6 pb-4">
          <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full bg-accent hover:bg-accent-hover text-white disabled:bg-line">
            {allAnswered ? 'Submit check-in' : `Answer all ${total} items to submit (${total - answered} left)`}
          </Button>
        </div>

        {/* Instrument attribution + licensing — shown where the scales are actually administered */}
        <div className="border-t border-line mt-2 pt-4 pb-2">
          <p className="text-xs text-inkfaint leading-relaxed">
            <span className="font-medium text-inkmute">Instrument attribution.</span>{' '}
            <span className="font-medium">ProQOL-5</span> © B. Hudnall Stamm (2009) — used with attribution; items unaltered, not for sale.{' '}
            <span className="font-medium">Secondary Traumatic Stress Scale (STSS)</span> © 1999 Brian E. Bride; from Bride, Robinson, Yegidis &amp; Figley (2004).
            The STSS is shown here for demonstration only — <span className="text-inkmute">commercial use requires written permission from the author.</span>{' '}
            Neither instrument is diagnostic.
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckinNav() {
  return (
    <nav className="border-b bg-card px-6 py-3 flex items-center gap-3">
      <Link href="/" className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
      <HeartPulse className="h-4 w-4 text-accent" />
      <span className="font-display font-medium text-base tracking-tight">VicariousTrack</span>
      <span className="text-inkfaint">/</span>
      <span className="text-sm text-inkmute">Clinician Check-in</span>
    </nav>
  );
}

function InstrumentSection({ instrument, responses, onAnswer, keyPrefix }: { instrument: Instrument; responses: Record<string, number>; onAnswer: (key: string, value: number) => void; keyPrefix: string }) {
  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="font-semibold text-ink">{instrument.shortName}</h2>
        <p className="text-xs text-inkmute">In the {instrument.timeframe}, how frequently was each statement true for you?</p>
      </div>
      <div className="space-y-2">
        {instrument.items.map(item => {
          const key = `${keyPrefix}-${item.number}`;
          const val = responses[key];
          return (
            <div key={key} className="bg-card rounded-xl border border-line p-3.5">
              <p className="text-sm text-ink mb-2.5">{renderItemText(item.text)}</p>
              <div className="flex gap-1.5">
                {instrument.anchors.map(a => (
                  <button
                    key={a.value}
                    onClick={() => onAnswer(key, a.value)}
                    className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${val === a.value ? 'bg-accent border-accent text-white' : 'bg-card border-line text-inkmute hover:border-accent'}`}
                  >
                    <span className="font-semibold block">{a.value}</span>
                    <span className="block text-[10px] leading-tight mt-0.5">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ label, raw, band }: { label: string; raw: number; band: string }) {
  return (
    <div className="rounded-lg border border-line p-2.5 text-center">
      <p className="text-[10px] text-inkmute leading-tight mb-1 h-6">{label}</p>
      <p className="text-lg font-bold text-ink">{raw}</p>
      <Badge variant="outline" className={`text-xs mt-0.5 ${SEV_COLOR[band] ?? 'text-inkmute'}`}>{band}</Badge>
    </div>
  );
}
