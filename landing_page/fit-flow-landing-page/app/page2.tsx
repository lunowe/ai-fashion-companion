"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  CloudSun,
  Zap,
  Check,
  Layers,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have standard shadcn utils

// --- UI Components (Simplified Shadcn-like for portability) ---

const Button = ({
  className,
  variant = "primary",
  children,
  ...props
}: any) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };
  return (
    <button
      className={cn(
        base,
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className }: any) => (
  <div
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      className
    )}
  >
    {children}
  </div>
);

// --- Sections ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight">FitFlow</span>
    </div>
    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
      <a href="#features" className="hover:text-foreground transition-colors">
        Features
      </a>
      <a
        href="#how-it-works"
        className="hover:text-foreground transition-colors"
      >
        How it works
      </a>
      <a href="#pricing" className="hover:text-foreground transition-colors">
        Pricing
      </a>
    </div>
    <div className="flex gap-4">
      <Button variant="ghost" className="hidden sm:flex">
        Log in
      </Button>
      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
        Get Early Access
      </Button>
    </div>
  </nav>
);

const Hero = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Hook up to DB or Resend
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
            v1.0 Beta is here
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
            Your Wardrobe, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Reimagined by AI.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Stop staring at your closet. FitFlow digitizes your wardrobe and
          generates perfect outfits for any weather, occasion, or mood using
          advanced abstraction algorithms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 shrink-0"
              >
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-full border border-green-200">
              <Check className="w-4 h-4" /> You're on the list!
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

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

const PricingCard = ({ tier, price, features, recommended, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className={cn(
      "flex flex-col p-8 rounded-2xl border bg-background relative",
      recommended
        ? "border-purple-500 ring-1 ring-purple-500 shadow-lg"
        : "border-border"
    )}
  >
    {recommended && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
        Most Popular
      </span>
    )}
    <div className="mb-8">
      <h3 className="text-lg font-medium text-muted-foreground">{tier}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        {price !== "Free" &&
          // if tier Pay as You Go, show one time
          (tier === "Pay as You Go" ? (
            <span className="ml-1 text-muted-foreground">one time</span>
          ) : (
            <span className="ml-1 text-muted-foreground">/mo</span>
          ))}
      </div>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          <Check className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      variant={recommended ? "primary" : "outline"}
      className={
        recommended ? "bg-purple-600 hover:bg-purple-700 w-full" : "w-full"
      }
    >
      {recommended ? "Get Started" : "Join Waitlist"}
    </Button>
  </motion.div>
);

const Pricing = () => (
  <section id="pricing" className="py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground">
          Start organizing your style for free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard
          tier="Starter"
          price="Free"
          features={[
            "Digital Wardrobe (up to 50 items)",
            "Basic Outfit Generation",
            "Weather Integration",
            "Mobile Support",
          ]}
          delay={0.1}
        />
        <PricingCard
          tier="Pro"
          price="$10"
          recommended={true}
          features={[
            "Unlimited Wardrobe",
            "AI Image Visualization (50/mo)",
            "Advanced 'Style This' Feature",
            "Priority Support",
            "Early Access Features",
          ]}
          delay={0.2}
        />
        <PricingCard
          tier="Pay as You Go"
          price="$30"
          features={[
            "Bring Your Own API Keys",
            "Access to LLM Settings",
            "Unlimited Generations (Your cost)",
            "Debug Mode",
            "Direct Feedback Line",
          ]}
          delay={0.3}
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 px-6 border-t border-border bg-muted/20">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <span className="font-bold text-lg">FitFlow</span>
      </div>
      <div className="text-sm text-muted-foreground text-center md:text-right">
        <p>&copy; 2024 FitFlow. All rights reserved.</p>
        <p className="mt-1">Built by a dev with too many clothes.</p>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-100 selection:text-purple-900">
      <Navbar />
      <Hero />
      <BentoGrid />
      <Pricing />
      <Footer />
    </div>
  );
}
