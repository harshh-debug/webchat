"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "One-to-one messaging",
    description:
      "Private conversations between you and one other person. No groups, no noise — just direct, personal chat.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: "Image sharing",
    description:
      "Send photos directly in the conversation. Images load inline — no links, no redirects, no friction.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Real-time delivery",
    description:
      "Messages arrive instantly. No polling, no delay — powered by WebSockets for a live, fluid experience.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Online & typing status",
    description:
      "See when someone is online and when they're typing. Presence that feels natural, not intrusive.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-medium tracking-widest text-white/25 uppercase mb-4">Features</p>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white max-w-md leading-tight">
            Everything you need.
            <br />
            <span className="text-white/35">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group flex flex-col gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05] transition-colors duration-200 cursor-default"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50 group-hover:text-white/75 transition-colors">
                {feat.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}