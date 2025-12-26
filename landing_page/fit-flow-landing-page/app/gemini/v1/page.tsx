"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Minus,
  Plus,
  Scan,
  Wind,
  Maximize2,
  ChevronRight,
  Sparkles,
  Command,
  CloudSun,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- Styles & Fonts ---
// In a real project, these would be in layout.js via next/font
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
  
  :root {
    --font-serif: 'Cormorant Garamond', serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  .text-serif { font-family: var(--font-serif); }
  .text-mono { font-family: var(--font-mono); }
`;

// --- Components ---

const Navigation = () => (
  <nav className="fixed top-0 w-full z-50 mix-blend-difference px-6 py-8 flex justify-between items-end">
    <div className="flex flex-col">
      <span className="text-white text-2xl font-semibold tracking-tighter leading-none">
        FITFLOW
      </span>
      <span className="text-white/60 text-[10px] text-mono uppercase tracking-[0.2em]">
        Systems for Style
      </span>
    </div>
    <div className="hidden md:flex gap-12 text-white/80 text-xs text-mono uppercase tracking-widest">
      <a href="#logic" className="hover:text-white transition-colors">
        The Logic
      </a>
      <a href="#archive" className="hover:text-white transition-colors">
        Archive
      </a>
      <a href="#pricing" className="hover:text-white transition-colors">
        Membership
      </a>
    </div>
    <div className="flex gap-4 items-center">
      <span className="text-white text-xs text-mono hidden sm:block">
        V.0.42 BETA
      </span>
      <div className="h-2 w-2 rounded-full bg-[#D13400] animate-pulse" />
    </div>
  </nav>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-32 overflow-hidden bg-[#F9F8F6]">
      <motion.div style={{ y: y1 }} className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-serif text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] tracking-[-0.03em] italic"
            >
              Stop wearing <br />
              <span className="not-italic text-[#121212]">the noise.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-12 text-xl md:text-2xl text-stone-600 max-w-xl leading-relaxed"
            >
              FitFlow abstracts your wardrobe into reusable formulas. No photos.
              No clutter. Just pure styling intelligence.
            </motion.p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="p-1 border border-stone-300 bg-white shadow-2xl"
            >
              <div className="p-8 bg-stone-50 border border-stone-100 flex flex-col gap-4">
                <span className="text-mono text-[10px] text-stone-400 uppercase tracking-widest">
                  Early Access Protocol
                </span>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="EMAIL_ADDRESS"
                    className="rounded-none border-stone-200 bg-transparent text-mono text-xs focus-visible:ring-[#D13400]"
                  />
                  <Button className="w-full rounded-none bg-[#121212] hover:bg-[#D13400] transition-colors text-white text-xs text-mono py-6">
                    INITIALIZE_ACCESS <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Decorative formula line */}
      <div className="absolute bottom-12 left-0 w-full px-6 flex justify-between items-end border-b border-stone-200 pb-4">
        <span className="text-mono text-[10px] text-stone-400">
          [ Wardrobe_Staple + AI_Context = Outfit_01 ]
        </span>
        <div className="flex gap-2">
          <div className="h-1 w-12 bg-[#D13400]" />
          <div className="h-1 w-4 bg-stone-200" />
        </div>
      </div>
    </section>
  );
};

const AbstractionSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const width = useTransform(scrollYProgress, [0.2, 0.5], ["100%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="logic"
      className="py-32 px-6 bg-[#121212] text-white"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-8">
          <h2 className="text-serif text-5xl md:text-7xl italic leading-none">
            The art of <br /> abstraction.
          </h2>
          <div className="max-w-md">
            <p className="text-stone-400 text-lg mb-6 text-mono text-sm leading-relaxed uppercase tracking-tight">
              Traditional apps ask for photos. We ask for intent. By reducing
              your clothing to its core architectural DNA, we generate infinite
              possibilities without the friction.
            </p>
          </div>
        </div>

        <div className="relative h-[600px] flex items-center justify-center overflow-hidden border border-white/10">
          {/* Mockup of the abstraction process */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              style={{ width }}
              className="h-[400px] bg-[url('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 z-10"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div style={{ opacity }} className="text-center">
                <div className="text-mono text-[12px] text-[#D13400] mb-4">
                  MAPPING_COORDINATES...
                </div>
                <div className="text-serif text-6xl md:text-8xl border border-white/20 p-8 backdrop-blur-md">
                  STAPLE_01
                </div>
                <div className="mt-4 text-mono text-[10px] text-stone-500 uppercase">
                  Wool / Oversized / Charcoal
                </div>
              </motion.div>
            </div>
          </div>

          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => {
  const features = [
    {
      title: "Weather Intelligence",
      desc: "Real-time atmospheric analysis determines layering complexity.",
      icon: CloudSun,
      code: "ATM_02",
    },
    {
      title: "Contextual Logic",
      desc: "From 'Gallery Opening' to 'Deep Work'. Defined by vibe, not just tags.",
      icon: Layers,
      code: "CTX_09",
    },
    {
      title: "AI Visualization",
      desc: "High-fidelity outfit previews generated on-demand.",
      icon: Sparkles,
      code: "IMG_GEN",
    },
  ];

  return (
    <section className="py-32 px-6 bg-[#F9F8F6]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-1">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ backgroundColor: "#121212", color: "#fff" }}
            className="p-12 border border-stone-200 group transition-all duration-500 flex flex-col h-[450px]"
          >
            <div className="flex justify-between items-start mb-auto">
              <span className="text-mono text-[10px] text-[#D13400]">
                {f.code}
              </span>
              <f.icon className="h-6 w-6 stroke-[1px] group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h3 className="text-serif text-4xl mb-4 italic">{f.title}</h3>
              <p className="text-stone-500 group-hover:text-stone-400 text-sm text-mono leading-relaxed">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Pricing = () => {
  const tiers = [
    {
      name: "ARCHIVE",
      price: "$0",
      items: "50 Items",
      features: ["Standard AI", "Weather Sync"],
    },
    {
      name: "CURATOR",
      price: "$12",
      items: "Unlimited",
      features: ["Pro Visuals", "Custom Contexts", "API Access"],
    },
    {
      name: "SYSTEM",
      price: "$29",
      items: "Bring Your Key",
      features: ["BYO LLM", "Local Data", "Early Features"],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 px-6 border-t border-stone-200 bg-white"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col mb-20">
          <span className="text-mono text-[10px] text-[#D13400] mb-4">
            MEMBERSHIP_TIERS
          </span>
          <h2 className="text-serif text-6xl italic">Select your protocol.</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-mono text-[10px] text-stone-400 uppercase tracking-widest">
                <th className="py-6 font-normal">Tier</th>
                <th className="py-6 font-normal">Capacity</th>
                <th className="py-6 font-normal">Investment</th>
                <th className="py-6 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-100 group hover:bg-stone-50 transition-colors"
                >
                  <td className="py-10 text-serif text-3xl italic">
                    {tier.name}
                  </td>
                  <td className="py-10 text-mono text-sm">{tier.items}</td>
                  <td className="py-10 text-mono text-sm">
                    {tier.price}
                    <span className="text-[10px] opacity-40">/MO</span>
                  </td>
                  <td className="py-10 text-right">
                    <Button
                      variant="outline"
                      className="rounded-none border-stone-300 text-mono text-[10px] px-8 hover:bg-[#121212] hover:text-white transition-all"
                    >
                      SELECT_PROTOCOL
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#121212] text-white py-24 px-6">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
        <div className="lg:col-span-2">
          <h2 className="text-serif text-5xl italic mb-8">FitFlow.</h2>
          <p className="text-stone-500 text-mono text-xs max-w-sm leading-relaxed">
            A research-led fashion laboratory focused on the intersection of
            human style and algorithmic precision.
          </p>
        </div>
        <div>
          <h4 className="text-mono text-[10px] text-stone-500 mb-6 uppercase tracking-widest">
            Legal
          </h4>
          <ul className="flex flex-col gap-4 text-xs text-mono text-stone-300">
            <li>
              <a href="#" className="hover:text-[#D13400]">
                Privacy_Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D13400]">
                Terms_of_Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D13400]">
                Cookie_Data
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-mono text-[10px] text-stone-500 mb-6 uppercase tracking-widest">
            Connect
          </h4>
          <ul className="flex flex-col gap-4 text-xs text-mono text-stone-300">
            <li>
              <a href="#" className="hover:text-[#D13400]">
                X_Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D13400]">
                Instagram_Archive
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D13400]">
                Github_Repo
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-mono text-[10px] text-stone-600">
          © 2025 FITFLOW LABORATORY. ALL RIGHTS RESERVED.
        </span>
        <div className="flex gap-4">
          <div className="px-3 py-1 border border-white/10 text-[10px] text-mono text-stone-500">
            SYSTEM_STABLE
          </div>
          <div className="px-3 py-1 border border-white/10 text-[10px] text-mono text-stone-500">
            UTC: 15:42
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <main className="selection:bg-[#D13400] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      <Navigation />
      <Hero />
      <AbstractionSection />

      {/* Problem Statement Break */}
      <section className="py-48 px-6 bg-white flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-3xl"
        >
          <span className="text-mono text-[10px] text-[#D13400] mb-8 block uppercase tracking-[0.3em]">
            The Crisis of Abundance
          </span>
          <blockquote className="text-serif text-4xl md:text-6xl italic leading-tight text-stone-800">
            "We own more but wear less. Our digital tools shouldn't add to the
            noise, they should extract the
            <span className="not-italic text-[#121212]"> essence."</span>
          </blockquote>
        </motion.div>
      </section>

      <FeatureGrid />
      <Pricing />

      {/* Final CTA */}
      <section className="h-[70vh] relative flex items-center justify-center bg-[#D13400] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="text-center z-10 px-6"
        >
          <h2 className="text-serif text-7xl md:text-9xl text-white italic mb-12">
            Ready to evolve?
          </h2>
          <Button className="rounded-none bg-white text-[#121212] hover:bg-[#121212] hover:text-white transition-all text-mono text-sm px-12 py-8 group">
            START_YOUR_FORMULA{" "}
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Abstract shapes in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] border border-white rotate-45 animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[600px] h-[600px] border border-white -rotate-12 animate-[spin_30s_linear_infinite]" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
