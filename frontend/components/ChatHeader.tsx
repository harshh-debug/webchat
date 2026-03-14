import { User } from "@/context/AppContext";
import { Menu, UserCircle } from "lucide-react";
import React from "react";

// ✅ shadcn/ui imports
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id);

  return (
    <>
      {/* ✅ Mobile menu toggle — shadcn Button (ghost + icon variant) */}
      <div className="sm:hidden fixed top-4 right-4 z-30">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Open sidebar</TooltipContent>
        </Tooltip>
      </div>

      {/* Chat header card */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* ✅ shadcn Avatar — UserCircle as fallback, same as original */}
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gray-700">
                    <UserCircle className="w-8 h-8 text-gray-300" />
                  </AvatarFallback>
                </Avatar>

                {/* Online ping indicator */}
                {isOnlineUser && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-800">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                  </span>
                )}
              </div>

              {/* user info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white truncate">
                    {user.name}
                  </h2>
                  {/* ✅ shadcn Badge for online/offline */}
                  <Badge
                    variant="outline"
                    className={
                      isOnlineUser
                        ? "border-green-500/40 bg-green-500/10 text-green-500"
                        : "border-gray-600 bg-gray-700/50 text-gray-400"
                    }
                  >
                    {isOnlineUser ? "Online" : "Offline"}
                  </Badge>
                </div>

                {/* Typing / status row */}
                <div className="flex items-center gap-2">
                  {isTyping ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-blue-500 font-medium">
                        typing...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isOnlineUser ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isOnlineUser ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        {isOnlineUser ? "Online" : "Offline"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-gray-700">
                  <UserCircle className="w-8 h-8 text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-400">
                  Select a conversation
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;  