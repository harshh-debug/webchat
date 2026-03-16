import { Loader2, Paperclip, Send, X } from "lucide-react";
import React, { useState } from "react";

// ✅ shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);
  };

  if (!selectedUser) return null;

  return (
    // NOTE: kept as <form> — shadcn doesn't have a Form wrapper that replaces
    // native <form>; shadcn's Form is only for react-hook-form validation.
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-gray-700 pt-2"
    >
      {/* Image preview with remove button */}
      {imageFile && (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
          />
          {/* ✅ shadcn Button (ghost + icon) for dismiss */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black hover:bg-gray-900 p-0"
            onClick={() => setImageFile(null)}
          >
            <X className="w-3 h-3 text-white" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* ✅ File attach — styled label triggers hidden input directly */}
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    setImageFile(file);
                  }
                  // reset so the same file can be re-selected
                  e.target.value = "";
                }}
              />
            </label>
          </TooltipTrigger>
          <TooltipContent>Attach image</TooltipContent>
        </Tooltip>

        {/* ✅ shadcn Input replaces plain <input> */}
        <Input
          type="text"
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400
                     focus-visible:ring-blue-500 focus-visible:ring-1"
          placeholder={imageFile ? "Add a caption..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* ✅ shadcn Button for send */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={(!imageFile && !message.trim()) || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isUploading ? "Sending..." : "Send message"}
          </TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
};

export default MessageInput;