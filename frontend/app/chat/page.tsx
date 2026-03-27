"use client";
import ChatSidebar from "@/components/ChatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/SocketContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: { url: string; publicId: string };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

export interface createNewChatApiResponse {
  message: string;
  chatId?: string;
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
    loading, isAuth, logoutUser, chats, user: loggedInUser,
    users, fetchChats, setChats,
  } = useAppData();

  const { onlineUsers, socket } = SocketData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) router.push("/login");
  }, [isAuth, router, loading]);

  const handleLogout = () => logoutUser();

  async function fetchChat() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get<GetSelectedUserMessagesApiResponse>(
        `${chat_service}/api/v1/messages/${selectedUser}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
    }
  }

  const moveChatToTop = (chatId: string, newMessage: any, updatedUnseenCount = true) => {
    setChats((prev) => {
      if (!prev) return null;
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex((chat) => chat.chat._id === chatId);
      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);
        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: { text: newMessage.text, sender: newMessage.sender },
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
        if (chat.chat._id === chatId) return { ...chat, chat: { ...chat.chat, unseenCount: 0 } };
        return chat;
      });
    });
  };

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post<createNewChatApiResponse>(
        `${chat_service}/api/v1/chat/new`,
        { userId: loggedInUser?._id, otherUserId: u._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!data.chatId) throw new Error("chatId is missing");
      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      console.log("Error in creating new chat: " + error);
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;
    if (typingTimeOut) { clearTimeout(typingTimeOut); setTypingTimeOut(null); }
    socket?.emit("stopTyping", { chatId: selectedUser, userId: loggedInUser?._id });
    const token = Cookies.get("token");
    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      if (message.trim()) formData.append("text", message);
      if (imageFile) formData.append("image", imageFile);
      const { data } = await axios.post<SendMessageApiResponse>(
        `${chat_service}/api/v1/message`, formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } },
      );
      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some((msg) => msg._id === data.message._id);
        if (!messageExists) return [...currentMessages, data.message];
        return currentMessages;
      });
      setMessage("");
      const displayText = imageFile ? "📷 image" : message;
      moveChatToTop(selectedUser!, { text: displayText, sender: data.sender }, false);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to send message");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;
    if (value.trim()) socket.emit("typing", { chatId: selectedUser, userId: loggedInUser?._id });
    if (typingTimeOut) clearTimeout(typingTimeOut);
    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { chatId: selectedUser, userId: loggedInUser?._id });
    }, 2000);
    setTypingTimeOut(timeout);
  };

  useEffect(() => {
    const handleMessagesRead = (data: { chatId: string; messageIds?: string[] }) => {
      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)) {
              return { ...msg, seen: true, seenAt: new Date().toString() };
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return { ...msg, seen: true, seenAt: new Date().toString() };
            }
            return msg;
          });
        });
      }
    };

    socket?.on("newMessage", (message) => {
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some((msg) => msg._id === message._id);
          if (!messageExists) return [...currentMessages, message];
          return currentMessages;
        });
        moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen", handleMessagesRead);
    socket?.on("messagesRead", handleMessagesRead);
    socket?.on("userTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) setIsTyping(true);
    });
    socket?.on("userStoppedTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) setIsTyping(false);
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("messagesRead");
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
    return () => { if (typingTimeOut) clearTimeout(typingTimeOut); };
  }, [typingTimeOut]);

  if (loading) return <Loading />;

  return (
    <TooltipProvider>
      <Toaster position="top-right" richColors closeButton theme="system" />

      <div className="h-screen flex overflow-hidden bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
        {/* Mobile sidebar sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 w-[300px] bg-white dark:bg-[#111214] border-r border-zinc-200 dark:border-white/[0.06]"
          >
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

        {/* Desktop sidebar */}
        <div className="hidden sm:flex shrink-0">
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

        {/* Main chat panel */}
        <main className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          "bg-white dark:bg-[#0f1012]",
          "border-l border-zinc-200 dark:border-white/[0.06]",
        )}>
          <ChatHeader
            user={user}
            setSidebarOpen={setSidebarOpen}
            isTyping={isTyping}
            onlineUsers={onlineUsers}
          />

          {messages === null && selectedUser ? (
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-4 max-w-2xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={cn("flex items-end gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}>
                    {i % 2 === 0 && (
                      <Skeleton className="w-7 h-7 rounded-full shrink-0 bg-zinc-200 dark:bg-white/[0.06]" />
                    )}
                    <Skeleton
                      className="h-9 rounded-2xl bg-zinc-200 dark:bg-white/[0.06]"
                      style={{ width: `${100 + ((i * 47) % 120)}px` }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <ChatMessages
              selectedUser={selectedUser}
              messages={messages}
              loggedInUser={loggedInUser}
            />
          )}

          <MessageInput
            selectedUser={selectedUser}
            message={message}
            setMessage={handleTyping}
            handleMessageSend={handleMessageSend}
          />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default ChatApp;