import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Map, Radio, FileText, HardDrive, BellRing, ShieldCheck,
  Trees, Users, Microscope, Landmark, HeartHandshake, Newspaper, RefreshCw, AlertCircle,
  MessageSquare, BookOpen, ChevronRight
} from 'lucide-react';
import logoImage from '../assets/WildGuardLogoTransparent.png';
import heroImage from '../assets/landing-hero.jpg';
import { newsService } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const purposes = [
  { icon: Radio, title: 'Early Warning Systems', text: 'Edge AI nodes deployed in the field detect elephant movement and push instant, autonomous alerts to authorities.' },
  { icon: Map, title: 'Conflict Mapping', text: 'Visualize hotspots and historical incidents on an interactive live map to strategize patrol routes and secure boundaries.' },
  { icon: ShieldCheck, title: 'Safer Coexistence', text: 'Minimize surprise encounters, reduce crop and property damage, and prevent retaliatory harm to endangered wildlife.' },
];

const users = [
  { icon: Trees, title: 'Forest Rangers', text: 'Monitor live alerts and coordinate swift responses to border incursions.' },
  { icon: Landmark, title: 'Policymakers', text: 'Leverage incident history to plan mitigation strategies and issue compensation.' },
  { icon: Microscope, title: 'Conservationists', text: 'Analyze movement corridors and conflict density to protect habitats.' },
  { icon: Users, title: 'Village Leaders', text: 'Receive timely warnings to evacuate vulnerable areas and protect livestock.' },
  { icon: HeartHandshake, title: 'Relief NGOs', text: 'Coordinate rapid awareness campaigns and post-conflict relief operations.' },
];

