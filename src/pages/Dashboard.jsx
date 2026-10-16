import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ScanSearch, FileText, LayoutTemplate, Download, Target, ArrowRight, Clock,
  TrendingUp, Briefcase, CheckCircle2, Zap, ShieldCheck, WandSparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'AI Resume Writing', desc: 'Generate sharper summaries, bullets and project descriptions while keeping your real experience intact.' },
  { icon: Target, title: 'ATS Score', desc: 'Get a transparent score out of 100 with clear signals on structure, content and keyword readiness.' },
  { icon: ScanSearch, title: 'Job Matching', desc: 'Compare your resume with a job description and instantly spot matched and missing keywords.' },
  { icon: LayoutTemplate, title: 'ATS-Friendly Templates', desc: 'Choose polished layouts designed to look great to recruiters without confusing parsers.' },
  { icon: Download, title: 'Clean PDF Export', desc: 'Export a print-ready resume that keeps your selected template and spacing consistent.' },
  { icon: TrendingUp, title: 'Actionable Optimization', desc: 'Turn your score into a prioritized checklist so every edit has a clear purpose.' },
];

const TRUST_POINTS = ['No bloated layouts', 'ATS-conscious structure', 'Local-first scanning', 'AI assistance when configured'];

export default function Dashboard({ resumeStore }) {
  const { resumes } = resumeStore;

  const stats = useMemo(() => {
    const scored = resumes.filter((r) => typeof r.atsScore === 'number');
    const avgScore = scored.length ? Math.round(scored.reduce((sum, r) => sum + r.atsScore, 0) / scored.length) : null;
    const lastUpdated = resumes.length
      ? resumes.reduce((latest, r) => (new Date(r.updatedAt) > new Date(latest.updatedAt) ? r : latest), resumes[0])
      : null;
    return {
      resumesCreated: resumes.length,
      avgScore,
      applicationsTracked: resumes.filter((r) => r.targetRole).length,
      lastUpdated,
    };
  }, [resumes]);

  return (
    <div className="page-shell overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.035] px-6 py-12 sm:px-10 lg:px-14 lg:py-16 shadow-panel">
          <div className="absolute -top-28 -right-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[.035] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-800 mb-6">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" /></span>
              AI-powered career toolkit
            </div>
            <h1 className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.045em] leading-[1.02] text-ink-900">
              Build a resume that <span className="bg-gradient-to-r from-brand-700 via-brand-400 to-cyan-300 bg-clip-text text-transparent">gets noticed.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-ink-500 leading-relaxed">
              Create a recruiter-ready resume, optimize it with AI, and check how well it matches the jobs you actually want.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/builder?new=1" className="btn-primary px-6 py-3.5 text-base">
                <WandSparkles size={18} /> Build my resume <ArrowRight size={16} />
              </Link>
              <Link to="/ats-scanner" className="btn-secondary px-6 py-3.5 text-base">
                <ScanSearch size={18} /> Check ATS score
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
              {TRUST_POINTS.map((point) => <span key={point} className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" />{point}</span>)}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 my-10">
          <StatCard icon={FileText} label="Resumes Created" value={stats.resumesCreated} empty="Start your first one" />
          <StatCard icon={Target} label="Average ATS Score" value={stats.avgScore !== null ? `${stats.avgScore}/100` : null} empty="Scan a resume" />
          <StatCard icon={Briefcase} label="Target Roles" value={stats.applicationsTracked || null} empty="Add a target role" />
          <StatCard icon={Clock} label="Last Updated" value={stats.lastUpdated ? stats.lastUpdated.name : null} empty="No activity yet" isText />
        </section>

        {/* Feature grid */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-700">The toolkit</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">Everything you need to apply with confidence.</h2>
            </div>
            <span className="text-sm text-ink-500">Simple workflow. Serious results.</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="group card p-5 hover:-translate-y-1 hover:border-brand-300/40 transition-all duration-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-400/10 flex items-center justify-center group-hover:bg-brand-500/15 transition-colors">
                    <f.icon size={19} className="text-brand-700" />
                  </div>
                  <ArrowRight size={16} className="text-ink-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-ink-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-500/15 via-ink-100 to-cyan-400/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-10 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="hidden sm:flex h-11 w-11 shrink-0 rounded-xl bg-brand-500/15 border border-brand-400/20 items-center justify-center"><Zap size={20} className="text-brand-700" /></div>
            <div>
              <h3 className="text-lg font-bold text-ink-900">Your next application starts here.</h3>
              <p className="text-sm text-ink-500 mt-1">Build once, tailor faster, and walk into every application with a stronger resume.</p>
            </div>
          </div>
          <Link to="/builder?new=1" className="relative btn-primary shrink-0 px-5 py-3">Create a resume <ArrowRight size={16} /></Link>
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-400">
          <ShieldCheck size={14} /> ATS results are directional guidance, not a guarantee of interviews or job offers.
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, empty, isText }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-ink-500 mb-3"><Icon size={15} /><span className="text-[10px] sm:text-xs font-bold uppercase tracking-[.12em]">{label}</span></div>
      {value ? <p className={`font-bold text-ink-900 ${isText ? 'text-sm truncate' : 'text-2xl'}`} title={isText ? value : undefined}>{value}</p> : <p className="text-sm text-ink-400">{empty}</p>}
    </div>
  );
}
