"use client";
import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { Check, CheckCheck, Download, MessageSquareDashed, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
  "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

const getAvatarColor = (id: string) =>
  AVATAR_COLORS[
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

/* ─── Image Lightbox ─── */
interface LightboxProps {
  url: string;
  onClose: () => void;
}

const Lightbox = ({ url, onClose }: LightboxProps) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "image";
      a.click();
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Controls */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Image */}
      <div
        className="relative z-10 max-w-[90vw] max-h-[85vh] overflow-auto rounded-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease" }}
      >
        <img
          src={url}
          alt="Full size preview"
          className="rounded-xl object-contain max-w-[90vw] max-h-[85vh] shadow-2xl"
        />
      </div>
    </div>
  );
};

/* ─── Date divider ─── */
const DateDivider = ({ date }: { date: string }) => (
  <div className="flex items-center gap-3 my-4 px-2">
    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
    <span className="text-[11px] font-medium text-zinc-400 px-2 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.04] shrink-0">
      {date}
    </span>
    <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
  </div>
);

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((msg) => {
      if (seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
  }, [messages]);

  // Scroll on chat switch — instant
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [selectedUser]);

  // Scroll on new message — smooth
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [uniqueMessages]);

  /* Group messages by date for dividers */
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    for (const msg of uniqueMessages) {
      const msgDate = moment(msg.createdAt).calendar(null, {
        sameDay: "[Today]",
        lastDay: "[Yesterday]",
        lastWeek: "dddd",
        sameElse: "MMM D, YYYY",
      });
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [uniqueMessages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] flex items-center justify-center">
          <MessageSquareDashed className="w-7 h-7 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-zinc-600 dark:text-zinc-300">
            Select a conversation
          </p>
          <p className="text-[13px] text-zinc-400 mt-1 max-w-[220px] leading-relaxed">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <div
        ref={viewportRef}
        className={cn(
          "flex-1 overflow-y-auto px-4 py-3",
          "scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent"
        )}
      >
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.date} />
            {group.messages.map((msg, i) => {
              const isSentByMe = msg.sender === loggedInUser?._id;
              const prevMsg = group.messages[i - 1];
              const nextMsg = group.messages[i + 1];
              const isFirstInRun = !prevMsg || prevMsg.sender !== msg.sender;
              const isLastInRun = !nextMsg || nextMsg.sender !== msg.sender;

              return (
                <div
                  key={`${msg._id}-${i}`}
                  className={cn(
                    "flex gap-2 mb-0.5",
                    isSentByMe ? "flex-row-reverse" : "flex-row",
                    isLastInRun ? "mb-3" : "mb-0.5"
                  )}
                >
                  {/* Avatar — only show on last message in a run */}
                  <div className="w-7 shrink-0 flex items-end">
                    {!isSentByMe && isLastInRun && (
                      <Avatar className="w-7 h-7">
                        <AvatarFallback
                          className={cn(
                            getAvatarColor(msg.sender),
                            "text-white text-[10px] font-semibold"
                          )}
                        >
                          {getInitials(loggedInUser?.name ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className={cn("flex flex-col max-w-[65%]", isSentByMe ? "items-end" : "items-start")}>
                    {/* Bubble */}
                    <div
                      className={cn(
                        "px-3.5 py-2.5 text-[13px] leading-relaxed",
                        "shadow-sm transition-all duration-150",
                        isSentByMe
                          ? [
                              "bg-blue-600 text-white",
                              isFirstInRun ? "rounded-2xl rounded-br-md" : "rounded-2xl",
                              isLastInRun ? "rounded-br-md" : "",
                            ]
                          : [
                              "bg-zinc-100 dark:bg-white/[0.07] text-zinc-800 dark:text-zinc-100",
                              isFirstInRun ? "rounded-2xl rounded-bl-md" : "rounded-2xl",
                              isLastInRun ? "rounded-bl-md" : "",
                            ]
                      )}
                    >
                      {msg.messageType === "image" && msg.image && (
                        <button
                          className="block relative group rounded-lg overflow-hidden"
                          onClick={() => setLightboxUrl(msg.image!.url)}
                        >
                          <img
                            src={msg.image.url}
                            alt="shared image"
                            className="max-w-full max-h-52 object-cover rounded-lg transition-opacity duration-150 group-hover:opacity-90"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/20 rounded-lg">
                            <ZoomIn className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </button>
                      )}
                      {msg.text && (
                        <p className={msg.messageType === "image" ? "mt-1.5" : ""}>
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* Timestamp + seen — only on last in run */}
                    {isLastInRun && (
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1",
                          isSentByMe ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <span className="text-[10px] text-zinc-400">
                          {moment(msg.createdAt).format("h:mm A")}
                        </span>
                        {isSentByMe && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-default">
                                {msg.seen ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-zinc-400" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-[11px]">
                              {msg.seen
                                ? `Seen at ${moment(msg.seenAt).format("h:mm A, MMM D")}`
                                : "Delivered"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatMessages;