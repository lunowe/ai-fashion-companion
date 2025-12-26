"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  Layers,
  CloudSun,
  Calendar,
  Check,
  Menu,
  X,
  MoveRight,
  Fingerprint,
  Zap,
  Globe,
} from "lucide-react";

// --- Design System Configuration ---
// Note: In a real Next.js app, these fonts would be loaded via next/font
// We will inject a style tag for the demo to ensure the fonts render correctly.

const fontStyles = `
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,600&display=swap');

  :root {
    --font-heading: 'Clash Display', sans-serif;
    --font-body: 'Satoshi', sans-serif;
    --font-accent: 'Playfair Display', serif;
    
    --c-bg: #FDFBF7;
    --c-fg: #1A1918;
    --c-accent: #C65D46; /* Terracotta Clay */
    --c-accent-hover: #A84B36;
    --c-secondary: #EBE9E4;
    --c-green: #2D3B2D; /* Deep Forest */
    --c-blue: #3E5F7E; /* Slate */
  }

  body {
    background-color: var(--c-bg);
    color: var(--c-fg);
    font-family: var(--font-body);
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }

  .italic-accent {
    font-family: var(--font-accent);
    font-style: italic;
  }

  .grid-bg {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
  }

  .text-stroke {
    -webkit-text-stroke: 1px currentColor;
    color: transparent;
  }
`;

// --- Components ---

