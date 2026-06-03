import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, ClipboardList, LineChart, BellRing } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-rose-500" />
          <span className="font-semibold text-lg tracking-tight">VicariousTrack</span>
        </div>
        <div className="flex gap-2">
          <Link href="/checkin"><Button variant="outline" size="sm">Clinician check-in</Button></Link>
          <Link href="/dashboard"><Button size="sm" className="bg-slate-900 hover:bg-slate-700 text-white">Supervisor dashboard</Button></Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-700 mb-6">
          BYU Technology Transfer Office
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 max-w-2xl">
          Catch clinician compassion fatigue{" "}
          <span className="text-rose-500">before it becomes turnover.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl">
          A weekly 5-minute check-in using the validated ProQOL-5 and Secondary Traumatic
          Stress Scale. When scores cross published clinical thresholds, supervisors get an
          alert and a ready-made supervision agenda — earlier, documented intervention tied
          to real instruments, not ad-hoc recognition.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/dashboard"><Button size="lg" className="bg-slate-900 hover:bg-slate-700 text-white">See the supervisor dashboard →</Button></Link>
          <Link href="/checkin"><Button size="lg" variant="outline">Take a clinician check-in →</Button></Link>
        </div>
      </section>

      <section className="border-t bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Feature icon={<ClipboardList className="h-5 w-5 text-rose-500" />} title="Validated instruments" description="The real ProQOL-5 (Compassion Satisfaction, Burnout, Secondary Traumatic Stress) and Bride's STSS — verbatim items, published scoring, real clinical cutoffs." />
          <Feature icon={<BellRing className="h-5 w-5 text-amber-500" />} title="Threshold alerts" description="Automatic flags when a clinician's STSS total crosses 38 (clinically meaningful) or burnout/STS hit the high band — surfaced to the supervisor immediately." />
          <Feature icon={<LineChart className="h-5 w-5 text-blue-600" />} title="Trajectory, not snapshots" description="Weekly trends per subscale make deterioration visible early — a clinician sliding from mild to severe over six weeks stands out before they break." />
          <Feature icon={<HeartPulse className="h-5 w-5 text-emerald-600" />} title="Supervision prompts" description="Each alert comes with a ready-made supervision agenda mapped to exactly which subscale crossed — no guesswork for the supervisor." />
        </div>
      </section>

      <section className="px-6 py-8 border-t text-center">
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Built on dissertation research recommending systematic monitoring of trauma-exposed clinicians. ProQOL-5 © B. Hudnall Stamm (used with attribution). STSS © B. E. Bride — demonstration use; commercial licensing requires the author&apos;s permission. Not a diagnostic instrument.
        </p>
      </section>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
