"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 h-auto rounded-xl justify-start font-normal",
        "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100",
        "hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors duration-150",
      )}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-medium">Light mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-medium">Dark mode</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;