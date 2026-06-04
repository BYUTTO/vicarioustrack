'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clinicianAlertLevel, supervisionPrompts, stssSeverity, proqolBand, type Clinician, type AlertLevel } from '@/lib/demo-data';
import { useClinicians, todayISO } from '@/lib/store';
import { STSS_CLINICAL_THRESHOLD } from '@/lib/instruments';
import { Sparkline } from '@/components/Sparkline';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ChevronLeft, AlertTriangle, AlertCircle, CheckCircle, X, CalendarX, RotateCcw, Sparkles } from 'lucide-react';

const ALERT_CFG: Record<AlertLevel, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: 'Urgent', color: 'bg-failbg text-fail border-fail/30', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  attention: { label: 'Needs attention', color: 'bg-warnbg text-warn border-warn/30', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  ok: { label: 'Stable', color: 'bg-passbg text-pass border-pass/30', icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

const SEV_COLOR: Record<string, string> = {
  'Severe': 'text-fail', 'High': 'text-fail', 'Moderate': 'text-warn', 'Mild': 'text-inkmute', 'Little / none': 'text-pass',
};

export default function DashboardPage() {
  const { clinicians, reset } = useClinicians();
  const [selectedId, setSelectedId] = useState<string | null>('c1');
  const [updatedId, setUpdatedId] = useState<string | null>(null);

  // Honor /dashboard?updated=<id> from a just-submitted check-in: select + highlight it.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('updated');
    if (id) { setSelectedId(id); setUpdatedId(id); }
  }, []);

  const today = todayISO();
  const rows = clinicians.map(c => ({ c, alert: clinicianAlertLevel(c), latest: c.history[c.history.length - 1] }));
  const urgent = rows.filter(r => r.alert === 'urgent').length;
  const attention = rows.filter(r => r.alert === 'attention').length;
  const selected = selectedId ? clinicians.find(c => c.id === selectedId) ?? null : null;

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <HeartPulse className="h-4 w-4 text-accent" />
        <span className="font-display font-medium text-base tracking-tight">VicariousTrack</span>
        <span className="text-inkfaint">/</span>
        <span className="text-sm text-inkmute">Supervisor Dashboard</span>
        <button onClick={reset} className="ml-auto flex items-center gap-1.5 text-xs text-inkfaint hover:text-ink transition-colors" title="Reset demo data">
          <RotateCcw className="h-3.5 w-3.5" /> Reset demo
        </button>
        <span className="text-xs text-inkfaint">Cedar Valley CAC</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Roster */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Urgent" value={urgent} color="text-fail" />
            <Stat label="Needs attention" value={attention} color="text-warn" />
            <Stat label="Clinicians" value={clinicians.length} color="text-ink" />
          </div>

          <div className="bg-card rounded-xl border border-line overflow-hidden">
            <div className="px-5 py-3 border-b"><h2 className="font-semibold text-sm text-ink">Clinical Team — Weekly STSS Trend</h2></div>
            <div className="divide-y">
              {rows.map(({ c, alert, latest }) => {
                const cfg = ALERT_CFG[alert];
                const stssSeries = c.history.map(h => h.stssTotal);
                return (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left px-5 py-3.5 hover:bg-paper transition-colors flex items-center gap-3 ${selectedId === c.id ? 'bg-paper' : ''}`}>
                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">{c.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-ink">{c.name}</span>
                        {updatedId === c.id && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-accent bg-accent/10 rounded px-1 py-0.5"><Sparkles className="h-2.5 w-2.5" />just updated</span>}
                        {updatedId !== c.id && latest?.date === today && <span className="text-[10px] text-pass">✓ this week</span>}
                      </div>
                      <div className="text-xs text-inkmute truncate">{c.role} · {c.caseloadNote}</div>
                    </div>
                    {c.missedWeeks >= 3 ? (
                      <div className="flex items-center gap-1.5 text-xs text-warn shrink-0"><CalendarX className="h-3.5 w-3.5" />{c.missedWeeks}w missed</div>
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
          <p className="text-xs text-inkfaint">Dashed line = STSS clinical threshold (total ≥ 38). Red dot = latest score at or above it.</p>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? <ClinicianDetail clinician={selected} onClose={() => setSelectedId(null)} /> : (
            <div className="bg-card rounded-xl border border-dashed border-line p-8 text-center text-sm text-inkfaint">Select a clinician to see their trend and supervision prompts.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-line p-3">
      <p className="text-xs text-inkmute mb-0.5">{label}</p>
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
    <div className="bg-card rounded-xl border border-line p-5 sticky top-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">{c.avatar}</div>
          <div>
            <h2 className="font-semibold text-ink">{c.name}</h2>
            <p className="text-xs text-inkmute">{c.role} · {c.caseloadNote}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-inkfaint hover:text-ink"><X className="h-4 w-4" /></button>
      </div>

      {c.missedWeeks >= 3 ? (
        <div className="rounded-lg bg-warnbg border border-warn/30 p-3 mb-4 text-sm text-warn">
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
          <div className="rounded-lg bg-paper p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-inkmute">STSS total (Bride)</span>
              <span className={`font-semibold ${SEV_COLOR[stssSeverity(latest.stssTotal)]}`}>{latest.stssTotal} · {stssSeverity(latest.stssTotal)}</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-inkmute">
              <span>Intrusion {latest.intrusion}</span><span>Avoidance {latest.avoidance}</span><span>Arousal {latest.arousal}</span>
            </div>
          </div>
        </>
      )}

      {/* Supervision prompts */}
      <div>
        <h3 className="text-xs font-semibold text-inkmute uppercase tracking-wide mb-2">Suggested supervision agenda</h3>
        {prompts.length === 0 ? (
          <p className="text-sm text-pass flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />No thresholds crossed. Maintain routine supervision.</p>
        ) : (
          <div className="space-y-2">
            {prompts.map((p, i) => (
              <div key={i} className={`rounded-lg border p-3 ${p.level === 'urgent' ? 'border-fail/30 bg-failbg' : 'border-warn/30 bg-warnbg'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {p.level === 'urgent' ? <AlertTriangle className="h-3.5 w-3.5 text-fail" /> : <AlertCircle className="h-3.5 w-3.5 text-warn" />}
                  <span className={`text-xs font-semibold ${p.level === 'urgent' ? 'text-fail' : 'text-warn'}`}>{p.trigger}</span>
                </div>
                <p className="text-sm text-inkmute">{p.prompt}</p>
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
  const color = bad ? '#B05A55' : ok ? '#4E8163' : '#B08537';
  return (
    <div className="rounded-lg border border-line p-2">
      <p className="text-[10px] text-inkmute leading-tight mb-1">{label}</p>
      <Sparkline values={series} min={10} max={50} color={color} width={72} height={24} />
      <p className="text-xs font-semibold mt-1" style={{ color }}>{raw} · {band}</p>
    </div>
  );
}
