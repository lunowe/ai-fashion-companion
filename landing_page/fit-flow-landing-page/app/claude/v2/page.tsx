"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  LayoutGroup,
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
  MapPin,
  Calendar,
  Plane,
  Plus,
  Moon,
  Laptop,
  Shirt,
} from "lucide-react";

// ============================================
// THEME MANAGER
// ============================================
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-card border border-border text-foreground shadow-lg hover:bg-muted transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_-5px_var(--primary)]">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            FitFlow
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {["Features", "Travel", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Log in
          </button>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium rounded-full hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/20">
            Try Beta
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
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
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {["Features", "Travel", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-foreground/80 hover:text-primary transition-colors text-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <button className="text-foreground py-3 font-medium">
                  Log in
                </button>
                <button className="bg-primary text-primary-foreground py-3 rounded-xl font-medium">
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background"
    >
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              <motion.div variants={fadeUp} className="inline-block">
                <span className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  Public Beta Live
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-foreground leading-[0.95]"
              >
                Style without the
                <br />
                <span className="text-primary italic">noise.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                Abstract your wardrobe into reusable style formulas. We distill
                your clothes into attributes, then use AI to generate infinite
                outfits from what you own.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button className="h-14 px-8 bg-foreground text-background rounded-full font-bold hover:bg-foreground/90 transition-all duration-300 flex items-center gap-2 group shadow-xl">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground px-4">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Privacy-first
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> No photos required
                  </span>
                </div>
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// SECTION 2: ABSTRACTION WIZARD (NEW)
// ============================================
function AbstractionWizard() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const attributes = [
    { name: "Category", options: ["Tops", "Bottoms", "Outerwear", "Shoes"] },
    { name: "Type", options: ["T-Shirt", "Hoodie", "Button-Down", "Polo"] },
    { name: "Fit", options: ["Slim", "Regular", "Oversized", "Boxy"] },
    { name: "Material", options: ["Cotton", "Linen", "Wool", "Synthetic"] },
    { name: "Color", options: ["White", "Black", "Navy", "Beige"] },
  ];

  const handleSelect = (option: string) => {
    setSelections((prev) => ({ ...prev, [attributes[step].name]: option }));
    if (step < attributes.length - 1) {
      setStep(step + 1);
    } else {
      // Reset for demo loop
      setTimeout(() => {
        setSelections({});
        setStep(0);
      }, 2000);
    }
  };

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/*  */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold text-foreground"
            >
              Add items by <span className="text-primary">attribute</span>.
              <br /> Forget the brands.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              You don&apos;t need to take photos or look up SKU numbers. Our
              wizard lets you categorize your pieces quickly.
            </motion.p>
            <motion.p variants={fadeUp} className="text-foreground font-medium">
              Your specific "Supreme Hanes Tee" becomes a unified digital asset:
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 pt-2">
              {Object.entries(selections).map(([key, val]) => (
                <span
                  key={key}
                  className="px-3 py-1 rounded-md bg-muted text-muted-foreground text-sm border border-border"
                >
                  {val}
                </span>
              ))}
              {Object.keys(selections).length === 0 && (
                <span className="text-muted-foreground/40 italic">
                  Select attributes...
                </span>
              )}
            </motion.div>
          </motion.div>

          {/* Right Interactive Demo */}
          <div className="relative">
            <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 max-w-md mx-auto h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Add New Item
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Step {step + 1} of 5
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6">
                <AnimatePresence mode="wait">
                  {step < attributes.length ? (
                    <motion.div
                      key={attributes[step].name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h4 className="text-lg font-medium text-foreground">
                        Select {attributes[step].name}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {attributes[step].options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className="p-4 text-left rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      <h4 className="text-xl font-bold text-foreground">
                        Item Added!
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Added "White Slim Cotton T-Shirt" to your wardrobe.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3: NARRATIVE
// ============================================
function Narrative() {
  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            You own enough clothes.
            <br />
            <span className="text-muted-foreground">
              You just can't see them clearly.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed">
            The average person wears only 20% of their wardrobe. Decision
            fatigue wins every morning. By abstracting your clothes into data
            points, FitFlow uncovers combinations you never thought possible.
          </p>
        </motion.div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
}

// ============================================
// SECTION 4: OUTFIT PREVIEW
// ============================================
function OutfitPreview() {
  const occasions = [
    { icon: Briefcase, label: "Work", context: "Professional • 20°C" },
    { icon: Wine, label: "Date Night", context: "Elegant • 15°C" },
    { icon: Sun, label: "Casual", context: "Relaxed • 24°C" },
  ];
  const [activeOccasion, setActiveOccasion] = useState(0);

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Context-aware styling.
          </h2>
          <p className="text-muted-foreground text-lg">
            Our AI generates outfits based on weather, occasion, and your
            specific style profile.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[600px]">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {occasions.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveOccasion(i)}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${
                  activeOccasion === i
                    ? "bg-card border-primary shadow-lg scale-[1.02]"
                    : "bg-background border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`flex items-center gap-2 font-semibold ${
                      activeOccasion === i ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </span>
                  {activeOccasion === i && (
                    <motion.div
                      layoutId="dot"
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.context}</p>
              </button>
            ))}
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-8 bg-muted/30 rounded-3xl border border-border p-8 relative overflow-hidden flex items-center justify-center">
            {/*  */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeOccasion}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
              >
                {/* Abstract Representation of Outfit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {activeOccasion === 0
                          ? "Oxford Shirt"
                          : activeOccasion === 1
                          ? "Silk Blouse"
                          : "Linen Tee"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Top Layer • White
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 bg-card p-4 rounded-2xl shadow-sm border border-border aspect-square flex flex-col justify-between">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <p className="font-medium text-foreground text-sm">
                      {activeOccasion === 0
                        ? "Chinos"
                        : activeOccasion === 1
                        ? "Slip Skirt"
                        : "Shorts"}
                    </p>
                  </div>
                  <div className="col-span-1 bg-card p-4 rounded-2xl shadow-sm border border-border aspect-square flex flex-col justify-between">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <p className="font-medium text-foreground text-sm">
                      {activeOccasion === 0
                        ? "Loafers"
                        : activeOccasion === 1
                        ? "Heels"
                        : "Sandals"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground"
                      >
                        AI
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-muted-foreground py-1">
                    Generated in 0.4s
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 5: HOW IT WORKS (3 STEPS)
// ============================================
function HowItWorks() {
  const steps = [
    {
      icon: Plus,
      title: "Select Pieces",
      desc: "Use the attribute wizard to add your tops, bottoms, and shoes.",
    },
    {
      icon: Laptop,
      title: "Choose Feature",
      desc: "Select between Daily Styling, Calendar Planning, or Travel Packing.",
    },
    {
      icon: Sparkles,
      title: "AI Generation",
      desc: "Our engine builds the perfect combination for your specific context.",
    },
  ];

  return (
    <section className="py-32 bg-card border-y border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
            Three steps to effortless style
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-border via-border to-border -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center space-y-4 bg-card" // bg-card covers the line behind icon
            >
              <div className="w-24 h-24 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm mb-4">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6: TRAVEL FEATURE (NEW)
// ============================================
function TravelFeature() {
  return (
    <section
      id="travel"
      className="py-32 bg-background relative overflow-hidden"
    >
      {/*  */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 mb-6 text-primary"
            >
              <Plane className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                New Feature
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Smart Packing
              <br />
              <span className="text-muted-foreground">
                for any destination.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              Tell FitFlow where you're going and for how long. We'll generate a
              capsule wardrobe that fits in a carry-on and covers every planned
              activity.
            </motion.p>

            <motion.ul variants={fadeUp} className="space-y-4 mb-8">
              {[
                "Weather-adaptive suggestions",
                "Maximizes mix-and-match potential",
                "Generates a checklist instantly",
              ].map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-foreground font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {feat}
                </li>
              ))}
            </motion.ul>

            <motion.button
              variants={fadeUp}
              className="px-6 py-3 rounded-full border border-border text-foreground hover:bg-muted transition-colors font-medium"
            >
              Try Travel Mode
            </motion.button>
          </motion.div>

          {/* Right Card UI */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative z-10">
              {/* Trip Header */}
              <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Paris, France
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 5 Days
                    </span>
                    <span className="flex items-center gap-1">
                      <Cloud className="w-4 h-4" /> 12°C - 18°C
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Packing Grid */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Tops (4)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-border"
                      >
                        <Shirt className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Bottoms (2)
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-border"
                      >
                        <div className="w-5 h-8 bg-muted-foreground/20 rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  12 Possible Outfits
                </span>
                <button className="text-primary text-sm font-bold hover:underline">
                  View Combinations
                </button>
              </div>
            </div>

            {/* Decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================
function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-card border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground">Simple Pricing</h2>
          <p className="text-muted-foreground mt-4">
            Start organizing your style today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Free",
              price: "$0",
              features: [
                "50 wardrobe items",
                "Daily suggestions",
                "Basic stats",
              ],
            },
            {
              name: "Pro",
              price: "$12",
              features: [
                "Unlimited items",
                "Travel Packing Mode",
                "Advanced Style Analytics",
                "Calendar Planning",
              ],
              popular: true,
            },
            {
              name: "Lifetime",
              price: "$299",
              features: [
                "One-time payment",
                "All Pro features",
                "Early access to new AI models",
                "Priority Support",
              ],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-3xl border flex flex-col ${
                plan.popular
                  ? "bg-background border-primary shadow-2xl shadow-primary/10"
                  : "bg-background border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.price !== "$299" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER & CTA
// ============================================
function Footer() {
  return (
    <footer className="bg-background pt-32 pb-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
          Ready to <span className="text-primary italic">flow</span>?
        </h2>
        <form className="max-w-md mx-auto flex gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-card border border-border rounded-full px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
            Join
          </button>
        </form>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground pt-12 border-t border-border/50">
        <p>&copy; 2024 FitFlow AI. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Twitter
          </a>
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
    <main className="bg-background text-foreground min-h-screen selection:bg-primary/30">
      <ThemeToggle />
      <Navigation />
      <HeroSection />
      <AbstractionWizard />
      <Narrative />
      <OutfitPreview />
      <HowItWorks />
      <TravelFeature />
      <Pricing />
      <Footer />
    </main>
  );
}
