'use client';

import { useState, useEffect, useCallback } from 'react';
import { CLINICIANS, type Clinician, type CheckInSnapshot } from './demo-data';

const KEY = 'vicarioustrack_store_v1';

// Shared, localStorage-backed clinician store so a submitted check-in on /checkin
// shows up on /dashboard. Both pages mount this hook; they share localStorage
// (separate React trees, same persisted state — dashboard reads fresh on mount).
export function useClinicians() {
  const [clinicians, setClinicians] = useState<Clinician[]>(CLINICIANS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setClinicians(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const submitCheckIn = useCallback((clinicianId: string, snapshot: CheckInSnapshot) => {
    setClinicians(prev => {
      const next = prev.map(c => {
        if (c.id !== clinicianId) return c;
        // Upsert this week's snapshot (replace if a snapshot already exists for that date),
        // clear any missed-week flag, and keep history ordered oldest → newest.
        const withoutSameDate = c.history.filter(h => h.date !== snapshot.date);
        return { ...c, missedWeeks: 0, history: [...withoutSameDate, snapshot] };
      });
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setClinicians(CLINICIANS);
  }, []);

  return { clinicians, hydrated, submitCheckIn, reset };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
