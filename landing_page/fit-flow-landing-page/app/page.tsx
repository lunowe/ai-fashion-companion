"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Shirt,
  Palette,
  Cloud,
  Calendar,
  Zap,
  Check,
  ArrowRight,
  Key,
  Crown,
  Menu,
  X,
  CloudSun,
  Layers,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, FormEvent } from "react";
import { cn } from "@/lib/utils"; // Assuming you have standard shadcn utils

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Navigation
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-fitflow flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-fitflow-foreground" />
          </div>
          <span className="font-semibold text-lg">FitFlow</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="bg-fitflow hover:bg-fitflow/90 text-fitflow-foreground"
          >
            Try Beta
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                Log in
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-fitflow hover:bg-fitflow/90 text-fitflow-foreground"
              >
                Try Beta
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // TODO: Connect to your email capture backend
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} className="">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-fitflow-muted text-fitflow border-fitflow/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Beta Now Live
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Stop staring at
            <br />
            <span className="text-fitflow">your closet.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered outfit suggestions based on what you already own.
            <br className="hidden sm:block" />
            Smart styling, simplified.
          </motion.p>

          <motion.div variants={fadeUp} className="pt-4">
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 bg-card border-border/50 focus:border-fitflow"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 bg-fitflow hover:bg-fitflow/90 text-fitflow-foreground font-medium"
                >
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-fitflow font-medium"
              >
                <Check className="h-5 w-5" />
                You&apos;re on the list! We&apos;ll be in touch soon.
              </motion.div>
            )}
          </motion.div>

          {/* App Preview Placeholder */}
          <motion.div
            variants={scaleIn}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-12"
          >
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-fitflow/5">
                <div className="aspect-16/10 bg-linear-to-br from-fitflow-muted via-card to-muted flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="flex justify-center gap-4">
                      {[Shirt, Palette, Sparkles].map((Icon, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="h-16 w-16 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center border border-border/50"
                        >
                          <Icon className="h-7 w-7 text-fitflow" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      App preview placeholder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Problem/Solution Section
function ProblemSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-12 md:gap-16"
        >
          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-sm font-medium text-fitflow uppercase tracking-wider">
              The Problem
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Your wardrobe is full, but you have nothing to wear.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;ve all been there. Standing in front of a closet full of
              clothes, unable to put together an outfit. You end up wearing the
              same thing over and over, while great pieces sit unworn.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-sm font-medium text-fitflow uppercase tracking-wider">
              The Solution
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              AI that knows your wardrobe better than you do.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              FitFlow learns your style, understands your clothes, and generates
              personalized outfits for any occasion. No more decision fatigue.
              Just smart suggestions, ready when you are.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const FeatureCard = ({ title, desc, icon: Icon, className, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className={cn(
      "p-6 rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition-all shadow-sm",
      className
    )}
  >
    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{desc}</p>
  </motion.div>
);

const BentoGrid = () => (
  <section id="features" className="py-24 px-6 bg-secondary/30">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Not just another closet app.
        </h2>
        <p className="text-muted-foreground text-lg">
          Built with abstraction principles, not just trend matching.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* Large Card */}
        <FeatureCard
          className="md:col-span-2 md:row-span-2 flex flex-col justify-center"
          title="AI-Powered Outfit Visualization"
          desc="Don't just imagine it. See it. Our Google Imagen integration generates realistic previews of your outfits on a model, helping you decide before you even open your drawer."
          icon={Sparkles}
          delay={0.1}
        />

        {/* Small Cards */}
        <FeatureCard
          title="Smart Digitization"
          desc="Add items in seconds. We categorize by fit, color, and abstraction layer automatically."
          icon={Shirt}
          delay={0.2}
        />
        <FeatureCard
          title="Weather Adaptive"
          desc="Real-time forecasts automatically filter your suggestions. No more freezing in style."
          icon={CloudSun}
          delay={0.3}
        />

        {/* Medium Card */}
        <FeatureCard
          className="md:col-span-3"
          title="Contextual Stylist"
          desc="Occasion-based filtering ensures you never look out of place. From 'Office Casual' to 'Friday Night Out', get suggestions that actually make sense."
          icon={Layers}
          delay={0.4}
        />
      </div>
    </div>
  </section>
);

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Shirt,
      title: "Smart Wardrobe",
      description:
        "Easily catalog your clothes with our intuitive quick-add system. Build your digital wardrobe in minutes, not hours.",
    },
    {
      icon: Sparkles,
      title: "AI Outfit Generation",
      description:
        "Get personalized outfit suggestions powered by AI. Mix and match pieces you didn't know worked together.",
    },
    {
      icon: Palette,
      title: "Style Profiles",
      description:
        "Define your personal style with predefined or custom profiles. From minimalist to streetwear, we adapt to you.",
    },
    {
      icon: Cloud,
      title: "Weather-Aware",
      description:
        "Outfits that make sense for the forecast. No more freezing in cute fits or sweating through layers.",
    },
    {
      icon: Calendar,
      title: "Occasion-Based",
      description:
        "Work meeting? Date night? Casual Friday? Tell us the vibe and get outfits that fit the moment.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description:
        "Generate multiple outfit options in seconds. Save your favorites and come back to them anytime.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium text-fitflow uppercase tracking-wider mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold"
          >
            Everything you need to
            <br />
            <span className="text-fitflow">style smarter</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="h-full p-6 bg-card/50 border-border/50 hover:border-fitflow/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-fitflow-muted flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-fitflow" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Build Your Wardrobe",
      description:
        "Add your clothes using our quick-add system. Select from categories, pick colors, and build your digital closet fast.",
    },
    {
      number: "02",
      title: "Set Your Style",
      description:
        "Choose your style preferences, occasions, and weather. The AI adapts to your taste and real-world needs.",
    },
    {
      number: "03",
      title: "Get Styled",
      description:
        "Generate AI-powered outfits instantly. Save your favorites, visualize them, and never stress about what to wear again.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium text-fitflow uppercase tracking-wider mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold"
          >
            Three steps to
            <br />
            <span className="text-fitflow">better outfits</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="space-y-8"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex gap-6 items-start"
            >
              <div className="shrink-0 h-14 w-14 rounded-2xl bg-fitflow-muted flex items-center justify-center">
                <span className="text-fitflow font-bold text-lg">
                  {step.number}
                </span>
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "0",
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
      description: "For the fashion-forward",
      icon: Crown,
      features: [
        "Unlimited wardrobe items",
        "Higher outfit generation limits",
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
    <section id="pricing" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium text-fitflow uppercase tracking-wider mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold"
          >
            Simple plans for
            <br />
            <span className="text-fitflow">every style</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card
                className={`h-full p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-fitflow bg-fitflow-muted/30"
                    : "bg-card/50 border-border/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      plan.highlighted ? "bg-fitflow" : "bg-fitflow-muted"
                    }`}
                  >
                    <plan.icon
                      className={`h-5 w-5 ${
                        plan.highlighted
                          ? "text-fitflow-foreground"
                          : "text-fitflow"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {/* if bring your key, show one time fee */}
                  {plan.name === "Bring Your Key" ? (
                    <span className="text-sm text-muted-foreground ml-1">
                      one-time payment
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 grow">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-fitflow shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-fitflow hover:bg-fitflow/90 text-fitflow-foreground"
                      : ""
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Footer Section
function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-24 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
        >
          Ready to
          <span className="text-fitflow"> dress smarter?</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
        >
          Join the beta and be among the first to experience AI-powered styling.
          Your wardrobe is waiting.
        </motion.p>

        <motion.div variants={fadeUp}>
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 bg-card border-border/50 focus:border-fitflow"
                required
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-fitflow hover:bg-fitflow/90 text-fitflow-foreground font-medium"
              >
                Join the Beta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-fitflow font-medium"
            >
              <Check className="h-5 w-5" />
              Welcome aboard! Check your inbox soon.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-fitflow flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-fitflow-foreground" />
          </div>
          <span className="text-sm font-medium">FitFlow</span>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} FitFlow. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <BentoGrid />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
