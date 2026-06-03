'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CLINICIANS, clinicianAlertLevel, supervisionPrompts, stssSeverity, proqolBand, type Clinician, type AlertLevel } from '@/lib/demo-data';
import { STSS_CLINICAL_THRESHOLD } from '@/lib/instruments';
import { Sparkline } from '@/components/Sparkline';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ChevronLeft, AlertTriangle, AlertCircle, CheckCircle, X, CalendarX } from 'lucide-react';

const ALERT_CFG: Record<AlertLevel, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  attention: { label: 'Needs attention', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  ok: { label: 'Stable', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

const SEV_COLOR: Record<string, string> = {
  'Severe': 'text-red-700', 'High': 'text-red-600', 'Moderate': 'text-amber-600', 'Mild': 'text-slate-600', 'Little / none': 'text-emerald-600',
};

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>('c1');

  const rows = CLINICIANS.map(c => ({ c, alert: clinicianAlertLevel(c), latest: c.history[c.history.length - 1] }));
  const urgent = rows.filter(r => r.alert === 'urgent').length;
  const attention = rows.filter(r => r.alert === 'attention').length;
  const selected = selectedId ? CLINICIANS.find(c => c.id === selectedId) ?? null : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <HeartPulse className="h-4 w-4 text-rose-500" />
        <span className="font-semibold text-sm">VicariousTrack</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-500">Supervisor Dashboard</span>
        <span className="ml-auto text-xs text-slate-400">Cedar Valley Child Advocacy Center · Wk of {CLINICIANS[0].history.at(-1)?.date}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Roster */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Urgent" value={urgent} color="text-red-600" />
            <Stat label="Needs attention" value={attention} color="text-amber-600" />
            <Stat label="Clinicians" value={CLINICIANS.length} color="text-slate-900" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm text-slate-900">Clinical Team — Weekly STSS Trend</h2></div>
            <div className="divide-y">
              {rows.map(({ c, alert, latest }) => {
                const cfg = ALERT_CFG[alert];
                const stssSeries = c.history.map(h => h.stssTotal);
                return (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedId === c.id ? 'bg-slate-50' : ''}`}>
                    <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700 shrink-0">{c.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 truncate">{c.role} · {c.caseloadNote}</div>
                    </div>
                    {c.missedWeeks >= 3 ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 shrink-0"><CalendarX className="h-3.5 w-3.5" />{c.missedWeeks}w missed</div>
                    ) : (
                      <div className="shrink-0 flex flex-col items-end gap-0.5">
                        <Sparkline values={stssSeries} min={17} max={70} threshold={STSS_CLINICAL_THRESHOLD} />
                        <span className={`text-xs font-medium ${SEV_COLOR[stssSeverity(latest.stssTotal)]}`}>STSS {latest.stssTotal} · {stssSeverity(latest.stssTotal)}</span>
                      </div>
                    )}
                    <Badge variant="outline" className={`text-xs flex items-center gap-1 shrink-0 ${cfg.color}`}>{cfg.icon}{cfg.label}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-slate-400">Dashed line = STSS clinical threshold (total ≥ 38). Red dot = latest score at or above it.</p>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? <ClinicianDetail clinician={selected} onClose={() => setSelectedId(null)} /> : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">Select a clinician to see their trend and supervision prompts.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ClinicianDetail({ clinician: c, onClose }: { clinician: Clinician; onClose: () => void }) {
  const latest = c.history[c.history.length - 1];
  const prompts = latest ? supervisionPrompts(latest, c.missedWeeks) : [];
  const csSeries = c.history.map(h => h.cs);
  const boSeries = c.history.map(h => h.bo);
  const stsSeries = c.history.map(h => h.sts);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-700">{c.avatar}</div>
          <div>
            <h2 className="font-semibold text-slate-900">{c.name}</h2>
            <p className="text-xs text-slate-500">{c.role} · {c.caseloadNote}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>

      {c.missedWeeks >= 3 ? (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4 text-sm text-amber-800">
          Last check-in was {c.missedWeeks} weeks ago. No current scores — see prompt below.
        </div>
      ) : (
        <>
          {/* Latest ProQOL bands */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <BandCard label="Comp. Satisfaction" raw={latest.cs} band={proqolBand(latest.cs)} good="high" series={csSeries} />
            <BandCard label="Burnout" raw={latest.bo} band={proqolBand(latest.bo)} good="low" series={boSeries} />
            <BandCard label="Sec. Trauma Stress" raw={latest.sts} band={proqolBand(latest.sts)} good="low" series={stsSeries} />
          </div>
          <div className="rounded-lg bg-slate-50 p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">STSS total (Bride)</span>
              <span className={`font-semibold ${SEV_COLOR[stssSeverity(latest.stssTotal)]}`}>{latest.stssTotal} · {stssSeverity(latest.stssTotal)}</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>Intrusion {latest.intrusion}</span><span>Avoidance {latest.avoidance}</span><span>Arousal {latest.arousal}</span>
            </div>
          </div>
        </>
      )}

      {/* Supervision prompts */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Suggested supervision agenda</h3>
        {prompts.length === 0 ? (
          <p className="text-sm text-emerald-600 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />No thresholds crossed. Maintain routine supervision.</p>
        ) : (
          <div className="space-y-2">
            {prompts.map((p, i) => (
              <div key={i} className={`rounded-lg border p-3 ${p.level === 'urgent' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {p.level === 'urgent' ? <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                  <span className={`text-xs font-semibold ${p.level === 'urgent' ? 'text-red-700' : 'text-amber-700'}`}>{p.trigger}</span>
                </div>
                <p className="text-sm text-slate-700">{p.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BandCard({ label, raw, band, good, series }: { label: string; raw: number; band: string; good: 'high' | 'low'; series: number[] }) {
  // Color the band: for "good=high" subscales (CompSat), High is good; for "good=low" (Burnout/STS), High is bad.
  const bad = good === 'high' ? band === 'Low' : band === 'High';
  const ok = good === 'high' ? band === 'High' : band === 'Low';
  const color = bad ? '#dc2626' : ok ? '#059669' : '#d97706';
  return (
    <div className="rounded-lg border border-slate-100 p-2">
      <p className="text-[10px] text-slate-500 leading-tight mb-1">{label}</p>
      <Sparkline values={series} min={10} max={50} color={color} width={72} height={24} />
      <p className="text-xs font-semibold mt-1" style={{ color }}>{raw} · {band}</p>
    </div>
  );
}
