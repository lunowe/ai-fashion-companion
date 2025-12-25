"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Menu,
  X,
  Sparkles,
  Sun,
  CloudRain,
  Briefcase,
  Wine,
  Play,
} from "lucide-react";

// ============================================================================
// NAVIGATION
// ============================================================================
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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-background font-serif text-lg italic">f</span>
          </div>
          <span className="font-serif text-xl tracking-tight">FitFlow</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12">
          <a href="#method" className="editorial-link text-sm tracking-wide">
            Method
          </a>
          <a href="#features" className="editorial-link text-sm tracking-wide">
            Features
          </a>
          <a href="#pricing" className="editorial-link text-sm tracking-wide">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="text-sm tracking-wide editorial-link"
            onClick={() =>
              window.open("https://fit-flow-beta-three.vercel.app/", "_blank")
            }
          >
            Sign In
          </Button>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 text-sm tracking-wide"
            onClick={() =>
              window.open("https://fit-flow-beta-three.vercel.app/", "_blank")
            }
          >
            Try Beta
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
        >
          <div className="px-6 py-8 flex flex-col gap-6">
            <a
              href="#method"
              className="text-2xl font-serif"
              onClick={() => setMobileOpen(false)}
            >
              Method
            </a>
            <a
              href="#features"
              className="text-2xl font-serif"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-2xl font-serif"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1 rounded-full">
                Sign In
              </Button>
              <Button className="flex-1 bg-foreground text-background rounded-full">
                Try Beta
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

