"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useState, useEffect, useRef, FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Sun,
  Cloud,
  Layers,
  Zap,
  Lock,
  Key,
  Crown,
} from "lucide-react";

// ============================================
// DESIGN TOKENS
// ============================================
// Background: #08080a | Surface: #121215 | Surface Elevated: #1a1a1f
// Text Primary: #ffffff | Text Secondary: #737373 | Text Muted: #525252
// Accent: #E8A87C (warm copper) | Accent Muted: rgba(232, 168, 124, 0.15)

// ============================================
// CUSTOM CURSOR COMPONENT
// ============================================
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-hover]")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-accent pointer-events-none z-[9999] mix-blend-difference hidden lg:block"
      animate={{
        x: position.x - 8,
        y: position.y - 8,
        scale: isHovering ? 2.5 : 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    />
  );
}

// ============================================
// NAVIGATION
// ============================================
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-white/5"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-3 group" data-hover>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <span className="text-accent font-serif text-xl">F</span>
            </div>
            <span className="font-serif text-xl tracking-tight">FitFlow</span>
          </a>

          <div className="hidden md:flex items-center gap-12">
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-secondary hover:text-primary transition-colors relative group"
                data-hover
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://fit-flow-beta-three.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:text-primary transition-colors"
              data-hover
            >
              Log in
            </a>
            <button
              className="px-5 py-2.5 bg-accent text-background text-sm font-medium rounded-full hover:bg-accent/90 transition-colors"
              data-hover
            >
              Try Beta
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            data-hover
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-white/5"
          >
            <div className="px-6 py-6 space-y-4">
              {["Features", "How It Works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-lg text-secondary hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 flex gap-3">
                <button className="flex-1 px-5 py-3 border border-white/10 text-sm rounded-full hover:bg-white/5 transition-colors">
                  Log in
                </button>
                <button className="flex-1 px-5 py-3 bg-accent text-background text-sm font-medium rounded-full">
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

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      ref={containerRef}
      className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />

      {/* Floating wardrobe items - decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-24 border border-white/5 rounded-lg bg-surface/50"
            initial={{
              x: `${20 + i * 15}%`,
              y: `${30 + (i % 2) * 20}%`,
              rotate: -5 + i * 2,
            }}
            animate={{
              y: [`${30 + (i % 2) * 20}%`, `${35 + (i % 2) * 20}%`],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{ opacity: 0.3 }}
          />
        ))}
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Beta Now Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-8"
        >
          Your closet has
          <br />
          <span className="text-accent">127 outfits.</span>
          <br />
          <span className="text-secondary">You wear 5.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          AI that abstracts your wardrobe to its essence, then recombines it
          into outfits you never knew existed. No photos needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 bg-surface border border-white/10 rounded-full text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-accent text-background font-medium rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 group"
                data-hover
              >
                Get Early Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-accent"
            >
              <Check className="w-5 h-5" />
              <span>You&apos;re on the list. Check your inbox.</span>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// ABSTRACTION SHOWCASE
// ============================================
function AbstractionShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    { label: "White Oversized Tee", variations: 8, color: "#ffffff" },
    { label: "Black Slim Tee", variations: 5, color: "#1a1a1a" },
    { label: "Navy Crewneck", variations: 4, color: "#1e3a5f" },
    { label: "Beige Chinos", variations: 3, color: "#d4b896" },
  ];

  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm uppercase tracking-widest mb-4 block">
              The Core Concept
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
              One archetype.
              <br />
              <span className="text-secondary">Infinite variations.</span>
            </h2>
            <p className="text-secondary text-lg leading-relaxed mb-8 max-w-lg">
              You don&apos;t have 15 different white t-shirts. You have one
              &quot;white oversized tee&quot; that exists in 15 forms. FitFlow
              abstracts your wardrobe to its essential building blocks, then
              shows you every possible combination.
            </p>

            <div className="space-y-3">
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  onClick={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    activeIndex === i
                      ? "bg-accent/10 border-accent/30"
                      : "bg-surface/50 border-white/5 hover:border-white/10"
                  }`}
                  whileHover={{ x: 4 }}
                  data-hover
                >
                  <div
                    className="w-10 h-10 rounded-lg border border-white/10"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <span
                      className={
                        activeIndex === i ? "text-accent" : "text-primary"
                      }
                    >
                      {item.label}
                    </span>
                    <span className="text-muted text-sm ml-2">
                      ({item.variations} items)
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-opacity ${
                      activeIndex === i
                        ? "opacity-100 text-accent"
                        : "opacity-0"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Visual representation of abstraction */}
            <div className="aspect-square relative">
              {/* Multiple items morphing into one */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    {/* Central archetype */}
                    <div
                      className="w-48 h-56 rounded-2xl border-2 border-accent/50 flex items-center justify-center relative z-10"
                      style={{
                        backgroundColor: items[activeIndex].color + "20",
                      }}
                    >
                      <div
                        className="w-32 h-40 rounded-xl"
                        style={{ backgroundColor: items[activeIndex].color }}
                      />
                    </div>

                    {/* Orbiting variations */}
                    {[...Array(items[activeIndex].variations)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-16 h-20 rounded-lg border border-white/10"
                        style={{
                          backgroundColor: items[activeIndex].color,
                          opacity: 0.3,
                        }}
                        initial={{
                          x: 0,
                          y: 0,
                        }}
                        animate={{
                          x:
                            Math.cos(
                              (i * 2 * Math.PI) / items[activeIndex].variations
                            ) * 140,
                          y:
                            Math.sin(
                              (i * 2 * Math.PI) / items[activeIndex].variations
                            ) * 140,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Background glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: items[activeIndex].color }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PROBLEM / SOLUTION
// ============================================
function ProblemSolution() {
  return (
    <section className="py-32 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
            <span className="text-red-400 text-sm uppercase tracking-widest mb-4 block">
              The Problem
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-6">
              Decision fatigue is killing your mornings.
            </h3>
            <p className="text-secondary leading-relaxed">
              The average person spends 17 minutes deciding what to wear each
              day. That&apos;s 103 hours per year staring at clothes you already
              own, wearing the same 5 outfits while 80% of your wardrobe
              collects dust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <span className="text-accent text-sm uppercase tracking-widest mb-4 block">
              The Solution
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-6">
              AI that thinks in wardrobes, not items.
            </h3>
            <p className="text-secondary leading-relaxed">
              FitFlow doesn&apos;t just match colors. It understands style
              archetypes, weather patterns, occasions, and your personal
              aesthetic. Generate complete outfits with AI visuals, save your
              favorites, and never stress about what to wear again.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES BENTO GRID
// ============================================
function FeaturesBento() {
  const features = [
    {
      title: "AI Outfit Visualization",
      description:
        "See your outfits on a model before you put them on. Google Imagen generates realistic previews of your combinations.",
      icon: Sparkles,
      size: "large",
      visual: (
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-50">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-t-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-surface-elevated rounded-t-3xl" />
          </div>
        </div>
      ),
    },
    {
      title: "No Photos Needed",
      description:
        "Quick-add system with predefined categories. Build your digital wardrobe in minutes.",
      icon: Zap,
      size: "small",
    },
    {
      title: "Weather-Aware",
      description:
        "Real-time forecasts automatically filter suggestions. Stay comfortable and stylish.",
      icon: Cloud,
      size: "small",
    },
    {
      title: "Style Presets",
      description:
        "From Minimalist to Streetwear, choose your aesthetic or create custom profiles for every version of you.",
      icon: Layers,
      size: "medium",
    },
    {
      title: "Occasion-Based",
      description:
        "Work meeting? Date night? Tell us the vibe and get outfits that fit the moment.",
      icon: Sun,
      size: "medium",
    },
  ];

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm uppercase tracking-widest mb-4 block">
            Features
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            Not another
            <br />
            <span className="text-secondary">closet app.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl bg-surface border border-white/5 hover:border-accent/30 transition-all duration-500 ${
                feature.size === "large"
                  ? "md:col-span-2 lg:col-span-2 lg:row-span-2"
                  : feature.size === "medium"
                  ? "lg:col-span-1"
                  : ""
              }`}
            >
              <div
                className={`p-8 ${feature.size === "large" ? "lg:p-12" : ""}`}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3
                  className={`font-serif tracking-tight mb-3 ${
                    feature.size === "large"
                      ? "text-3xl lg:text-4xl"
                      : "text-2xl"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
              {feature.visual && feature.visual}

              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
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
      number: "01",
      title: "Build Your Wardrobe",
      description:
        "Use our quick-add system to catalog your clothes. Select category, color, fit – no photos required. Done in minutes.",
    },
    {
      number: "02",
      title: "Set Your Style",
      description:
        "Choose from predefined aesthetics or create custom profiles. Tell us about occasions you dress for and your local weather.",
    },
    {
      number: "03",
      title: "Generate & Save",
      description:
        "Get AI-powered outfit suggestions with full visualizations. Save favorites, rate them, and build your rotation.",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-accent text-sm uppercase tracking-widest mb-4 block">
            How It Works
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            Three steps to
            <br />
            <span className="text-secondary">effortless style.</span>
          </h2>
        </motion.div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex gap-8 py-12 border-t border-white/10 first:border-t-0"
            >
              <span className="font-serif text-6xl sm:text-7xl text-accent/20">
                {step.number}
              </span>
              <div className="pt-2">
                <h3 className="font-serif text-2xl sm:text-3xl mb-3">
                  {step.title}
                </h3>
                <p className="text-secondary leading-relaxed max-w-lg">
                  {step.description}
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
// PRICING
// ============================================
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "/month",
      description: "Perfect for trying out FitFlow",
      icon: Sparkles,
      features: [
        "Up to 50 wardrobe items",
        "10 outfit generations/month",
        "Basic style profiles",
        "Weather & occasion matching",
        "Save up to 20 outfits",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "10",
      period: "/month",
      description: "For the fashion-forward",
      icon: Crown,
      features: [
        "Unlimited wardrobe items",
        "Higher generation limits",
        "Custom style profiles",
        "AI outfit visualizations",
        "Unlimited saved outfits",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Bring Your Key",
      price: "30",
      period: "one-time",
      description: "Use your own API keys",
      icon: Key,
      features: [
        "Everything in Premium",
        "Use your own LLM API key",
        "Lower monthly cost",
        "Full control over AI provider",
        "For power users",
      ],
      cta: "Learn More",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm uppercase tracking-widest mb-4 block">
            Pricing
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            Simple plans for
            <br />
            <span className="text-secondary">every style.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-accent/10 border-2 border-accent/30"
                  : "bg-surface border border-white/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-accent text-background text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlighted
                      ? "bg-accent"
                      : "bg-accent/10 border border-accent/20"
                  }`}
                >
                  <plan.icon
                    className={`w-5 h-5 ${
                      plan.highlighted ? "text-background" : "text-accent"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-xs text-muted">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="font-serif text-5xl">${plan.price}</span>
                <span className="text-muted text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-secondary"
                  >
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-accent text-background hover:bg-accent/90"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
                data-hover
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
// CTA SECTION
// ============================================
function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6">
          Ready to unlock
          <br />
          <span className="text-accent">your wardrobe?</span>
        </h2>

        <p className="text-lg text-secondary mb-10 max-w-xl mx-auto">
          Join the beta and be among the first to experience AI-powered styling.
          Your closet has been waiting.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 bg-surface border border-white/10 rounded-full text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-accent text-background font-medium rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 group"
              data-hover
            >
              Join Beta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-accent"
          >
            <Check className="w-5 h-5" />
            <span>Welcome aboard. Check your inbox soon.</span>
          </motion.div>
        )}

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Privacy-first</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Free tier forever</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent font-serif text-sm">F</span>
            </div>
            <span className="font-serif">FitFlow</span>
          </div>

          <p className="text-sm text-muted">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-muted hover:text-primary transition-colors"
              data-hover
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted hover:text-primary transition-colors"
              data-hover
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-muted hover:text-primary transition-colors"
              data-hover
            >
              Contact
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
    <main className="bg-background text-primary min-h-screen">
      <CustomCursor />
      <Navigation />
      <HeroSection />
      <AbstractionShowcase />
      <ProblemSolution />
      <FeaturesBento />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  );
}
