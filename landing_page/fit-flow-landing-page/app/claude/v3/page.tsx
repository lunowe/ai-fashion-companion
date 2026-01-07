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
  Moon,
  Cloud,
  Briefcase,
  Wine,
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap,
  Eye,
  Plane,
  MapPin,
  Calendar,
  Shirt,
  Layers,
  Palette,
  Ruler,
  Luggage,
  Plus,
} from "lucide-react";

// ============================================
// THEME CONTEXT
// ============================================
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("fitflow-theme") as
      | "light"
      | "dark"
      | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("fitflow-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
}

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

// ============================================
// NAVIGATION
// ============================================
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
          ? "bg-background/95 backdrop-blur-xl border-b border-border"
          : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-primary-foreground font-serif font-bold text-lg">
              F
            </span>
          </div>
          <span className="font-serif text-xl tracking-tight text-foreground">
            FitFlow
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {["How It Works", "Features", "Travel", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide uppercase"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-muted hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Log in
          </button>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium rounded-full hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            Try Beta
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
          <button
            className="text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {["How It Works", "Features", "Travel", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <button className="text-muted-foreground py-3">Log in</button>
                <button className="bg-primary text-primary-foreground py-3 rounded-full font-medium">
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

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent z-10" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                           linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
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
                <span className="text-primary text-sm tracking-[0.3em] uppercase font-medium">
                  Beta Now Live
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[0.95] tracking-tight"
              >
                <span className="text-foreground">Your closet,</span>
                <br />
                <span className="text-primary italic">unified.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg lg:text-xl max-w-lg leading-relaxed"
              >
                AI-powered outfit generation based on what you already own.
                Select your pieces, we unify them into style attributes—then
                generate perfect outfits.
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
                      className="flex-1 h-14 px-6 bg-input border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="h-14 px-8 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      Get Early Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-primary"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Zap className="w-4 h-4" />
                  <span>No photos required</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative bg-card border border-border rounded-3xl p-8 lg:p-12">
                <div className="absolute -top-3 left-8 px-4 py-1.5 bg-background border border-border rounded-full">
                  <span className="text-xs text-muted-foreground tracking-wider uppercase">
                    Quick Add
                  </span>
                </div>

                <div className="space-y-6">
                  <p className="text-muted-foreground text-sm">
                    Build your wardrobe in minutes
                  </p>

                  {/* Item Preview Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: "T-Shirt", color: "White", fit: "Slim" },
                      { type: "Chinos", color: "Navy", fit: "Regular" },
                      { type: "Hoodie", color: "Gray", fit: "Oversized" },
                      { type: "Blazer", color: "Black", fit: "Slim" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full border border-border"
                            style={{
                              backgroundColor:
                                item.color === "White"
                                  ? "#fff"
                                  : item.color === "Navy"
                                  ? "#1e3a5f"
                                  : item.color === "Gray"
                                  ? "#6b7280"
                                  : "#111",
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.color}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {item.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.fit} fit
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <button className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add more items
                  </button>
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
                className="absolute -right-4 top-1/4 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20"
              >
                <Sparkles className="w-7 h-7 text-primary-foreground" />
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
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
// ITEM WIZARD SECTION
// ============================================
function ItemWizardSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: "Category",
      icon: Layers,
      options: ["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"],
    },
    {
      label: "Type",
      icon: Shirt,
      options: ["T-Shirt", "Button-Down", "Hoodie", "Sweater", "Polo"],
    },
    {
      label: "Fit",
      icon: Ruler,
      options: ["Slim", "Regular", "Relaxed", "Oversized"],
    },
    {
      label: "Color",
      icon: Palette,
      options: ["White", "Black", "Navy", "Gray", "Beige"],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Simple Setup
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-6"
          >
            No brands. No photos.
            <br />
            <span className="italic text-primary">Just your style.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Select what you own through our quick wizard. Choose category, type,
            fit, color, and optional material—add multiple items in seconds.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Wizard Demo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-3xl p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-8">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                      i <= activeStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = steps[activeStep].icon;
                      return <Icon className="w-6 h-6 text-primary" />;
                    })()}
                    <span className="text-xl font-medium text-foreground">
                      Select {steps[activeStep].label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {steps[activeStep].options.map((option, i) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`px-5 py-3 rounded-xl border transition-all ${
                          i === 0
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Step {activeStep + 1} of {steps.length}
                </span>
                <button className="text-primary text-sm font-medium flex items-center gap-1">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Unified Result */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-muted-foreground text-sm uppercase tracking-wider">
              Your item becomes
            </p>

            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shirt className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Unified Item
                    </p>
                    <h3 className="text-2xl font-serif text-foreground">
                      White Slim Cotton T-Shirt
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="text-foreground ml-2">Tops</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground ml-2">T-Shirt</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fit:</span>
                      <span className="text-foreground ml-2">Slim</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <span className="text-foreground ml-2">Cotton</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              Every piece gets unified attributes that our AI uses to generate
              perfectly matched outfits.
            </p>
          </motion.div>
        </div>
      </div>
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
      <div className="absolute inset-0 bg-background" />

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
                className="text-primary/60 text-sm tracking-[0.3em] uppercase block mb-8"
              >
                The Reality
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-tight mb-8"
              >
                You own <span className="italic text-primary">enough</span>{" "}
                clothes.
                <br />
                You just can&apos;t see them clearly.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
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
              className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-24"
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
                className="text-primary/60 text-sm tracking-[0.3em] uppercase block mb-8"
              >
                The Solution
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground leading-tight mb-8"
              >
                We <span className="italic text-primary">unify</span> your
                pieces.
                <br />
                AI handles the combinations.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                FitFlow transforms your wardrobe into structured style data.
                Then our AI generates outfits for any weather, occasion, or
                mood—using only what you already own.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// PRODUCT SHOWCASE (Outfit Preview)
// ============================================
function ProductShowcase() {
  const occasions = [
    { icon: Briefcase, label: "Work", color: "primary" },
    { icon: Wine, label: "Evening", color: "primary" },
    { icon: Sun, label: "Weekend", color: "primary" },
    { icon: Cloud, label: "Rainy Day", color: "primary" },
  ];

  const [activeOccasion, setActiveOccasion] = useState(0);

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />

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
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Outfit Generation
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight"
          >
            Context-aware.
            <span className="italic text-primary"> Effortlessly styled.</span>
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
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-8">
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
                      ? "bg-primary/10 border-primary/40"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      i === activeOccasion
                        ? "bg-primary"
                        : "bg-muted group-hover:bg-primary/20"
                    }`}
                  >
                    <occasion.icon
                      className={`w-6 h-6 ${
                        i === activeOccasion
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p
                    className={`font-medium transition-colors ${
                      i === activeOccasion ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {occasion.label}
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weather</span>
                <span className="text-foreground">18°C, Partly Cloudy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Style Profile</span>
                <span className="text-foreground">Modern Minimal</span>
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
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border bg-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <motion.div
                    key={activeOccasion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      AI-generated outfit for
                      <br />
                      <span className="text-primary font-serif italic text-xl">
                        {occasions[activeOccasion].label}
                      </span>
                    </p>
                    <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">
                      Visualize complete looks with our AI integration
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Corner Tag */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-primary rounded-full">
                <span className="text-xs font-medium text-primary-foreground">
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
              className="absolute -left-6 bottom-12 p-4 bg-card border border-border rounded-2xl shadow-2xl"
            >
              <p className="text-primary text-2xl font-serif font-medium">
                247
              </p>
              <p className="text-muted-foreground text-xs">
                Possible combinations
              </p>
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
      title: "Select your pieces",
      icon: Shirt,
      desc: "Use our quick wizard to add items. Pick category, type, fit, color, and material—no brands or photos needed.",
    },
    {
      num: "02",
      title: "Choose your feature",
      icon: Sparkles,
      desc: "Generate outfits for any occasion, pack a capsule wardrobe for travel, or explore your wardrobe's full potential.",
    },
    {
      num: "03",
      title: "AI does the rest",
      icon: Zap,
      desc: "Get context-aware suggestions optimized for weather, style, and occasion. Visualize and save your favorites.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

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
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            How It Works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            Three steps to
            <span className="italic text-primary"> effortless style</span>
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
              <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 lg:p-10 bg-card border border-border rounded-3xl h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-primary font-serif text-5xl font-light opacity-40">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-foreground text-xl lg:text-2xl font-medium mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TRAVEL FEATURE
// ============================================
function TravelFeature() {
  const [destination, setDestination] = useState("Barcelona");
  const [days, setDays] = useState(7);

  const destinations = ["Barcelona", "Tokyo", "New York", "Paris"];

  useEffect(() => {
    const interval = setInterval(() => {
      setDestination(
        destinations[Math.floor(Math.random() * destinations.length)]
      );
      setDays(Math.floor(Math.random() * 10) + 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="travel" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />

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
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            New Feature
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight"
          >
            Pack smarter.
            <span className="italic text-primary"> Travel lighter.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mt-6"
          >
            Let AI build your perfect capsule wardrobe for any trip. Maximum
            versatility, minimum luggage.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Travel Config */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Plan Your Trip
                  </p>
                  <h3 className="text-xl font-medium text-foreground">
                    Capsule Packing
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={destination}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-foreground font-medium"
                      >
                        {destination}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={days}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-foreground font-medium"
                      >
                        {days} days
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Trip Type</p>
                    <p className="text-foreground font-medium">
                      Business + Leisure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Capsule Result */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-3xl p-8 lg:p-10">
              <div className="absolute -top-3 left-8 px-4 py-1.5 bg-primary rounded-full">
                <span className="text-xs font-medium text-primary-foreground">
                  AI Generated
                </span>
              </div>

              <div className="flex items-center gap-3 mb-8 pt-4">
                <Luggage className="w-6 h-6 text-primary" />
                <span className="text-xl font-medium text-foreground">
                  Your Capsule
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { count: 3, label: "Tops" },
                  { count: 2, label: "Bottoms" },
                  { count: 1, label: "Outerwear" },
                  { count: 2, label: "Shoes" },
                  { count: 4, label: "Accessories" },
                  { count: 12, label: "Outfits", highlight: true },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl text-center ${
                      item.highlight
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    <p
                      className={`text-2xl font-serif ${
                        item.highlight ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">
                    12 unique outfits
                  </span>{" "}
                  from just 12 items. Weather-optimized for {destination}.
                </p>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 -bottom-4 w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20"
            >
              <Plane className="w-8 h-8 text-primary-foreground" />
            </motion.div>
          </motion.div>
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
        "I finally wear the clothes I forgot I loved. The unified approach is genius.",
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
        "The capsule packing feature saved my sanity on a 3-week Europe trip.",
      author: "Elena R.",
      role: "Travel Blogger",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

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
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Beta Feedback
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl text-foreground"
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
              className="p-8 bg-card border border-border rounded-2xl"
            >
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-serif italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-foreground font-medium">{t.author}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
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
        "Capsule travel packing",
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
      <div className="absolute inset-0 bg-muted/30" />

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
            className="text-primary text-sm tracking-[0.3em] uppercase block mb-6"
          >
            Pricing
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground"
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
                  ? "bg-primary/10 border-primary/40"
                  : "bg-card border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
                  <span className="text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-foreground text-xl font-medium mb-1">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className="text-foreground text-5xl font-serif">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-muted-foreground text-sm"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-full font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-foreground border border-border hover:bg-accent"
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
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
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
            className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6 leading-tight"
          >
            Ready to unlock
            <br />
            <span className="italic text-primary">your wardrobe?</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto"
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
                  className="flex-1 h-14 px-6 bg-input border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="h-14 px-8 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Join the Beta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 text-primary"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
    <footer className="relative py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-sm">
                F
              </span>
            </div>
            <span className="font-serif text-lg text-foreground">FitFlow</span>
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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
    <main className="relative bg-background text-foreground font-sans antialiased">
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

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: oklch(0.606 0.25 292.717 / 0.3);
          color: inherit;
        }
      `}</style>

      <Navigation />
      <HeroSection />
      <ItemWizardSection />
      <NarrativeSection />
      <ProductShowcase />
      <HowItWorks />
      <TravelFeature />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
