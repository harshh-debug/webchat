"use client";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (message: string) => void;
  handleMessageSend: (e: any, imageFile?: File | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const clearImage = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    clearImage();
    setIsUploading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!selectedUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "px-4 py-3 border-t border-zinc-200 dark:border-white/[0.06]",
        "bg-white dark:bg-[#111318] shrink-0"
      )}
    >
      {/* Image preview strip */}
      {previewUrl && (
        <div className="mb-2.5 flex items-center gap-2">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="preview"
              className="h-16 w-16 object-cover rounded-lg border border-zinc-200 dark:border-white/[0.08]"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-zinc-800 dark:bg-zinc-900 text-white flex items-center justify-center hover:bg-red-500 transition-colors duration-150 shadow"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <span className="text-[12px] text-zinc-400">
            {imageFile?.name}
          </span>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Attach */}
        <Tooltip>
          <TooltipTrigger asChild>
            <label
              className={cn(
                "cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
                "bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.09]",
                "transition-colors duration-150"
              )}
            >
              <Paperclip className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </TooltipTrigger>
          <TooltipContent>Attach image</TooltipContent>
        </Tooltip>

        {/* Text input */}
        <Input
          type="text"
          placeholder={imageFile ? "Add a caption…" : "Type a message…"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={cn(
            "flex-1 h-9 text-[13px] rounded-lg",
            "bg-zinc-100 dark:bg-white/[0.05] border-transparent",
            "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400",
            "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-white/[0.08]",
            "transition-all duration-150"
          )}
        />

        {/* Send */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={(!imageFile && !message.trim()) || isUploading}
              className={cn(
                "h-9 w-9 rounded-lg shrink-0",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "transition-all duration-150 shadow-sm"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isUploading ? "Sending…" : "Send (Enter)"}
          </TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
};

export default MessageInput;