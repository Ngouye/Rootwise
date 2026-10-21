"use client";

import { motion } from "motion/react";
import { siteConfig } from "@/config/site";

/** Nom géant en bas de page, dont les lettres montent une à une. */
export function FooterWordmark() {
  return (
    <div aria-hidden className="pointer-events-none overflow-hidden select-none">
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        transition={{ staggerChildren: 0.035 }}
        className="flex justify-center text-[19vw] leading-[0.85] font-extrabold tracking-[-0.06em]"
      >
        {[...siteConfig.name].map((letter, index) => (
          <motion.span
            key={index}
            variants={{ hidden: { y: "60%", opacity: 0 }, visible: { y: "0%", opacity: 1 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="bg-gradient-to-b from-white/18 to-white/0 bg-clip-text text-transparent"
          >
            {letter}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
}
