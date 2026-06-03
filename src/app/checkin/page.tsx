'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROQOL5, STSS, renderItemText, scoreProqolSubscale, scoreStss, type Instrument } from '@/lib/instruments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ChevronLeft, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

const SEV_COLOR: Record<string, string> = {
  'Severe': 'text-red-700', 'High': 'text-red-600', 'Moderate': 'text-amber-600', 'Mild': 'text-slate-600', 'Little / none': 'text-emerald-600', 'Low': 'text-emerald-600',
};

export default function CheckinPage() {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allItems = useMemo(() => [
    ...PROQOL5.items.map(i => ({ key: `proqol-${i.number}`, instrument: PROQOL5, ...i })),
    ...STSS.items.map(i => ({ key: `stss-${i.number}`, instrument: STSS, ...i })),
  ], []);

  const answered = Object.keys(responses).length;
  const total = allItems.length;
  const allAnswered = answered === total;

  const setAnswer = (key: string, value: number) => setResponses(r => ({ ...r, [key]: value }));

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
      <div className="min-h-screen bg-slate-50">
        <CheckinNav />
        <div className="max-w-xl mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3"><CheckCircle className="h-6 w-6 text-emerald-600" /></div>
            <h1 className="text-xl font-bold text-slate-900">Check-in complete</h1>
            <p className="text-sm text-slate-500 mt-1">Thanks. Your scores are recorded for this week. Here&apos;s your private summary.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="Compassion Satisfaction" raw={results.cs.raw} band={results.cs.band} />
              <ResultCard label="Burnout" raw={results.bo.raw} band={results.bo.band} />
              <ResultCard label="Sec. Traumatic Stress" raw={results.sts.raw} band={results.sts.band} />
            </div>
            <div className="rounded-lg bg-slate-50 p-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">STSS total (Bride)</span>
              <span className={`font-semibold ${SEV_COLOR[results.stss.severity]}`}>{results.stss.total} · {results.stss.severity}</span>
            </div>
          </div>

          <div className={`rounded-xl border p-4 mt-4 ${flagged ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className={`text-sm ${flagged ? 'text-amber-800' : 'text-emerald-800'}`}>
              {flagged
                ? 'One or more scores crossed a clinical threshold this week. Your supervisor will see an alert with suggested supervision prompts — this is a support signal, not a performance flag.'
                : 'No thresholds crossed this week. Your supervisor sees a stable status. Keep checking in weekly so trends stay visible.'}
            </p>
          </div>

          <div className="flex gap-3 mt-5 justify-center">
            <Link href="/dashboard"><Button className="bg-slate-900 hover:bg-slate-700 text-white gap-1.5">See the supervisor view <ArrowRight className="h-4 w-4" /></Button></Link>
            <Button variant="outline" onClick={() => { setSubmitted(false); setResponses({}); }}>Start over</Button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">ProQOL-5 is not diagnostic. Scores screen for professional quality of life; clinical interpretation belongs with a qualified supervisor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CheckinNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Weekly Check-in</h1>
          <p className="text-sm text-slate-500 mt-1">Two brief validated scales. Answer honestly for the timeframe noted — about 5 minutes.</p>
        </div>

        {/* Sticky progress + demo autofill */}
        <div className="sticky top-0 z-10 bg-slate-50 py-2 mb-4 flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${(answered / total) * 100}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{answered} of {total} answered</p>
          </div>
          <button onClick={autoFill} className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors shrink-0">
            <Sparkles className="h-3 w-3" /> Auto-fill (demo)
          </button>
        </div>

        <InstrumentSection instrument={PROQOL5} responses={responses} onAnswer={setAnswer} keyPrefix="proqol" />
        <InstrumentSection instrument={STSS} responses={responses} onAnswer={setAnswer} keyPrefix="stss" />

        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-4">
          <Button onClick={() => setSubmitted(true)} disabled={!allAnswered} className="w-full bg-rose-500 hover:bg-rose-600 text-white disabled:bg-slate-200">
            {allAnswered ? 'Submit check-in' : `Answer all ${total} items to submit (${total - answered} left)`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckinNav() {
  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center gap-3">
      <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
      <HeartPulse className="h-4 w-4 text-rose-500" />
      <span className="font-semibold text-sm">VicariousTrack</span>
      <span className="text-slate-300">/</span>
      <span className="text-sm text-slate-500">Clinician Check-in</span>
    </nav>
  );
}

function InstrumentSection({ instrument, responses, onAnswer, keyPrefix }: { instrument: Instrument; responses: Record<string, number>; onAnswer: (key: string, value: number) => void; keyPrefix: string }) {
  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="font-semibold text-slate-900">{instrument.shortName}</h2>
        <p className="text-xs text-slate-500">In the {instrument.timeframe}, how frequently was each statement true for you?</p>
      </div>
      <div className="space-y-2">
        {instrument.items.map(item => {
          const key = `${keyPrefix}-${item.number}`;
          const val = responses[key];
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-3.5">
              <p className="text-sm text-slate-800 mb-2.5">{renderItemText(item.text)}</p>
              <div className="flex gap-1.5">
                {instrument.anchors.map(a => (
                  <button
                    key={a.value}
                    onClick={() => onAnswer(key, a.value)}
                    className={`flex-1 rounded-lg border py-1.5 text-xs transition-colors ${val === a.value ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300'}`}
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
    <div className="rounded-lg border border-slate-100 p-2.5 text-center">
      <p className="text-[10px] text-slate-500 leading-tight mb-1 h-6">{label}</p>
      <p className="text-lg font-bold text-slate-900">{raw}</p>
      <Badge variant="outline" className={`text-xs mt-0.5 ${SEV_COLOR[band] ?? 'text-slate-600'}`}>{band}</Badge>
    </div>
  );
}
