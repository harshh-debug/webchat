"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const conversation = [
  { id: 1, from: "them", type: "text", text: "hey! you free tonight?", time: "7:42 PM", seen: true },
  { id: 2, from: "me", type: "text", text: "yeah what's up 😊", time: "7:43 PM", seen: true },
  {
    id: 3,
    from: "them",
    type: "image",
    imageLabel: "📸 sunset.jpg",
    caption: "caught this on my walk",
    time: "7:44 PM",
    seen: true,
  },
  { id: 4, from: "me", type: "text", text: "omg that's beautiful 😭", time: "7:44 PM", seen: true },
  { id: 5, from: "me", type: "text", text: "where is this?", time: "7:44 PM", seen: false },
];

function DoubleTick({ seen }: { seen: boolean }) {
  return (
    <svg width="15" height="10" viewBox="0 0 15 10" fill="none" className="inline-block shrink-0">
      <path d="M1 5l2.5 2.5L8 2" stroke={seen ? "#60a5fa" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5l2.5 2.5L12 2" stroke={seen ? "#60a5fa" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/[0.08] w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/40"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ImageBubble({ caption, from }: { caption: string; from: string }) {
  return (
    <div className={`flex flex-col gap-1 max-w-[65%] ${from === "me" ? "items-end" : "items-start"}`}>
      <div className="w-44 h-28 rounded-xl overflow-hidden border border-white/[0.10]">
        <img
          src="https://images.unsplash.com/photo-1599600197870-4bfaf17d5f42?q=80&w=1170&auto=format&fit=crop"
          alt="sunset"
          className="w-full h-full object-cover"
        />
      </div>
      {caption && <p className="text-xs text-white/40 px-1">{caption}</p>}
    </div>
  );
}

function ChatMock() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    conversation.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 500 + i * 750));
    });
    const afterAll = 500 + conversation.length * 750;
    timers.push(setTimeout(() => setShowTyping(true), afterAll + 300));
    timers.push(setTimeout(() => setShowTyping(false), afterAll + 2600));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-[320px] rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/60">
            S
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-none">Sara</p>
          <p className="text-xs text-emerald-400/80 mt-0.5">Online</p>
        </div>
        <div className="flex items-center gap-3 text-white/25">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 px-4 py-4 min-h-[260px]">
        <AnimatePresence>
          {conversation.slice(0, visibleCount).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "image" ? (
                <ImageBubble caption={msg.caption ?? ""} from={msg.from} />
              ) : (
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                    msg.from === "me"
                      ? "bg-white text-[#0a0a0a] font-medium rounded-br-sm"
                      : "bg-white/[0.08] border border-white/[0.07] text-white/85 rounded-bl-sm"
                  }`}
                >
                  <span>{msg.text}</span>
                  {msg.from === "me" && (
                    <span className="inline-flex items-center gap-1 ml-2 align-middle">
                      <span className="text-[10px] text-black/30">{msg.time}</span>
                      <DoubleTick seen={msg.seen} />
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2.5">
        <button className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-white/35 hover:text-white/60 transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
        <div className="flex-1 text-sm text-white/20 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06]">
          Message...
        </div>
        <button className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#0a0a0a] shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50 font-medium">Real-time · Always online</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.06] text-white">
            Just you
            <br />
            and them.
            <br />
            <span className="text-white/35">Nothing else.</span>
          </h1>

          <p className="text-base text-white/50 leading-relaxed max-w-sm">
            WebChat is a personal messaging app. Send messages, share photos, and stay connected — with real-time typing and online presence.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <motion.a
              href="#get-started"
              id="get-started"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Start messaging
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              See how it works
            </motion.a>
          </div>
          <p className="text-xs text-white/25">Free to use · No account required to try</p>
        </div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          <ChatMock />
        </div>
      </div>
    </section>
  );
}