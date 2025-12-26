"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  CloudSun,
  Crown,
  Key,
  Layers,
  Menu,
  Palette,
  Shirt,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * Copy tokens — keep placeholders for easy find/replace,
 * but render good defaults if still untouched.
 */
const COPY = {
  primaryCta: "<primary_cta>",
  secondaryCta: "<secondary_cta>",
};
const primaryLabel =
  COPY.primaryCta === "<primary_cta>" ? "Request Beta Invite" : COPY.primaryCta;
const secondaryLabel =
  COPY.secondaryCta === "<secondary_cta>" ? "See Live Beta" : COPY.secondaryCta;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: d },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (d = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: [0.2, 0.8, 0.2, 1], delay: d },
  }),
};

/** Intersection Observer hook (explicit) */
function useReveal<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px", ...(opts ?? {}) }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [opts]);

  return { ref, inView };
}

/** Magnetic wrapper for CTAs (micro-interaction) */
function MagneticButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const rm = useReducedMotion();

  useEffect(() => {
    if (rm) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.06}px, ${y * 0.08}px)`;
    };
    const onLeave = () => {
      el.style.transform = `translate(0px, 0px)`;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [rm]);

  return (
    <Button
      ref={ref}
      className={cn("transition-transform will-change-transform", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Cursor-follow spotlight (interactive background without blobs) */
function useSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return ref;
}

/** Navigation */
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "#story", label: "Story" },
    { href: "#showcase", label: "Product" },
    { href: "#proof", label: "Proof" },
    { href: "#tech", label: "Tech" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="group flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Sparkles className="h-4 w-4 ff-accent" />
            <span
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,.10), 0 0 28px rgba(182,255,77,.18)",
              }}
            />
          </div>
          <div className="leading-none">
            <div className="ff-display text-base font-semibold tracking-tight">
              FitFlow
            </div>
            <div className="ff-mono text-[10px] text-muted-foreground">
              editorial beta
            </div>
          </div>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[rgb(var(--ff-accent))] after:transition-all hover:after:w-full">
                {l.label}
              </span>
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              window.open("https://fit-flow-beta-three.vercel.app/", "_blank")
            }
          >
            Log in
          </Button>
          <MagneticButton
            size="sm"
            className="ff-accent-bg text-black hover:opacity-90"
          >
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </MagneticButton>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 bg-background/85 backdrop-blur-xl md:hidden"
        >
          <div className="px-5 py-4">
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-white/15 bg-transparent"
                  onClick={() =>
                    window.open(
                      "https://fit-flow-beta-three.vercel.app/",
                      "_blank"
                    )
                  }
                >
                  Log in
                </Button>
                <Button className="ff-accent-bg text-black hover:opacity-90">
                  {primaryLabel}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

/** Ambient microtype “particles” (subtle motion, no blobs) */
function AmbientMicrotype() {
  const rm = useReducedMotion();
  const tags = [
    "WHITE TEE / OVERSIZED",
    "BLACK DENIM / STRAIGHT",
    "LEATHER LOAFER",
    "TRUCKER JACKET",
    "SILK SCARF",
    "TONAL LAYERS",
    "CONTRAST STITCH",
    "OFF-DUTY TAILORING",
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="ff-grain absolute inset-0" />
      </div>

      {tags.map((t, i) => (
        <motion.div
          key={t}
          initial={{ opacity: 0, y: 10 }}
          animate={
            rm
              ? { opacity: 0.6 }
              : {
                  opacity: 0.6,
                  y: [0, -14, 0],
                }
          }
          transition={{
            duration: 7 + i,
            repeat: rm ? 0 : Infinity,
            ease: "easeInOut",
            delay: 0.2 + i * 0.08,
          }}
          className="absolute ff-mono text-[11px] tracking-[0.22em] text-white/30"
          style={{
            left: `${8 + ((i * 11) % 82)}%`,
            top: `${12 + ((i * 9) % 78)}%`,
          }}
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
}

/** Hero interactive: Outfit DNA composer */
type Occasion = "Office" | "Date" | "Weekend";
type Weather = "Cold" | "Mild" | "Hot";
type Style = "Minimal" | "Street" | "Tailored";

type OutfitItem = {
  concrete: string;
  abstract: string;
};

type Outfit = {
  label: string;
  items: [OutfitItem, OutfitItem, OutfitItem];
  note: string;
};

function lerpLabel(a: string, b: string, t: number) {
  // Simple “morph” by switching around midpoint (clean + readable)
  return t < 0.5 ? a : b;
}

function OutfitDNA() {
  const [occasion, setOccasion] = useState<Occasion>("Office");
  const [weather, setWeather] = useState<Weather>("Mild");
  const [style, setStyle] = useState<Style>("Minimal");
  const [abstraction, setAbstraction] = useState(0.65);
  const [seed, setSeed] = useState(1);

  const spotlightRef = useSpotlight();

  const catalog = useMemo(() => {
    const base: Record<string, Outfit[]> = {
      "Office|Mild|Minimal": [
        {
          label: "Crisp, quiet confidence",
          items: [
            {
              concrete: "Oxford shirt (light blue)",
              abstract: "light blue button-up",
            },
            {
              concrete: "Straight black denim",
              abstract: "black straight jean",
            },
            { concrete: "Leather loafers", abstract: "polished loafer" },
          ],
          note: "Neutral spine + one clean silhouette.",
        },
        {
          label: "Soft structure",
          items: [
            { concrete: "Fine knit crewneck", abstract: "tonal knit layer" },
            {
              concrete: "Pleated trouser (charcoal)",
              abstract: "charcoal trouser",
            },
            { concrete: "Minimal sneaker", abstract: "sleek low-top" },
          ],
          note: "Office-safe, not corporate.",
        },
        {
          label: "The 2-minute uniform",
          items: [
            {
              concrete: "White tee (heavyweight)",
              abstract: "white oversized tee",
            },
            {
              concrete: "Blazer (unstructured)",
              abstract: "soft blazer layer",
            },
            { concrete: "Derby shoes", abstract: "clean lace-up" },
          ],
          note: "Looks intentional. Feels effortless.",
        },
      ],
      "Office|Cold|Tailored": [
        {
          label: "Runway meeting",
          items: [
            { concrete: "Turtleneck (black)", abstract: "black base layer" },
            { concrete: "Wool trouser", abstract: "tailored trouser" },
            { concrete: "Chelsea boots", abstract: "sleek boot" },
          ],
          note: "Sharp lines, warm core.",
        },
        {
          label: "Monochrome armor",
          items: [
            { concrete: "Topcoat (mid-length)", abstract: "long coat layer" },
            { concrete: "Dark denim", abstract: "dark straight jean" },
            { concrete: "Leather boots", abstract: "grounding boot" },
          ],
          note: "No loudness, all presence.",
        },
        {
          label: "Texture speaks",
          items: [
            { concrete: "Chunky knit (oat)", abstract: "textured knit" },
            { concrete: "Cord trouser", abstract: "structured bottom" },
            { concrete: "Loafers + socks", abstract: "loafer silhouette" },
          ],
          note: "Tactile > trendy.",
        },
      ],
      "Date|Mild|Tailored": [
        {
          label: "Clean flirt",
          items: [
            { concrete: "Silk camp-collar", abstract: "fluid statement top" },
            { concrete: "Black trouser", abstract: "clean trouser" },
            { concrete: "Low profile boot", abstract: "sleek boot" },
          ],
          note: "Quiet drama, close up.",
        },
        {
          label: "High-contrast classic",
          items: [
            { concrete: "White tee + chain", abstract: "bright base layer" },
            { concrete: "Leather jacket", abstract: "icon outer layer" },
            { concrete: "Straight denim", abstract: "balanced denim" },
          ],
          note: "A classic for a reason.",
        },
        {
          label: "The after-hours blazer",
          items: [
            { concrete: "Blazer (black)", abstract: "dark blazer" },
            { concrete: "Tank/tee base", abstract: "minimal base" },
            { concrete: "Wide trouser", abstract: "roomy trouser" },
          ],
          note: "Silhouette does the talking.",
        },
      ],
      "Weekend|Hot|Street": [
        {
          label: "Heat-proof cool",
          items: [
            { concrete: "Boxy tee (cream)", abstract: "light boxy tee" },
            { concrete: "Nylon short", abstract: "technical short" },
            { concrete: "Retro runner", abstract: "breathable sneaker" },
          ],
          note: "Airflow + attitude.",
        },
        {
          label: "City walk kit",
          items: [
            { concrete: "Cap + tee", abstract: "top essentials" },
            { concrete: "Cargo (light)", abstract: "utility bottom" },
            { concrete: "Sandal/slide", abstract: "easy footwear" },
          ],
          note: "Hands free, mind free.",
        },
        {
          label: "One bold detail",
          items: [
            { concrete: "Graphic tee (favorite)", abstract: "statement tee" },
            { concrete: "Black short", abstract: "dark short" },
            { concrete: "White sneaker", abstract: "clean sneaker" },
          ],
          note: "Let one thing speak.",
        },
      ],
    };

    // Simple fallback stitching if a combo isn't defined
    const fallback: Outfit[] = [
      {
        label: "A solid default",
        items: [
          { concrete: "White tee", abstract: "white base layer" },
          { concrete: "Straight denim", abstract: "straight denim" },
          { concrete: "Clean sneaker", abstract: "sleek sneaker" },
        ],
        note: "We’ll learn your closet — this is the baseline.",
      },
      {
        label: "Layered balance",
        items: [
          { concrete: "Shirt overshirt", abstract: "mid-layer shirt" },
          { concrete: "Neutral trouser", abstract: "neutral bottom" },
          { concrete: "Loafer", abstract: "polished shoe" },
        ],
        note: "A shape you can repeat forever.",
      },
      {
        label: "Texture swap",
        items: [
          { concrete: "Knit top", abstract: "textured top" },
          { concrete: "Dark denim", abstract: "dark denim" },
          { concrete: "Boot", abstract: "grounding boot" },
        ],
        note: "Texture does the heavy lifting.",
      },
    ];

    return { base, fallback };
  }, []);

  const list = useMemo(() => {
    const key = `${occasion}|${weather}|${style}`;
    const chosen = catalog.base[key] ?? catalog.fallback;
    // deterministic “shuffle” via seed
    const rotated = [
      ...chosen.slice(seed % chosen.length),
      ...chosen.slice(0, seed % chosen.length),
    ];
    return rotated.slice(0, 3);
  }, [occasion, weather, style, catalog, seed]);

  return (
    <div
      ref={spotlightRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.55)]"
      )}
      style={{
        backgroundImage:
          "radial-gradient(600px 260px at var(--mx,50%) var(--my,35%), rgba(182,255,77,0.14), transparent 60%)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="ff-mono text-[11px] tracking-[0.22em] text-white/50">
            OUTFIT DNA / LIVE
          </div>
          <div className="ff-display mt-1 text-xl font-semibold tracking-tight">
            Abstraction → outfits you can reuse.
          </div>
        </div>

        <Button
          variant="outline"
          className="border-white/15 bg-transparent hover:bg-white/5"
          onClick={() => setSeed((s) => s + 1)}
        >
          Generate
          <Zap className="ml-2 h-4 w-4 ff-accent" />
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Selector
          label="Occasion"
          value={occasion}
          options={["Office", "Date", "Weekend"]}
          onChange={(v) => setOccasion(v as Occasion)}
        />
        <Selector
          label="Weather"
          value={weather}
          options={["Cold", "Mild", "Hot"]}
          onChange={(v) => setWeather(v as Weather)}
        />
        <Selector
          label="Style"
          value={style}
          options={["Minimal", "Street", "Tailored"]}
          onChange={(v) => setStyle(v as Style)}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
            ABSTRACTION LEVEL
          </div>
          <div className="ff-mono text-[11px] text-white/55">
            {Math.round(abstraction * 100)}%
          </div>
        </div>

        <input
          aria-label="Abstraction level"
          type="range"
          min={0}
          max={100}
          value={Math.round(abstraction * 100)}
          onChange={(e) => setAbstraction(Number(e.target.value) / 100)}
          className="mt-3 w-full accent-[rgb(var(--ff-accent))]"
        />
      </div>

      <div className="mt-5 grid gap-3">
        {list.map((o, idx) => (
          <motion.div
            key={`${o.label}-${idx}-${seed}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 * idx }}
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="ff-display text-lg font-semibold tracking-tight">
                  {o.label}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {o.note}
                </div>
              </div>
              <div className="ff-mono text-[11px] text-white/50">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {o.items.map((it, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-black/25 p-3"
                >
                  <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
                    LAYER {i + 1}
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {lerpLabel(it.concrete, it.abstract, abstraction)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
              <span className="inline-block h-1.5 w-1.5 rounded-full ff-accent-bg" />
              Visualize in-app (beta)
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
        {label.toUpperCase()}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                active
                  ? "ff-accent-bg text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** HERO */
function Hero() {
  const rm = useReducedMotion();

  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-24 sm:pt-28">
      <AmbientMicrotype />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.0}
            variants={fadeUp}
          >
            <Badge className="border border-white/10 bg-white/5 text-white/80">
              <Sparkles className="mr-2 h-3.5 w-3.5 ff-accent" />
              Beta now live • privacy-first wardrobe
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className={cn(
              "ff-display mt-6 text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.98] tracking-tight"
            )}
          >
            Your closet
            <span className="block">
              is a dataset.
              <span className="ff-accent"> Dress like it.</span>
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.4}
            variants={fadeUp}
            className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            <span className="text-white/85 font-medium">
              Outfits, distilled from what you already own.
            </span>{" "}
            FitFlow abstracts your wardrobe into reusable staples—then builds
            looks for weather, occasion, and your taste.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.6}
            variants={fadeUp}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MagneticButton
              size="lg"
              className="ff-accent-bg text-black hover:opacity-90"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>

            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent hover:bg-white/5"
              onClick={() => {
                const el = document.querySelector("#showcase");
                el?.scrollIntoView({ behavior: rm ? "auto" : "smooth" });
              }}
            >
              Watch it work
              <Smartphone className="ml-2 h-4 w-4 ff-accent" />
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.8}
            variants={fadeUp}
            className="mt-8"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TrustChip
                icon={Key}
                title="Data stays yours"
                desc="No resale model."
              />
              <TrustChip
                icon={Check}
                title="Fast onboarding"
                desc="No photos required."
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/45">
              <span className="ff-mono tracking-[0.22em]">TRUSTED BY</span>
              {[
                "MONO STUDIO",
                "DAYBREAK ATELIER",
                "NORTHWIND LABS",
                "RUNWAY CLUB",
              ].map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 ff-mono tracking-[0.18em]"
                >
                  {l}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.5}
          variants={scaleIn}
          className="relative"
        >
          <OutfitDNA />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function TrustChip({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 ff-accent" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white/90">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </div>
    </div>
  );
}

/** STORY (Problem/Solution narrative, scroll reveals) */
function Story() {
  const a = useReveal<HTMLDivElement>();
  const b = useReveal<HTMLDivElement>();
  const c = useReveal<HTMLDivElement>();

  return (
    <section id="story" className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
              STORY / NOT FEATURES
            </div>
            <h2 className="ff-display mt-4 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.05]">
              The closet isn’t empty.
              <span className="block text-white/70">Your decisions are.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
              Most apps treat your wardrobe like a pile of items. FitFlow treats
              it like a system—staples, silhouettes, and repeatable formulas.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                REAL WORLD SCENE
              </div>
              <div className="mt-3 space-y-3 text-sm text-white/70">
                <div className="flex gap-3">
                  <span className="ff-mono text-white/45">08:03</span>
                  <span>Closet paralysis. You default to “safe”. Again.</span>
                </div>
                <div className="flex gap-3">
                  <span className="ff-mono text-white/45">08:06</span>
                  <span>
                    A good piece stays unworn—because pairing is hard.
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="ff-mono text-white/45">08:08</span>
                  <span>
                    You leave… slightly underdressed, slightly annoyed.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <StoryCard
              refObj={a.ref}
              show={a.inView}
              time="THE PROBLEM"
              title="Too many items. Not enough structure."
              body="A closet full of specifics doesn’t automatically become outfits. You need a repeatable language: silhouettes, tones, and anchors."
              icon={Layers}
              index={0}
            />
            <StoryCard
              refObj={b.ref}
              show={b.inView}
              time="THE SHIFT"
              title="Abstraction turns clutter into a system."
              body="FitFlow compresses your wardrobe into staple “atoms” (e.g., “white oversized tee”). Now pairing becomes consistent—and fast."
              icon={Sparkles}
              index={1}
            />
            <StoryCard
              refObj={c.ref}
              show={c.inView}
              time="THE RESULT"
              title="Outfits that match your day, not a trend."
              body="Weather + occasion + your style profile. Suggestions you actually wear—then improve through feedback."
              icon={CloudSun}
              index={2}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCard({
  refObj,
  show,
  time,
  title,
  body,
  icon: Icon,
  index,
}: {
  refObj: React.RefObject<HTMLDivElement | null>;
  show: boolean;
  time: string;
  title: string;
  body: string;
  icon: any;
  index: number;
}) {
  return (
    <motion.div
      ref={refObj as any}
      initial={{ opacity: 0, y: 18 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: 0.05 * index,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className="h-5 w-5 ff-accent" />
        </div>
        <div className="min-w-0">
          <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
            {time}
          </div>
          <div className="ff-display mt-2 text-xl font-semibold tracking-tight">
            {title}
          </div>
          <div className="mt-2 text-muted-foreground leading-relaxed">
            {body}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(182,255,77,0.18), transparent 60%)",
          filter: "blur(0px)",
          opacity: 0.8,
        }}
      />
    </motion.div>
  );
}

/** PRODUCT SHOWCASE (animated mock + technical credibility) */
function Showcase() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="showcase" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
              PRODUCT / IN MOTION
            </div>
            <h2 className="ff-display mt-4 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.05]">
              A lookbook that writes itself.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
              You don’t photograph your entire wardrobe. You describe it once.
              FitFlow abstracts it, then generates outfits—plus optional AI
              visuals that feel like a magazine test shoot, not a gimmick.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <MiniSpec
                icon={Shirt}
                title="Fast digitization"
                desc="Text-first inventory."
              />
              <MiniSpec
                icon={Palette}
                title="Style profiles"
                desc="Minimal → street → tailored."
              />
              <MiniSpec
                icon={Calendar}
                title="Occasion logic"
                desc="Work, date, travel, events."
              />
              <MiniSpec
                icon={Zap}
                title="Instant variants"
                desc="Generate, save, refine."
              />
            </div>
          </div>

          <motion.div
            ref={reveal.ref as any}
            initial={{ opacity: 0, y: 20 }}
            animate={reveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between">
                <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                  LIVE MOCK • STEP FLOW
                </div>
                <Badge className="border border-white/10 bg-white/5 text-white/80">
                  <Smartphone className="mr-2 h-3.5 w-3.5 ff-accent" />
                  in-app
                </Badge>
              </div>

              <div className="mt-5 grid gap-3">
                <MockRow
                  idx="01"
                  title="Describe a piece"
                  meta="“White tee, boxy, heavy”"
                />
                <MockRow
                  idx="02"
                  title="FitFlow abstracts"
                  meta="→ WHITE OVERSIZED TEE"
                  highlight
                />
                <MockRow
                  idx="03"
                  title="Generate outfits"
                  meta="Occasion + weather + style"
                />
                <MockRow
                  idx="04"
                  title="Optional visualization"
                  meta="Magazine-like preview"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
                  API PREVIEW
                </div>
                <pre className="ff-mono mt-3 overflow-x-auto text-[12px] leading-relaxed text-white/70">
                  {`POST /v1/outfits
{
  "occasion": "office",
  "weather": "mild",
  "style_profile": "minimal",
  "wardrobe_atoms": ["white_oversized_tee", "black_straight_jean", "loafer"]
}`}
                </pre>
              </div>

              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full"
                animate={{ opacity: [0.55, 0.85, 0.55] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(182,255,77,0.18), transparent 62%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MiniSpec({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 ff-accent" />
        </div>
        <div>
          <div className="text-sm font-medium text-white/90">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function MockRow({
  idx,
  title,
  meta,
  highlight,
}: {
  idx: string;
  title: string;
  meta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.02] p-4",
        "hover:bg-white/[0.04] transition-colors"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
            {idx}
          </div>
          <div className="mt-1 text-sm font-medium text-white/90">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{meta}</div>
        </div>
        {highlight ? (
          <span className="rounded-full ff-accent-bg px-3 py-1 text-xs font-medium text-black">
            abstraction
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            step
          </span>
        )}
      </div>
    </div>
  );
}

/** SOCIAL PROOF */
function SocialProof() {
  const reveal = useReveal<HTMLDivElement>();

  const testimonials = [
    {
      who: "Product Designer",
      quote:
        "I stopped buying “fix” pieces. FitFlow showed me 12 outfits from stuff I ignored.",
      stat: "12 new outfits / week",
    },
    {
      who: "Consultant",
      quote:
        "The occasion filter is scary accurate. My weekday wardrobe finally feels intentional.",
      stat: "~8 min saved daily",
    },
    {
      who: "Creative Director",
      quote:
        "Abstraction is the secret. It feels like a stylist with taste—without the noise.",
      stat: "fewer repeats",
    },
  ];

  const people = [
    "Stylists",
    "Photographers",
    "Consultants",
    "Founders",
    "Students",
    "Designers",
    "Engineers",
    "Editors",
    "PMs",
    "Artists",
    "Marketers",
    "Researchers",
  ];

  return (
    <section id="proof" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
              SOCIAL PROOF
            </div>
            <h2 className="ff-display mt-4 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.05]">
              People don’t want more clothes.
              <span className="block text-white/70">
                They want better combinations.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
              Metrics that matter: outfit variety, fewer repeats, less decision
              fatigue, and more “I meant to wear this” moments.
            </p>
          </div>

          <motion.div
            ref={reveal.ref as any}
            initial={{ opacity: 0, y: 18 }}
            animate={reveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="grid gap-4"
          >
            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="group overflow-hidden rounded-3xl border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                      {t.who.toUpperCase()}
                    </div>
                    <div className="ff-display mt-3 text-xl font-semibold tracking-tight">
                      “{t.quote}”
                    </div>
                  </div>
                  <div className="ff-mono text-[11px] text-white/50">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full ff-accent-bg px-3 py-1 text-xs font-medium text-black">
                    {t.stat}
                  </span>
                  <span className="text-xs text-white/45 group-hover:text-white/65 transition-colors">
                    Hover feels nicer, right?
                  </span>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                CUSTOMER GRID
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Target personas (hover to “light up”).
              </div>
            </div>
            <div className="ff-mono text-[11px] text-white/55">
              {people.length} personas
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {people.map((p) => (
              <div
                key={p}
                className="group rounded-2xl border border-white/10 bg-black/25 px-3 py-4 text-center transition-colors hover:bg-white/[0.05]"
              >
                <div className="ff-mono text-[10px] tracking-[0.18em] text-white/45 group-hover:text-white/70">
                  {p.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** TECH DIFFERENTIATORS */
function Tech() {
  const reveal = useReveal<HTMLDivElement>();

  const rows = [
    {
      left: "Typical closet apps",
      right: "FitFlow",
      a: "Photos or tedious cataloging",
      b: "Text-first + abstraction engine",
    },
    {
      left: "One-off outfits",
      right: "Reusable formulas",
      a: "Looks don’t generalize",
      b: "Staples become “atoms” you can repeat",
    },
    {
      left: "Trend matching",
      right: "Context matching",
      a: "Generic recommendations",
      b: "Weather + occasion + style profile",
    },
  ];

  return (
    <section id="tech" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
              TECH DIFFERENTIATORS
            </div>
            <h2 className="ff-display mt-4 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.05]">
              Abstraction is the unfair advantage.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
              FitFlow learns “what it is” (staple) instead of “where it’s from”
              (brand). That’s why suggestions stay interesting without feeling
              random.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TrustChip
                icon={Key}
                title="Privacy-first"
                desc="No data-resale incentives."
              />
              <TrustChip
                icon={Layers}
                title="Wardrobe atoms"
                desc="Reusable building blocks."
              />
            </div>
          </div>

          <motion.div
            ref={reveal.ref as any}
            initial={{ opacity: 0, y: 18 }}
            animate={reveal.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="flex items-center justify-between">
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                COMPARISON GRID
              </div>
              <Badge className="border border-white/10 bg-white/5 text-white/80">
                <Check className="mr-2 h-3.5 w-3.5 ff-accent" />
                clarity
              </Badge>
            </div>

            <div className="mt-5 grid gap-3">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
                        {r.left.toUpperCase()}
                      </div>
                      <div className="mt-2 text-sm text-white/70">{r.a}</div>
                    </div>
                    <div className="sm:border-l sm:border-white/10 sm:pl-4">
                      <div className="ff-mono text-[10px] tracking-[0.18em] ff-accent">
                        {r.right.toUpperCase()}
                      </div>
                      <div className="mt-2 text-sm text-white/80">{r.b}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="ff-mono text-[10px] tracking-[0.18em] text-white/40">
                SECURITY & COMPLIANCE (BETA)
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  "HTTPS by default",
                  "No ads / no resale",
                  "Export anytime",
                ].map((b) => (
                  <div
                    key={b}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70"
                  >
                    <Check className="h-4 w-4 ff-accent" />
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** CONVERSION */
function Conversion() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    // TODO: connect to your lead capture (PostHog, Supabase, HubSpot, etc.)
  };

  return (
    <section id="convert" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] p-7 sm:p-10">
          <div className="ff-grain absolute inset-0" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                CONVERSION
              </div>
              <h3 className="ff-display mt-4 text-[clamp(1.7rem,3vw,2.6rem)] font-semibold leading-[1.05]">
                Get in early.
                <span className="block text-white/70">
                  The beta stays intentionally small.
                </span>
              </h3>
              <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
                We’re onboarding users who care about style (and want to
                actually wear what they own). Drop your details—invite link
                follows.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full ff-accent-bg px-3 py-1 text-xs font-medium text-black">
                  Limited beta seats
                </span>
                <span className="ff-mono text-xs text-white/50">
                  Reply time: 24–72h
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
              {!submitted ? (
                <form onSubmit={onSubmit} className="grid gap-3">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="h-12 border-white/10 bg-white/[0.03]"
                  />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    required
                    className="h-12 border-white/10 bg-white/[0.03]"
                  />
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company (optional)"
                    className="h-12 border-white/10 bg-white/[0.03]"
                  />

                  <MagneticButton
                    type="submit"
                    size="lg"
                    className="mt-2 ff-accent-bg text-black hover:opacity-90"
                  >
                    {primaryLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </MagneticButton>

                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/15 bg-transparent hover:bg-white/5"
                    onClick={() =>
                      window.open(
                        "https://fit-flow-beta-three.vercel.app/",
                        "_blank"
                      )
                    }
                  >
                    {secondaryLabel}
                  </Button>

                  <div className="mt-2 text-xs text-white/45">
                    By joining, you agree to receive beta updates (unsubscribe
                    anytime).
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-2 text-white/90">
                    <Check className="h-5 w-5 ff-accent" />
                    <span className="text-sm font-medium">
                      You’re on the list.
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    We’ll email you soon with access + a short onboarding
                    prompt.
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 border-white/15 bg-transparent hover:bg-white/5"
                    onClick={() => setSubmitted(false)}
                  >
                    Add another email
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-28 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(182,255,77,0.18), transparent 60%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/** FOOTER (minimal, sophisticated + newsletter) */
function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Sparkles className="h-4 w-4 ff-accent" />
              </div>
              <div>
                <div className="ff-display text-base font-semibold tracking-tight">
                  FitFlow
                </div>
                <div className="ff-mono text-[10px] text-white/45">
                  AI fashion companion
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              A lookbook engine for the clothes you already own.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="space-y-2 text-sm">
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                LINKS
              </div>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="#story"
              >
                Story
              </a>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="#showcase"
              >
                Product
              </a>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="#tech"
              >
                Tech
              </a>
              <a
                className="block text-muted-foreground hover:text-foreground"
                href="#convert"
              >
                Beta
              </a>
            </div>

            <div className="space-y-3">
              <div className="ff-mono text-[11px] tracking-[0.22em] text-white/45">
                NEWSLETTER
              </div>
              {!done ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email) return;
                    setDone(true);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="h-10 w-52 border-white/10 bg-white/[0.03]"
                    type="email"
                    required
                  />
                  <Button className="h-10 ff-accent-bg text-black hover:opacity-90">
                    Join
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="h-4 w-4 ff-accent" />
                  You’re in.
                </div>
              )}
              <div className="text-xs text-white/40">
                No spam. Just product drops & styling logic.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/45">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** PAGE */
export default function HomePage() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Story />
      <Showcase />
      <SocialProof />
      <Tech />
      <Conversion />
      <Footer />
    </main>
  );
}
