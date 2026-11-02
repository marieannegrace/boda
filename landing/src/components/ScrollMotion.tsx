"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "@/animations/tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollMotion({ children, active = true, layoutVersion = false }: { children: React.ReactNode; active?: boolean; layoutVersion?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!active) return;
    const media = gsap.matchMedia();
    let mounted = true;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      root.current?.querySelectorAll<HTMLElement>("[data-ink]").forEach((element) => {
        gsap.from(element, {
          opacity: 0.55,
          y: motion.displacement,
          duration: motion.medium,
          ease: motion.ease,
          scrollTrigger: { trigger: element, start: "top 85%", once: true },
        });
      });
      const invitation = root.current?.querySelector("[data-facsimile]");
      if (invitation) {
        gsap.from(invitation, {
          opacity: 0.5, scale: 0.985, duration: motion.long, ease: motion.ease,
          scrollTrigger: { trigger: invitation, start: "top 82%", once: true },
        });
      }
    });
    media.add("(min-width: 960px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      let active = true;
      let dispose: (() => void) | undefined;
      import("lenis").then(({ default: Lenis }) => {
        if (!active) return;
        const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
        const tick = (time: number) => lenis.raf(time * 1000);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        dispose = () => {
          gsap.ticker.remove(tick);
          lenis.off("scroll", ScrollTrigger.update);
          lenis.destroy();
        };
      }).catch((error: unknown) => { console.error("Could not initialize desktop scroll enhancement", error); });
      return () => { active = false; dispose?.(); };
    });
    const refresh = () => ScrollTrigger.refresh(true);
    const container = root.current;
    container?.addEventListener("load", refresh, true);
    document.fonts.ready.then(() => { if (mounted) refresh(); });
    return () => {
      mounted = false;
      container?.removeEventListener("load", refresh, true);
      media.revert();
    };
  }, { scope: root, dependencies: [active, layoutVersion], revertOnUpdate: true });
  return <div ref={root}>{children}</div>;
}
