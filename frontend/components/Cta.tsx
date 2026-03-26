"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl bg-white/[0.03] border border-white/[0.08] px-10 py-16 text-center overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,255,255,0.05) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg mx-auto">
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Start chatting
              <br />
              <span className="text-white/35">right now.</span>
            </h2>
            <p className="text-base text-white/45 leading-relaxed">
              No setup, no configuration. Just sign up, share your link, and start talking to the people that matter.
            </p>

        <div className="flex items-center gap-3 pt-1">
  <Link href="/login">
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="px-6 py-2.5 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold hover:bg-white/90 transition-colors"
    >
      Create your account
    </motion.button>
  </Link>
</div>

            <p className="text-xs text-white/25">
              Free · No credit card · Works in the browser
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}