const abilities = [
  { icon: Map, title: 'Interactive Live Map', text: 'Pinpoint wildlife hotspots and track conflict locations in absolute real-time.' },
  { icon: BellRing, title: 'Instant Notifications', text: 'Receive immediate alerts the moment edge AI cameras detect wildlife activity.' },
  { icon: BookOpen, title: 'Community Directory', text: 'Manage contact details for villages and zones to streamline emergency broadcasts.' },
  { icon: MessageSquare, title: 'SMS Broadcasting', text: 'Dispatch localized SMS warnings to registered villagers to ensure their safety.' },
  { icon: FileText, title: 'Incident Records', text: 'Log, update, and comprehensively review historical conflict cases and field reports.' },
  { icon: HardDrive, title: 'Edge Node Status', text: 'Track the operational health, maintenance schedules, and locations of AI sensors.' },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const NewsSection = () => {
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState('loading');

  const loadNews = async () => {
    setStatus('loading');
    try {
      const data = await newsService.getWildlifeNews();
      setArticles(data);
      setStatus(data.length ? 'ready' : 'empty');
    } catch (error) {
      console.error('Failed to load news', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <section id="news" className="relative bg-slate-900 py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="text-left">
            <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold tracking-wider text-emerald-400 border border-emerald-500/20 mb-4">LATEST INTEL</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Wildlife News &amp; Updates</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Stay informed with real-time field reports, conservation reforms, and conflict news directly from across the country.
            </p>
          </div>
          <button
            onClick={loadNews}
            className="inline-flex items-center gap-2 self-start rounded-full bg-slate-800/50 border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 shadow-sm transition-all hover:bg-slate-800 hover:text-white hover:border-emerald-500/50 sm:self-auto backdrop-blur-md"
          >
            <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin text-emerald-400' : ''}`} /> Sync Feed
          </button>
        </div>

        {status === 'loading' && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-3xl bg-slate-800/40 border border-slate-700/50">
                <div className="h-56 bg-slate-700/50" />
                <div className="space-y-4 p-6">
                  <div className="h-3 w-1/3 rounded-full bg-slate-700" />
                  <div className="h-5 rounded-full bg-slate-700" />
                  <div className="h-4 w-4/5 rounded-full bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {(status === 'error' || status === 'empty') && (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-700 bg-slate-800/20 py-20 text-center backdrop-blur-sm">
            <AlertCircle className="h-10 w-10 text-slate-500" />
            <p className="text-slate-400 text-lg">
              {status === 'error' ? 'Unable to establish secure connection to news feed.' : 'No recent intelligence reports found.'}
            </p>
            <button onClick={loadNews} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">Attempt Reconnection</button>
          </div>
        )}

        {status === 'ready' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {articles.map((article) => (
              <motion.a
                key={article.url}
                variants={fadeUp}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-3xl bg-slate-800/40 text-left border border-slate-700/50 transition-all duration-500 hover:-translate-y-2 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/20 backdrop-blur-sm"
              >
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  {article.image && (
                    <img
                      src={article.image}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  <span className="absolute left-4 top-4 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-md">
                    {article.source}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <time className="text-xs font-semibold tracking-wider text-emerald-500/80 uppercase">{formatDate(article.publishedAt)}</time>
                  <h3 className="mt-3 line-clamp-3 text-lg font-bold leading-snug text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-400 leading-relaxed">{article.description}</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    Access Report <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

const SectionHeading = ({ eyebrow, title, text }) => (
  <div className="mx-auto mb-20 max-w-3xl text-center">
    <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold tracking-wider text-emerald-700 border border-emerald-100 mb-6">{eyebrow}</span>
    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{title}</h2>
    {text && <p className="mt-6 text-xl leading-relaxed text-slate-600">{text}</p>}
  </div>
);

const Landing = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-50 text-left selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      
      {/* Premium Floating Navbar */}
      <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full bg-white/80 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl border border-white/40">
          <a href="#top" className="flex items-center gap-3 transition-transform hover:scale-105">
            <img src={logoImage} alt="WildGuard logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-black tracking-tight text-slate-900">Wild<span className="text-emerald-600">Guard</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#about" className="hover:text-emerald-600 transition-colors">Mission</a>
            <a href="#abilities" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#news" className="hover:text-emerald-600 transition-colors">Intel</a>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-600/30 hover:-translate-y-0.5"
          >
            Launch Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-950">
        <motion.div style={{ y: heroY, opacity }} className="absolute inset-0 w-full h-full">
          <img src={heroImage} alt="Elephant in forest" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-emerald-950/40 to-slate-950/95" />
        </motion.div>
        
        {/* Abstract Glowing Orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/20 blur-[128px] rounded-full mix-blend-screen pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 blur-[128px] rounded-full mix-blend-screen pointer-events-none"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center pt-20"
        >
          <motion.div variants={fadeUp} className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-300 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Next-Gen Conflict Resolution Protocol
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-[5rem]">
            Defend Communities. <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent drop-shadow-sm">Preserve Wildlife.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-300 font-medium">
            WildGuard connects autonomous edge AI sensors with a powerful command center, enabling forest officials to detect elephant intrusions and dispatch alerts in real-time.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link to="/dashboard" className="group relative inline-flex items-center gap-3 rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              Enter Dashboard 
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Bottom Fade out */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Mission Section */}
      <section id="about" className="relative py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="The Mission"
            title="Intelligence at the Edge"
            text="Human-wildlife conflict is unpredictable and dangerous. WildGuard replaces guesswork with absolute precision, utilizing IoT and AI to secure boundaries without harming animals."
          />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid gap-8 md:grid-cols-3">
            {purposes.map(({ icon: Icon, title, text }, index) => (
              <motion.div key={title} variants={fadeUp} className="group relative rounded-3xl bg-white p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-b from-emerald-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 transition-colors duration-500 group-hover:bg-emerald-600 group-hover:text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
                  <p className="leading-relaxed text-slate-600 text-lg">{text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Users Section */}
      <section className="py-32 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3">
              <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold tracking-wider text-emerald-700 border border-emerald-100 mb-6">THE ECOSYSTEM</span>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">Empowering every stakeholder.</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                From the frontline rangers facing the danger, to the policymakers crafting the laws, WildGuard provides the exact data needed to act decisively.
              </p>
              <Link to="/dashboard" className="inline-flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700 transition-colors text-lg">
                Explore the dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="lg:w-2/3 grid gap-6 sm:grid-cols-2">
              {users.map(({ icon: Icon, title, text }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                  <div className="shrink-0 mt-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-600 leading-relaxed">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Abilities Section */}
      <section id="abilities" className="py-32 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold tracking-wider text-emerald-400 border border-emerald-500/20 mb-6">CORE FEATURES</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Unmatched situational awareness.</h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-400">Everything you need to monitor sensors, dispatch alerts, and manage community contacts, seamlessly integrated into one unified dashboard.</p>
          </div>
          
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {abilities.map(({ icon: Icon, title, text }) => (
              <motion.div key={title} variants={fadeUp} className="group relative overflow-hidden rounded-3xl bg-slate-900/50 p-8 border border-slate-800 transition-all hover:bg-slate-800/80 hover:border-emerald-500/30 backdrop-blur-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-slate-950 border border-slate-700 group-hover:border-transparent">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="leading-relaxed text-slate-400">{text}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-emerald-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <NewsSection />

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549480017-d77299166fce?q=80&w=2675&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply opacity-20"></div>
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-950/80"></div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-black text-white sm:text-6xl tracking-tight mb-8">Ready to secure the perimeter?</h2>
          <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto leading-relaxed">Join the network of forest officials utilizing advanced AI edge monitoring to save lives and protect wildlife across the country.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-emerald-950 shadow-2xl transition-all hover:scale-105 hover:bg-emerald-50 hover:shadow-white/20">
            Launch Dashboard <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-center text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-3 mb-4 opacity-50">
          <img src={logoImage} alt="" className="w-6 h-6 grayscale" />
          <span className="font-bold tracking-tight">WildGuard</span>
        </div>
        © {new Date().getFullYear()} WildGuard Technologies. Protecting communities and conservation efforts.
      </footer>
    </div>
  );
};

export default Landing;