const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
}) => {
  const baseStyle =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-300 border border-transparent rounded-none relative overflow-hidden group";

  const variants = {
    primary: "bg-[#1A1918] text-[#FDFBF7] hover:bg-[#C65D46]",
    outline:
      "border-[#1A1918] text-[#1A1918] hover:bg-[#1A1918] hover:text-[#FDFBF7]",
    ghost: "text-[#1A1918]/60 hover:text-[#1A1918] hover:bg-[#1A1918]/5",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

const SectionHeader = ({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: React.ReactNode;
  subtitle?: string;
}) => (
  <div className="mb-16 md:mb-24 space-y-6">
    <div className="flex items-center gap-3">
      <div className="h-px w-8 bg-[#C65D46]" />
      <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#C65D46]">
        {label}
      </span>
    </div>
    <h2 className="text-4xl md:text-6xl font-semibold leading-[0.95] tracking-tight max-w-3xl">
      {title}
    </h2>
    {subtitle && (
      <p className="text-lg md:text-xl text-[#1A1918]/60 max-w-xl mt-6 leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

// --- Sections ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{fontStyles}</style>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? "bg-[#FDFBF7]/90 backdrop-blur-md border-[#1A1918]/10 py-3"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex justify-between items-center">
          <a
            href="#"
            className="font-heading font-bold text-2xl tracking-tighter flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-[#1A1918] text-[#FDFBF7] flex items-center justify-center rounded-sm">
              <span className="text-lg font-light italic-accent">f</span>
            </div>
            FitFlow
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["Philosophy", "Features", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[#1A1918]/60 hover:text-[#1A1918] transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C65D46] transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">Log In</Button>
            <Button variant="primary">Join Beta</Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-[#FDFBF7] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-heading font-medium">
              <a href="#" onClick={() => setMobileMenu(false)}>
                Philosophy
              </a>
              <a href="#" onClick={() => setMobileMenu(false)}>
                Features
              </a>
              <a href="#" onClick={() => setMobileMenu(false)}>
                Pricing
              </a>
              <hr className="border-[#1A1918]/10" />
              <Button
                className="w-full justify-between"
                onClick={() => setMobileMenu(false)}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto grid md:grid-cols-12 gap-12 items-center grid-bg">
      <div className="md:col-span-7 space-y-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 mb-6 border border-[#1A1918] rounded-full text-xs font-bold uppercase tracking-wider bg-[#FDFBF7]">
            Now in Public Beta
          </div>
          <h1 className="text-6xl md:text-8xl font-medium leading-[0.9] tracking-tight mb-8">
            Style, <br />
            <span className="italic-accent text-[#C65D46]">Abstracted.</span>
          </h1>
          <p className="text-xl text-[#1A1918]/70 max-w-xl leading-relaxed">
            The operating system for your wardrobe. We turn your chaotic closet
            into a structured database of{" "}
            <span className="font-semibold text-[#1A1918]">staple pieces</span>.
            No photos needed. Just pure style arithmetic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button className="h-14 px-8 text-base">
            Start Your Rotation <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4 px-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#FDFBF7] bg-[#EBE9E4] flex items-center justify-center text-[10px] font-bold"
                >
                  U{i}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium opacity-60">
              Joined by 2,000+ minimalists
            </span>
          </div>
        </motion.div>
      </div>

      <div className="md:col-span-5 relative h-[500px] md:h-[600px] flex items-center justify-center">
        {/* Abstract "Card" Animation */}
        <div className="relative w-full h-full perspective-1000">
          <motion.div
            animate={{
              rotateY: [0, -10, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 m-auto w-[80%] h-[80%] bg-[#1A1918] text-[#FDFBF7] p-8 flex flex-col justify-between shadow-2xl z-20"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex justify-between items-start opacity-50">
              <Fingerprint className="w-8 h-8" />
              <span className="font-mono text-xs">ID: WARD-001</span>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#FDFBF7]/20 flex items-center justify-center rounded-sm">
                <Shirt className="w-6 h-6 text-[#FDFBF7]" />
              </div>
              <div>
                <h3 className="text-3xl font-heading">Oversized Tee</h3>
                <p className="text-[#FDFBF7]/60 font-mono text-sm mt-1">
                  Weight: Heavy • Color: White
                </p>
              </div>
            </div>
            <div className="border-t border-[#FDFBF7]/20 pt-4 flex justify-between text-xs font-mono uppercase tracking-widest">
              <span>Status: Clean</span>
              <span>Matches: 12 Outfits</span>
            </div>
          </motion.div>

          {/* Background Decor Elements */}
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-[10%] right-[5%] w-[60%] h-[60%] border border-[#C65D46] z-10 opacity-60"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-[10%] left-[5%] w-[60%] h-[60%] bg-[#EBE9E4] -z-10"
          />
        </div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"],
  });

  const xMove = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section
      id="philosophy"
      ref={scrollRef}
      className="py-32 border-t border-[#1A1918]/10 bg-[#EBE9E4]/30 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <SectionHeader
          label="The Philosophy"
          title={
            <>
              Stop organizing clothes. <br />
              Start building{" "}
              <span className="italic-accent text-[#C65D46]">systems.</span>
            </>
          }
        />

        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="relative pl-8 border-l-2 border-[#1A1918]/20 group hover:border-[#C65D46] transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#C65D46] transition-colors">
                The Visual Trap
              </h3>
              <p className="text-lg text-[#1A1918]/70 leading-relaxed">
                Most apps ask you to take photos of every sock. It's tedious and
                creates visual clutter. You don't need a photo to know what a
                "Black Hoodie" looks like.
              </p>
            </div>
            <div className="relative pl-8 border-l-2 border-[#1A1918]/20 group hover:border-[#C65D46] transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#C65D46] transition-colors">
                The Abstraction Layer
              </h3>
              <p className="text-lg text-[#1A1918]/70 leading-relaxed">
                FitFlow abstracts your clothes into data points. We combine
                these points using style logic to generate outfits that work
                mathematically and aesthetically.
              </p>
            </div>
          </div>

          <div className="relative h-[400px] w-full bg-[#FDFBF7] border border-[#1A1918]/10 p-8 flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1A1918]" />

            {/* Animation of Chaos to Order */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#2D3B2D] text-white p-6 aspect-square flex flex-col justify-between cursor-default"
              >
                <span className="font-mono text-xs opacity-50">TOP</span>
                <span className="font-heading text-xl">Oxford Shirt</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#EBE9E4] text-[#1A1918] p-6 aspect-square flex flex-col justify-between cursor-default"
              >
                <span className="font-mono text-xs opacity-50">BOTTOM</span>
                <span className="font-heading text-xl">Selvedge Denim</span>
              </motion.div>
            </div>

            <div className="absolute -bottom-6 bg-[#C65D46] text-[#FDFBF7] px-6 py-2 font-mono text-sm uppercase tracking-widest shadow-xl">
              Match Score: 98%
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal marquee */}
      <motion.div
        style={{ x: xMove }}
        className="flex gap-8 mt-32 opacity-10 whitespace-nowrap"
      >
        <span className="text-9xl font-heading font-bold uppercase">
          Abstraction • System • Style • Logic •
        </span>
        <span className="text-9xl font-heading font-bold uppercase">
          Abstraction • System • Style • Logic •
        </span>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      title: "Weather Adaptive",
      desc: "Real-time logic that filters your rotation based on temperature, rain, and humidity.",
      icon: CloudSun,
      col: "md:col-span-4",
    },
    {
      title: "Occasion Context",
      desc: "From 'Boardroom' to 'Bar'. Define the vibe, and the AI adjusts the formality scale automatically.",
      icon: Layers,
      col: "md:col-span-8",
      highlight: true,
    },
    {
      title: "Visual Generator",
      desc: "Don't imagine it. See it. Our Google Imagen integration renders realistic previews on a mannequin.",
      icon: Sparkles,
      col: "md:col-span-6",
    },
    {
      title: "Smart Digitization",
      desc: "Add items in seconds via tags. No camera roll clutter.",
      icon: Zap,
      col: "md:col-span-6",
    },
  ];

  return (
    <section
      id="features"
      className="py-32 px-6 md:px-10 max-w-[1440px] mx-auto"
    >
      <SectionHeader
        label="Capabilities"
        title="A stylized brain for your closet."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className={`${f.col} min-h-[300px] border border-[#1A1918]/10 p-8 md:p-12 flex flex-col justify-between transition-all duration-500 hover:border-[#1A1918] bg-[#FDFBF7] group relative overflow-hidden`}
          >
            {f.highlight && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C65D46]/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
            )}

            <div className="w-12 h-12 bg-[#1A1918]/5 rounded-sm flex items-center justify-center mb-6 group-hover:bg-[#1A1918] transition-colors">
              <f.icon className="w-6 h-6 text-[#1A1918] group-hover:text-[#FDFBF7] transition-colors" />
            </div>

            <div>
              <h3 className="text-3xl font-heading mb-4">{f.title}</h3>
              <p className="text-[#1A1918]/60 leading-relaxed max-w-sm">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 bg-[#1A1918] text-[#FDFBF7]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="text-[#C65D46] font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
              Membership
            </span>
            <h2 className="text-5xl md:text-6xl font-heading">
              Invest in your <br />
              <span className="italic-accent text-[#FDFBF7]/50">image.</span>
            </h2>
          </div>
          <p className="text-[#FDFBF7]/60 max-w-sm text-right hidden md:block">
            Simple pricing. No hidden fees. <br />
            Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 border-t border-[#FDFBF7]/20">
          {[
            {
              name: "Essential",
              price: "0",
              features: [
                "50 Wardrobe Items",
                "Basic Style Profile",
                "Weather Sync",
              ],
            },
            {
              name: "Curator",
              price: "12",
              features: [
                "Unlimited Items",
                "AI Visualization",
                "Calendar Integration",
                "Priority Support",
              ],
              active: true,
            },
            {
              name: "API Access",
              price: "30",
              features: [
                "Bring Your Own Key",
                "Raw Data Export",
                "Custom Models",
              ],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`p-10 border-b md:border-b-0 md:border-r border-[#FDFBF7]/20 flex flex-col justify-between min-h-[500px] relative group hover:bg-[#FDFBF7]/5 transition-colors ${
                plan.active ? "bg-[#FDFBF7]/5" : ""
              }`}
            >
              {plan.active && (
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C65D46]" />
              )}

              <div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-heading">${plan.price}</span>
                  <span className="text-sm opacity-50">/mo</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm opacity-80"
                    >
                      <Check className="w-4 h-4 text-[#C65D46]" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full mt-12 ${
                  plan.active
                    ? "bg-[#FDFBF7] text-[#1A1918] hover:bg-[#C65D46] hover:text-white"
                    : "bg-transparent border border-[#FDFBF7]/20 text-[#FDFBF7] hover:border-[#FDFBF7]"
                }`}
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-20 px-6 md:px-10 border-t border-[#1A1918]/10 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
    <div>
      <h2 className="text-[12vw] font-heading leading-none text-[#1A1918] opacity-10 hover:opacity-100 transition-opacity duration-700 cursor-default">
        FITFLOW
      </h2>
      <div className="mt-8 flex gap-6 text-sm font-medium">
        <a href="#" className="hover:text-[#C65D46]">
          Instagram
        </a>
        <a href="#" className="hover:text-[#C65D46]">
          Twitter
        </a>
        <a href="#" className="hover:text-[#C65D46]">
          Email
        </a>
      </div>
    </div>

    <div className="flex flex-col items-end gap-4">
      <div className="flex items-center gap-2 text-sm opacity-50">
        <Globe className="w-4 h-4" />
        <span>Zurich, Switzerland</span>
      </div>
      <p className="text-sm opacity-50">
        © 2024 FitFlow Inc. All rights reserved.
      </p>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <main className="selection:bg-[#C65D46] selection:text-white">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <Pricing />
      <div className="py-32 px-6 flex flex-col items-center justify-center text-center bg-[#FDFBF7]">
        <h2 className="text-5xl md:text-7xl font-heading mb-8 max-w-4xl">
          Ready to automate <br /> your{" "}
          <span className="text-[#C65D46] italic-accent">aesthetic?</span>
        </h2>
        <Button className="h-16 px-12 text-lg">
          Get Early Access <MoveRight className="ml-2" />
        </Button>
      </div>
      <Footer />
    </main>
  );
}
