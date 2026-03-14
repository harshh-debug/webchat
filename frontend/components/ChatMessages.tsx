import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import React, { useEffect, useMemo, useRef } from "react";
import moment from "moment";
import { Check, CheckCheck } from "lucide-react";

// ✅ shadcn/ui imports
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Deduplicate messages by _id
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) return false;
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);

  return (
    <div className="flex-1 overflow-hidden">
      {/* ✅ shadcn ScrollArea replaces the raw overflow-y-auto div.
          It injects a styled scrollbar that matches the dark theme
          without needing the custom-scroll CSS class.              */}
      <ScrollArea className="h-full max-h-[calc(100vh-215px)] p-2">
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20">
            Please select a user to start chatting 📩
          </p>
        ) : (
          <div className="space-y-2">
            {uniqueMessages.map((e, i) => {
              const isSentByMe = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id}-${i}`;

              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col gap-1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Bubble */}
                  <div
                    className={`rounded-lg p-3 max-w-sm ${
                      isSentByMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {e.messageType === "image" && e.image && (
                      <div className="relative group">
                        <img
                          src={e.image.url}
                          alt="shared image"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {e.text && <p className="mt-1">{e.text}</p>}
                  </div>

                  {/* Timestamp + seen status */}
                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>{moment(e.createdAt).format("hh:mm A · MMM D")}</span>

                    {/* ✅ Tooltip on the seen/delivered tick for extra context */}
                    {isSentByMe && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center ml-1 cursor-default">
                            {e.seen ? (
                              <div className="flex items-center gap-1 text-blue-400">
                                <CheckCheck className="w-3 h-3" />
                                {e.seenAt && (
                                  <span>
                                    {moment(e.seenAt).format("hh:mm A")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Check className="w-3 h-3 text-gray-500" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          {e.seen
                            ? `Seen at ${moment(e.seenAt).format("hh:mm A, MMM D")}`
                            : "Delivered"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;