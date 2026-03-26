"use client";

import { motion, Variants } from "framer-motion";

import CTA from "@/components/Cta";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.09,
    },
  },
};

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%)",
        }}
      />
      <div className="relative z-10">
        <motion.div variants={sectionVariants}>
          <Navbar />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Hero />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Features />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Showcase />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <CTA />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </div>
    </motion.div>
  );
}