// ============================================================================
// HERO SECTION - Editorial Style
// ============================================================================
function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex flex-col justify-center pt-20 overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 editorial-grid opacity-30" />

      {/* Main content */}
      <motion.div style={{ y, opacity }} className="relative z-10 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Issue badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground border border-border rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-[var(--terracotta)] animate-pulse" />
              Beta Now Live
            </span>
          </motion.div>

          {/* Main headline - Editorial style */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-4">
            <div className="lg:col-span-8">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,12vw,9rem)] font-serif leading-[0.9] tracking-tight"
              >
                Your
                <br />
                <span className="italic text-[var(--terracotta)]">wardrobe,</span>
                <br />
                decoded.
              </motion.h1>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end pb-4">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-muted-foreground leading-relaxed max-w-sm"
              >
                150 pieces. Infinite outfits. AI that abstracts your wardrobe into a
                formula for effortless style.
              </motion.p>
            </div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "5min", label: "Average Setup" },
                { value: "∞", label: "Outfit Combinations" },
                { value: "100%", label: "Your Existing Clothes" },
                { value: "0", label: "Decision Fatigue" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-serif">{stat.value}</div>
                  <div className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12"
          >
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-14 px-8 text-base tracking-wide group"
              onClick={() =>
                window.open("https://fit-flow-beta-three.vercel.app/", "_blank")
              }
            >
              Start Your Wardrobe
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-border rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-muted-foreground rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// WARDROBE ABSTRACTION SECTION - Interactive Visualization
// ============================================================================
function AbstractionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const clothingItems = [
    { original: "Navy Crewneck Sweater", abstracted: "Dark Knit Layer" },
    { original: "White Oxford Shirt", abstracted: "Light Collared Base" },
    { original: "Beige Chinos", abstracted: "Neutral Bottom" },
    { original: "Black Leather Boots", abstracted: "Dark Structured Shoe" },
  ];

  return (
    <section
      id="method"
      ref={ref}
      className="py-32 px-6 lg:px-12 bg-secondary/30 noise-overlay"
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left: Copy */}
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              The Method
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1]">
              Every piece becomes
              <br />
              <span className="italic text-[var(--terracotta)]">its essence.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              We don&apos;t just catalog your clothes. We decode them. Each item is
              abstracted into its fundamental properties—fit, tone, texture—creating a
              universal language for style.
            </p>
          </div>

          {/* Right: Interactive abstraction */}
          <div className="space-y-4">
            {clothingItems.map((item, i) => (
              <motion.div
                key={item.original}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="group relative bg-card rounded-lg p-6 border border-border hover:border-[var(--terracotta)]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground line-through group-hover:opacity-50 transition-opacity">
                      {item.original}
                    </div>
                    <div className="text-xl font-serif mt-1 group-hover:text-[var(--terracotta)] transition-colors">
                      {item.abstracted}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--terracotta)] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PRODUCT SHOWCASE - Split Screen Demo
// ============================================================================
function ProductShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Digitize",
      description:
        "Add items in seconds. No photos needed—just select from our intelligent catalog.",
      visual: "catalog",
    },
    {
      title: "Generate",
      description:
        "AI creates cohesive outfits based on your style profile and the day ahead.",
      visual: "generate",
    },
    {
      title: "Visualize",
      description:
        "See your outfit rendered on a model before you even open your closet.",
      visual: "visualize",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-32 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            The Experience
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif">
            Style without <span className="italic">friction.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-square bg-secondary rounded-2xl overflow-hidden border border-border"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {activeTab === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-3 gap-3 p-8"
                >
                  {[
                    "T-Shirt",
                    "Sweater",
                    "Jacket",
                    "Jeans",
                    "Chinos",
                    "Shorts",
                    "Sneakers",
                    "Boots",
                    "Watch",
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square bg-card rounded-xl flex items-center justify-center border border-border text-xs text-muted-foreground hover:border-[var(--terracotta)]/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item}
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-2 border-[var(--terracotta)] border-t-transparent rounded-full mx-auto mb-6"
                  />
                  <div className="text-lg font-serif">Generating outfit...</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Analyzing style + weather + occasion
                  </div>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <div className="w-48 h-72 bg-gradient-to-b from-muted to-secondary rounded-xl border border-border flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-background/80 mx-auto mb-4 flex items-center justify-center">
                        <Play className="w-6 h-6 text-[var(--terracotta)]" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        AI Visualization
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {tabs.map((tab, i) => (
              <motion.div
                key={tab.title}
                onClick={() => setActiveTab(i)}
                className={`p-8 rounded-xl border cursor-pointer transition-all ${
                  activeTab === i
                    ? "bg-card border-[var(--terracotta)]/30"
                    : "bg-transparent border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span
                    className={`font-mono text-sm ${
                      activeTab === i
                        ? "text-[var(--terracotta)]"
                        : "text-muted-foreground"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3
                      className={`text-2xl font-serif mb-2 ${
                        activeTab === i ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tab.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        activeTab === i
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES BENTO GRID - Editorial Layout
// ============================================================================
function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Sun,
      title: "Weather-Aware",
      description:
        "Real-time forecasts filter your suggestions. Never freeze in style again.",
      size: "normal",
    },
    {
      icon: Briefcase,
      title: "Occasion-Based",
      description: "From boardroom to bar, get outfits that match the moment.",
      size: "normal",
    },
    {
      icon: Sparkles,
      title: "AI Visualization",
      description:
        "See your outfit on a model before you wear it. Powered by Google Imagen.",
      size: "large",
    },
    {
      icon: CloudRain,
      title: "Smart Layering",
      description: "Automatic layering suggestions based on temperature drops.",
      size: "normal",
    },
    {
      icon: Wine,
      title: "Style Profiles",
      description: "Save and switch between different style personas.",
      size: "normal",
    },
  ];

  return (
    <section ref={ref} className="py-32 px-6 lg:px-12 bg-foreground text-background">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase opacity-60">
            Capabilities
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif">
            Built for the <span className="italic">real world.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className={`p-8 rounded-xl border border-background/10 bg-background/5 hover:bg-background/10 transition-colors ${
                feature.size === "large" ? "lg:col-span-2" : ""
              }`}
            >
              <feature.icon className="h-8 w-8 mb-6 text-[var(--terracotta)]" />
              <h3 className="text-xl font-serif mb-3">{feature.title}</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOCIAL PROOF - Testimonial Marquee
// ============================================================================
function SocialProof() {
  const testimonials = [
    {
      quote: "Finally, an app that gets how I actually dress.",
      author: "Sarah K.",
      role: "Designer",
    },
    {
      quote: "Cut my morning routine in half. Genuinely life-changing.",
      author: "Marcus T.",
      role: "Product Manager",
    },
    {
      quote: "The AI visualization feature is magic. Pure magic.",
      author: "Elena R.",
      role: "Photographer",
    },
    {
      quote: "I rediscovered half my wardrobe thanks to FitFlow.",
      author: "James L.",
      role: "Architect",
    },
  ];

  return (
    <section className="py-24 overflow-hidden border-y border-border">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-8"
      >
        {[...testimonials, ...testimonials, ...testimonials].map(
          (testimonial, i) => (
            <div key={i} className="flex-shrink-0 w-[400px] p-8">
              <p className="text-2xl font-serif leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary" />
                <div>
                  <div className="text-sm font-medium">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </motion.div>
    </section>
  );
}

// ============================================================================
// PRICING SECTION - Editorial Cards
// ============================================================================
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "/month",
      description: "Perfect for exploring",
      features: [
        "50 wardrobe items",
        "10 outfit generations/month",
        "Basic style profiles",
        "Weather matching",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "10",
      period: "/month",
      description: "For the style-conscious",
      features: [
        "Unlimited items",
        "Higher generation limits",
        "AI visualizations",
        "Custom style profiles",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "BYOK",
      price: "30",
      period: "one-time",
      description: "Bring your own API key",
      features: [
        "Everything in Premium",
        "Use your own LLM API",
        "Full control",
        "For power users",
      ],
      cta: "Learn More",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-32 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif">
            Simple, <span className="italic">transparent.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className={`p-8 rounded-xl border ${
                plan.highlighted
                  ? "border-[var(--terracotta)]/30 bg-[var(--terracotta)]/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-lg font-serif">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-serif">${plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-[var(--terracotta)] shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full ${
                  plan.highlighted
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-transparent border border-border hover:bg-secondary"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION - Large Editorial
// ============================================================================
function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section ref={ref} className="py-32 px-6 lg:px-12 bg-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-8">
          Ready to decode
          <br />
          <span className="italic text-[var(--terracotta)]">your wardrobe?</span>
        </h2>

        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          Join thousands discovering new ways to wear what they already own.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 px-6 rounded-full bg-card border-border text-base"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full text-base"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 text-lg font-serif"
          >
            <Check className="h-6 w-6 text-[var(--terracotta)]" />
            You&apos;re in. Check your inbox soon.
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

// ============================================================================
// FOOTER - Minimal Editorial
// ============================================================================
function Footer() {
  return (
    <footer className="py-16 px-6 lg:px-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-background font-serif text-lg italic">f</span>
              </div>
              <span className="font-serif text-xl">FitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              AI-powered styling that abstracts your wardrobe into a formula for
              effortless style.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Beta Access"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors editorial-link"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors editorial-link"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "Instagram", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors editorial-link"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function Home() {
  return (
    <main className="relative noise-overlay">
      <Navigation />
      <HeroSection />
      <AbstractionSection />
      <ProductShowcase />
      <FeaturesGrid />
      <SocialProof />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
