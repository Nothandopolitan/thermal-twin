'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Snowflake,
  ArrowLeft,
  Flame,
  Sprout,
  Fish,
  Users,
  Briefcase,
  Thermometer,
  Droplets,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  User,
  Building2,
  Send,
  Sun,
  HandHeart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import {
  COMMUNITY_OPPORTUNITY_CARDS,
  getTotalAllocatedCommunityHeatMw,
  COMMERCIAL_DOOR_CONFIG,
  getMineConfig,
  DEFAULT_MINE,
  type CommunityCard,
} from '@/lib/thermal-config';

const mine = getMineConfig(DEFAULT_MINE);
const totalAllocatedMw = getTotalAllocatedCommunityHeatMw();
const availableHeatMw = Math.round((mine.availableHeatCapacityMw - totalAllocatedMw) * 100) / 100;

const cardIconMap: Record<string, typeof Sprout> = {
  merafong_hydroponics: Sprout,
  tilapia_aquaculture: Fish,
  post_harvest_drying: Sun,
  sanitation_laundry: HandHeart,
};

interface Opportunity extends CommunityCard {
  icon: typeof Sprout;
}

const opportunities: Opportunity[] = COMMUNITY_OPPORTUNITY_CARDS.map((card) => ({
  ...card,
  icon: cardIconMap[card.id] ?? Sprout,
}));

export default function CommunityPage() {
  const router = useRouter();
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [applicantType, setApplicantType] = useState<'individual' | 'business'>('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setError(null);
    setSubmitting(true);

    const { error: insertError } = await supabase.from('community_applications').insert({
      applicant_type: applicantType,
      full_name: fullName,
      email,
      phone: phone || null,
      opportunity_id: selectedOpp.id,
      opportunity_name: selectedOpp.title,
      organization: applicantType === 'business' ? organization : null,
      message: message || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong submitting your application. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setSelectedOpp(null);
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setOrganization('');
    setMessage('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 shadow-md shadow-blue-500/20">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-sm leading-tight">Thermal Twin</h1>
              <p className="text-blue-500 dark:text-blue-400 text-xs font-medium">Community Portal</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to home</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 mb-4">
            <Flame className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-teal-700 dark:text-teal-400 text-xs font-semibold">No sign-in required</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Waste Heat Off-Take Opportunities
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
            Local businesses and community members can access waste heat from {mine.name} mine ({mine.operator})
            to power agriculture, aquaculture, and other ventures. Browse opportunities and apply directly — no account needed.
          </p>
        </div>

        {/* Available heat banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 p-6 lg:p-8 mb-8 animate-fade-in-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium uppercase tracking-wide">Available Waste Heat</span>
              </div>
              <p className="text-4xl font-bold text-white tabular-nums">{availableHeatMw} MWth</p>
              <p className="text-white/70 text-sm mt-1">Rejected at fence-line · {mine.name} · {mine.location}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Total Allocated</p>
                <p className="text-white text-lg font-bold mt-0.5">{totalAllocatedMw} MWth</p>
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Jobs Target</p>
                <p className="text-white text-lg font-bold mt-0.5">118+</p>
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">tPPA Discount</p>
                <p className="text-white text-lg font-bold mt-0.5">{COMMERCIAL_DOOR_CONFIG.defaultDiscountPercent}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity cards */}
        {!selectedOpp && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {opportunities.map((opp, idx) => {
              const Icon = opp.icon;
              return (
                <div
                  key={opp.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500/40 transition-all animate-fade-in-up flex flex-col"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
                      <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">{opp.title}</h3>
                      <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {opp.slpMetric}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 flex-1">
                    {opp.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{opp.focusGroup}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Heat</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{opp.allocatedMw} MWth</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Thermometer className="w-3.5 h-3.5 text-teal-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Water</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{opp.waterTempC}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jobs</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{opp.jobsCreated.split(',')[0]}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOpp(opp);
                      setSubmitted(false);
                    }}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md shadow-blue-500/20 hover:from-blue-400 hover:to-teal-400 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Apply Now
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Application form */}
        {selectedOpp && !submitted && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <button
              onClick={() => setSelectedOpp(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 group text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to opportunities</span>
            </button>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:p-8">
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
                  <selectedOpp.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{selectedOpp.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Fill in your details below. No account needed — your application goes directly to the mine operations team.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Applicant type toggle */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">I am applying as a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setApplicantType('individual')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                        applicantType === 'individual'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      )}
                    >
                      <User className="w-4 h-4" />
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicantType('business')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                        applicantType === 'business'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      )}
                    >
                      <Building2 className="w-4 h-4" />
                      Business
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 71 234 5678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Organization (business only) */}
                {applicantType === 'business' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Organization / Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required={applicantType === 'business'}
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Your business or organization"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Message / Motivation <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your interest in this opportunity..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>

                <p className="text-center text-slate-400 text-xs">
                  Your information is sent securely to the {mine.name} mine operations team for review.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Success state */}
        {selectedOpp && submitted && (
          <div className="max-w-lg mx-auto text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Application Submitted!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Thank you, {fullName}. Your application for <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedOpp.title}</span> has been received.
              The {mine.name} mine operations team will review it and contact you at {email}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Apply for another opportunity
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow-md shadow-blue-500/20 hover:from-blue-400 hover:to-teal-400 transition-all text-sm"
              >
                Back to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
