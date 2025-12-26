"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useState, useRef, FormEvent, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  Sun,
  Cloud,
  Briefcase,
  Wine,
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap,
  Eye,
} from "lucide-react";

// ============================================
// FONTS: Import in layout.tsx or _app.tsx:
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
// ============================================

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const slideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ============================================
// NAVIGATION
// ============================================
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5"
          : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-[#0a0a0a] font-serif font-bold text-lg">
              F
            </span>
          </div>
          <span className="font-serif text-xl tracking-tight text-white/90">
            FitFlow
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {["How It Works", "Features", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-white/50 hover:text-white transition-colors duration-300 tracking-wide uppercase"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Log in
          </button>
          <button className="bg-[#D4A574] text-[#0a0a0a] px-6 py-2.5 text-sm font-medium rounded-full hover:bg-[#E5B685] transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A574]/20">
            Try Beta
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white/80 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-t border-white/5"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {["How It Works", "Features", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-white/70 hover:text-white transition-colors text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <button className="text-white/70 py-3">Log in</button>
                <button className="bg-[#D4A574] text-[#0a0a0a] py-3 rounded-full font-medium">
                  Try Beta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  // Abstraction demo items
  const abstractions = [
    { original: "Navy Crew Neck Sweater", abstracted: "Dark Knit Layer" },
    { original: "White Cotton Oxford", abstracted: "Light Collared Base" },
    { original: "Black Slim Chinos", abstracted: "Dark Fitted Trouser" },
    { original: "Grey Wool Blazer", abstracted: "Neutral Structure Piece" },
  ];

  const [activeAbstraction, setActiveAbstraction] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAbstraction((prev) => (prev + 1) % abstractions.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4A574]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-8"
            >
              <motion.div variants={fadeIn} className="inline-block">
                <span className="text-[#D4A574] text-sm tracking-[0.3em] uppercase font-medium">
                  Beta Now Live
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[0.95] tracking-tight"
              >
                <span className="text-white/90">Your closet,</span>
                <br />
                <span className="text-[#D4A574] italic">distilled.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-white/50 text-lg lg:text-xl max-w-lg leading-relaxed"
              >
                AI-powered outfit generation based on what you already own. We
                abstract your wardrobe to its essence—then style it beautifully.
              </motion.p>

              <motion.div variants={fadeUp} className="pt-4">
                {!submitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md"
                  >
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 px-6 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A574]/50 transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="h-14 px-8 bg-[#D4A574] text-[#0a0a0a] rounded-full font-medium hover:bg-[#E5B685] transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      Get Early Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-[#D4A574]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#D4A574]/10 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-lg">
                      You&apos;re on the list. We&apos;ll be in touch.
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Trust Signals */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-8 pt-8"
              >
                <div className="flex items-center gap-2 text-white/30 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-2 text-white/30 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>No photos required</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Abstraction Demo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-sm">
                <div className="absolute -top-3 left-8 px-4 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-full">
                  <span className="text-xs text-white/50 tracking-wider uppercase">
                    Live Demo
                  </span>
                </div>

                <div className="space-y-6">
                  <p className="text-white/40 text-sm">
                    The FitFlow Abstraction Engine
                  </p>

                  <div className="space-y-4">
                    {abstractions.map((item, i) => (
                      <motion.div
                        key={i}
                        className={`relative p-5 rounded-2xl border transition-all duration-500 ${
                          i === activeAbstraction
                            ? "bg-[#D4A574]/10 border-[#D4A574]/30"
                            : "bg-white/[0.02] border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p
                              className={`text-sm transition-all duration-500 ${
                                i === activeAbstraction
                                  ? "text-white/40 line-through"
                                  : "text-white/60"
                              }`}
                            >
                              {item.original}
                            </p>
                          </div>
                          <motion.div
                            initial={false}
                            animate={{
                              opacity: i === activeAbstraction ? 1 : 0,
                            }}
                            className="flex items-center gap-3"
                          >
                            <ArrowRight className="w-4 h-4 text-[#D4A574]" />
                            <span className="text-[#D4A574] font-medium text-sm whitespace-nowrap">
                              {item.abstracted}
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    {abstractions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i === activeAbstraction
                            ? "bg-[#D4A574]"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-4 top-1/4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center shadow-2xl shadow-[#D4A574]/20"
              >
                <Sparkles className="w-7 h-7 text-[#0a0a0a]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// PROBLEM/SOLUTION NARRATIVE
// ============================================
function NarrativeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="relative py-32 lg:py-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />

      <motion.div style={{ scale, opacity }} className="relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {/* The Problem */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="text-center mb-24"
            >
              <motion.span
                variants={fadeUp}
                className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-8"
              >
                The Reality
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white/90 leading-tight mb-8"
              >
                You own <span className="italic text-[#D4A574]">enough</span>{" "}
                clothes.
                <br />
                You just can&apos;t see them clearly.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-white/40 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                The average person wears only 20% of their wardrobe regularly.
                Not because the rest is bad—but because outfit creation is
                mentally exhausting. Decision fatigue wins every morning.
              </motion.p>
            </motion.div>

            {/* Visual Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-full h-px bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent mb-24"
            />

            {/* The Solution */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="text-center"
            >
              <motion.span
                variants={fadeUp}
                className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-8"
              >
                The Solution
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white/90 leading-tight mb-8"
              >
                We <span className="italic text-[#D4A574]">abstract</span> the
                chaos.
                <br />
                AI handles the combinations.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-white/40 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                FitFlow distills your wardrobe into reusable style formulas.
                Then our AI generates outfits for any weather, occasion, or
                mood— using only what you already own.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// PRODUCT SHOWCASE
// ============================================
function ProductShowcase() {
  const occasions = [
    { icon: Briefcase, label: "Work", color: "#D4A574" },
    { icon: Wine, label: "Evening", color: "#B8956A" },
    { icon: Sun, label: "Weekend", color: "#E5B685" },
    { icon: Cloud, label: "Rainy Day", color: "#A08060" },
  ];

  const [activeOccasion, setActiveOccasion] = useState(0);

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4A574]/5 via-transparent to-[#D4A574]/5" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.span
            variants={fadeUp}
            className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-6"
          >
            The Experience
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white/90 leading-tight"
          >
            Context-aware.
            <span className="italic text-[#D4A574]"> Effortlessly styled.</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Occasion Selector */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-white/40 text-sm uppercase tracking-wider mb-8">
              Select your context
            </p>

            <div className="grid grid-cols-2 gap-4">
              {occasions.map((occasion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveOccasion(i)}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 text-left group ${
                    i === activeOccasion
                      ? "bg-[#D4A574]/10 border-[#D4A574]/40"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      i === activeOccasion
                        ? "bg-[#D4A574]"
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    <occasion.icon
                      className={`w-6 h-6 ${
                        i === activeOccasion
                          ? "text-[#0a0a0a]"
                          : "text-white/60"
                      }`}
                    />
                  </div>
                  <p
                    className={`font-medium transition-colors ${
                      i === activeOccasion ? "text-[#D4A574]" : "text-white/70"
                    }`}
                  >
                    {occasion.label}
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Weather</span>
                <span className="text-white/70">18°C, Partly Cloudy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Style Profile</span>
                <span className="text-white/70">Modern Minimal</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <motion.div
                    key={activeOccasion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-[#D4A574]/20 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-[#D4A574]" />
                    </div>
                    <p className="text-white/60 text-lg">
                      AI-generated outfit for
                      <br />
                      <span className="text-[#D4A574] font-serif italic text-xl">
                        {occasions[activeOccasion].label}
                      </span>
                    </p>
                    <p className="text-white/30 text-sm max-w-xs mx-auto">
                      Visualize complete looks with our Imagen integration
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Corner Tag */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#D4A574] rounded-full">
                <span className="text-xs font-medium text-[#0a0a0a]">
                  Preview
                </span>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -left-6 bottom-12 p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl"
            >
              <p className="text-[#D4A574] text-2xl font-serif font-medium">
                247
              </p>
              <p className="text-white/40 text-xs">Possible combinations</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Add your pieces",
      desc: "No photos needed. Select from categories, colors, and fits. Build your digital closet in under 5 minutes.",
    },
    {
      num: "02",
      title: "We abstract them",
      desc: "Your 'Blue Slim Fit Oxford' becomes a 'Light Collared Base'. Reusable formulas that unlock infinite styling.",
    },
    {
      num: "03",
      title: "AI does the rest",
      desc: "Get context-aware outfit suggestions for any occasion. Visualize them. Save your favorites.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.span
            variants={fadeUp}
            className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-6"
          >
            How It Works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white/90"
          >
            Three steps to
            <span className="italic text-[#D4A574]"> effortless style</span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="absolute -inset-px bg-gradient-to-b from-[#D4A574]/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 lg:p-10 bg-white/[0.02] border border-white/10 rounded-3xl h-full">
                <span className="text-[#D4A574] font-serif text-5xl font-light opacity-40 block mb-6">
                  {step.num}
                </span>
                <h3 className="text-white/90 text-xl lg:text-2xl font-medium mb-4">
                  {step.title}
                </h3>
                <p className="text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTIMONIALS
// ============================================
function Testimonials() {
  const testimonials = [
    {
      quote:
        "I finally wear the clothes I forgot I loved. The abstraction concept is genius.",
      author: "Sarah M.",
      role: "Creative Director",
    },
    {
      quote:
        "No more 'I have nothing to wear' mornings. This genuinely changed my routine.",
      author: "James K.",
      role: "Software Engineer",
    },
    {
      quote:
        "The AI visualizations are surprisingly accurate. It's like having a personal stylist.",
      author: "Elena R.",
      role: "Fashion Blogger",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Beta Feedback
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl text-white/90"
          >
            What early users are saying
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl"
            >
              <p className="text-white/70 text-lg leading-relaxed mb-6 font-serif italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white/90 font-medium">{t.author}</p>
                <p className="text-white/40 text-sm">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING
// ============================================
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "/month",
      description: "For getting started",
      features: [
        "Up to 50 wardrobe items",
        "10 outfit generations/month",
        "Basic style profiles",
        "Weather matching",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "10",
      period: "/month",
      description: "For the style-conscious",
      features: [
        "Unlimited wardrobe items",
        "Unlimited generations",
        "AI outfit visualizations",
        "Custom style profiles",
        "Priority support",
      ],
      cta: "Start 7-Day Trial",
      highlighted: true,
    },
    {
      name: "Bring Your Key",
      price: "30",
      period: "one-time",
      description: "For power users",
      features: [
        "Everything in Premium",
        "Use your own API keys",
        "Lower long-term cost",
        "Full AI provider control",
      ],
      cta: "Learn More",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="text-[#D4A574]/60 text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Pricing
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white/90"
          >
            Simple, honest pricing
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                plan.highlighted
                  ? "bg-[#D4A574]/10 border-[#D4A574]/40"
                  : "bg-white/[0.02] border-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#D4A574] rounded-full">
                  <span className="text-xs font-medium text-[#0a0a0a]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white/90 text-xl font-medium mb-1">
                  {plan.name}
                </h3>
                <p className="text-white/40 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-white text-5xl font-serif">
                  ${plan.price}
                </span>
                <span className="text-white/40 text-sm ml-1">
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-white/60 text-sm"
                  >
                    <Check className="w-4 h-4 text-[#D4A574] shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-full font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#D4A574] text-[#0a0a0a] hover:bg-[#E5B685]"
                    : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA
// ============================================
function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4A574]/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white/90 mb-6 leading-tight"
          >
            Ready to unlock
            <br />
            <span className="italic text-[#D4A574]">your wardrobe?</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-white/40 text-lg mb-10 max-w-xl mx-auto"
          >
            Join thousands of early adopters discovering outfits they never knew
            they had.
          </motion.p>

          <motion.div variants={fadeUp}>
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 px-6 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A574]/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="h-14 px-8 bg-[#D4A574] text-[#0a0a0a] rounded-full font-medium hover:bg-[#E5B685] transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Join the Beta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 text-[#D4A574]"
              >
                <div className="w-10 h-10 rounded-full bg-[#D4A574]/10 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-lg">
                  Welcome aboard. Check your inbox.
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="relative py-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center">
              <span className="text-[#0a0a0a] font-serif font-bold text-sm">
                F
              </span>
            </div>
            <span className="font-serif text-lg text-white/80">FitFlow</span>
          </div>

          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function Home() {
  return (
    <main className="relative bg-[#0a0a0a] text-white font-sans antialiased">
      {/* Font loading hint - add to layout.tsx */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap");

        :root {
          --font-serif: "Playfair Display", Georgia, serif;
          --font-sans: "DM Sans", sans-serif;
        }

        body {
          font-family: var(--font-sans);
        }

        .font-serif {
          font-family: var(--font-serif);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Selection */
        ::selection {
          background: rgba(212, 165, 116, 0.3);
          color: #fff;
        }
      `}</style>

      <Navigation />
      <HeroSection />
      <NarrativeSection />
      <ProductShowcase />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
