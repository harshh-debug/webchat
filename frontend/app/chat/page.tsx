"use client";
import ChatSidebar from "@/components/ChatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner"; // ✅ Replaced react-hot-toast with sonner
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/SocketContext";

// ✅ shadcn/ui component imports
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

export interface createNewChatApiResponse{
  message:string;
  chatId?:string
}
export interface GetSelectedUserMessagesApiResponse {
  messages: Message[];
  user: User;
}

export interface SendMessageApiResponse {
  message: Message;
  sender: string;
}


const ChatApp = () => {
  const {
    loading,
    isAuth,
    logoutUser,
    chats,
    user: loggedInUser,
    users,
    fetchChats,
    setChats,
  } = useAppData();

  const { onlineUsers, socket } = SocketData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ fixed typo: siderbarOpen → sidebarOpen
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  const handleLogout = () => logoutUser();

  async function fetchChat() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get<GetSelectedUserMessagesApiResponse>(
        `${chat_service}/api/v1/messages/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      // ✅ sonner toast API (same call signature, drop-in replacement)
      toast.error("Failed to load messages");
    }
  }

  const moveChatToTop = (
    chatId: string,
    newMessage: any,
    updatedUnseenCount = true
  ) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat.chat._id === chatId
      );

      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text: newMessage.text,
              sender: newMessage.sender,
            },
            updatedAt: new Date().toString(),
            unseenCount:
              updatedUnseenCount && newMessage.sender !== loggedInUser?._id
                ? (moveChat.chat.unseenCount || 0) + 1
                : moveChat.chat.unseenCount || 0,
          },
        };

        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });
  };

  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0,
            },
          };
        }
        return chat;
      });
    });
  };

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post<createNewChatApiResponse>(
        `${chat_service}/api/v1/chat/new`,
        {
          userId: loggedInUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if(!data.chatId){
        throw new Error("chatId is missing");
      }
      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      // ✅ sonner toast
      console.log("Error in creating new chat: "+error)
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();

    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    const token = Cookies.get("token");

    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);

      if (message.trim()) {
        formData.append("text", message);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post<SendMessageApiResponse>(
        `${chat_service}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );

        if (!messageExists) {
          return [...currentMessages, data.message];
        }
        return currentMessages;
      });

      setMessage("");

      const displayText = imageFile ? "📷 image" : message;

      moveChatToTop(
        selectedUser!,
        {
          text: displayText,
          sender: data.sender,
        },
        false
      );
    } catch (error: any) {
      // ✅ sonner toast
      toast.error(error.response?.data?.message ?? "Failed to send message");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedUser || !socket) return;

    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000);

    setTypingTimeOut(timeout);
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      console.log("Received new message:", message);

      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some(
            (msg) => msg._id === message._id
          );

          if (!messageExists) {
            return [...currentMessages, message];
          }
          return currentMessages;
        });

        moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen", (data) => {
      console.log("Message seen by:", data);

      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (
              msg.sender === loggedInUser?._id &&
              data.messageIds &&
              data.messageIds.includes(msg._id)
            ) {
              return { ...msg, seen: true, seenAt: new Date().toString() };
            } else if (
              msg.sender === loggedInUser?._id &&
              !data.messageIds
            ) {
              return { ...msg, seen: true, seenAt: new Date().toString() };
            }
            return msg;
          });
        });
      }
    });

    socket?.on("userTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true);
      }
    });

    socket?.on("userStoppedTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [socket, selectedUser, setChats, loggedInUser?._id]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser);
      socket?.emit("joinChat", selectedUser);

      return () => {
        socket?.emit("leaveChat", selectedUser);
        setMessages(null);
      };
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  if (loading) return <Loading />;

  return (
    // ✅ Wrap the whole app with TooltipProvider (required by shadcn Tooltip)
    <TooltipProvider>
      {/* ✅ Sonner Toaster – replaces react-hot-toast's <Toaster />
          Place once at the root; customize position/theme as needed */}
      <Toaster
        position="top-right"
        richColors          // enables success/error/warning color variants
        closeButton         // adds a dismiss button to each toast
        theme="dark"        // matches the dark bg-gray-900 layout
      />

      <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">

        {/* ─── Mobile sidebar: shadcn Sheet ─────────────────────────────────
            On desktop the ChatSidebar renders inline (hidden Sheet trigger).
            On mobile the hamburger in ChatHeader opens the Sheet.           */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          {/* Trigger is controlled externally (ChatHeader sets setSidebarOpen) */}
          <SheetContent
            side="left"
            className="p-0 w-72 bg-gray-900 border-r border-white/10"
          >
            {/* ✅ SheetTitle required for accessibility (screen readers).
                Visually hidden since the sidebar has its own visible heading. */}
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Sidebar</SheetTitle>
            </SheetHeader>
            <ChatSidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showAllUsers={showAllUser}
              setShowAllUsers={setShowAllUser}
              users={users}
              loggedInUser={loggedInUser}
              chats={chats}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              handleLogout={handleLogout}
              createChat={createChat}
              onlineUsers={onlineUsers}
            />
          </SheetContent>
        </Sheet>

        {/* ─── Desktop sidebar (always visible) ──────────────────────────── */}
        <div className="hidden md:flex">
          <ChatSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showAllUsers={showAllUser}
            setShowAllUsers={setShowAllUser}
            users={users}
            loggedInUser={loggedInUser}
            chats={chats}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            handleLogout={handleLogout}
            createChat={createChat}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* ─── Main chat panel ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10">

          {/* Header */}
          <ChatHeader
            user={user}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
            onlineUsers={onlineUsers}
          />

          <Separator className="bg-white/10 my-2" /> {/* ✅ shadcn Separator */}

          {/* ✅ shadcn ScrollArea wraps the messages list for custom scrollbar */}
          <ScrollArea className="flex-1 pr-2">
            {messages === null ? (
              /* ✅ shadcn Skeleton loading placeholders */
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                  >
                    <div className="flex items-end gap-2">
                      {i % 2 === 0 && (
                        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                      )}
                      <Skeleton
                        className="h-10 rounded-2xl bg-white/10"
                        style={{ width: `${120 + (i * 30) % 100}px` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ChatMessages
                selectedUser={selectedUser}
                messages={messages}
                loggedInUser={loggedInUser}
              />
            )}
          </ScrollArea>

          <Separator className="bg-white/10 my-2" /> {/* ✅ shadcn Separator */}

          {/* Message input */}
          <MessageInput
            selectedUser={selectedUser}
            message={message}
            setMessage={handleTyping}
            handleMessageSend={handleMessageSend}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatApp;

/*
 * ─── HOW TO USE SHADCN COMPONENTS IN CHILD COMPONENTS ───────────────────────
 *
 * ChatHeader.tsx – replace hamburger <button> with:
 *   <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
 *     <Menu className="h-5 w-5" />
 *   </Button>
 *
 * ChatSidebar.tsx – wrap logout button:
 *   <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
 *     Logout
 *   </Button>
 *
 *   Online indicator with Badge:
 *   <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
 *     Online
 *   </Badge>
 *
 *   User avatars with Avatar:
 *   <Avatar>
 *     <AvatarImage src={user.profilePic} alt={user.name} />
 *     <AvatarFallback>{user.name[0]}</AvatarFallback>
 *   </Avatar>
 *
 * MessageInput.tsx – replace send button:
 *   <Button type="submit" size="icon" variant="default">
 *     <Send className="h-4 w-4" />
 *   </Button>
 *
 *   Wrap icon buttons with Tooltip:
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="ghost" size="icon"><Paperclip /></Button>
 *     </TooltipTrigger>
 *     <TooltipContent>Attach image</TooltipContent>
 *   </Tooltip>
 *
 * ─── INSTALLATION (run once) ─────────────────────────────────────────────────
 *   npx shadcn@latest add button avatar badge scroll-area separator skeleton sheet tooltip sonner
 *
 * ─── layout.tsx / _app.tsx – add Sonner Toaster once at the root ─────────────
 *   import { Toaster } from "sonner";
 *   // inside <body> or root layout:
 *   <Toaster position="top-right" richColors closeButton theme="dark" />
 */