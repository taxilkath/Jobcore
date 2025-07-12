import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple theme hook for Vite React (adapted from Next.js)
const useTheme = () => {
  const [theme] = useState(() => 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  return { theme }
}



interface SaveButtonProps {
  text?: {
    idle?: string
    saving?: string
    saved?: string
  }
  className?: string
  onSave?: () => Promise<void> | void
}

export function SaveButton({ 
  text = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved!"
  },
  className,
  onSave
}: SaveButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bounce, setBounce] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (status === "idle") {
      setStatus("saving")
      try {
        if (onSave) {
          await onSave()
        } else {
          // Simulate saving if onSave not provided
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        setStatus("saved")
        setBounce(true)
        setTimeout(() => {
          setStatus("idle")
          setBounce(false)
        }, 2000)
      } catch (error) {
        setStatus("idle")
        console.error("Save failed:", error)
      }
    }
  }

  const buttonVariants = {
    idle: {
      backgroundColor: isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)",
      color: "white",
      scale: 1,
    },
    saving: {
      backgroundColor: "rgb(34, 197, 94)",
      color: "white",
      scale: 1,
    },
    saved: {
      backgroundColor: "rgb(34, 197, 94)",
      color: "white",
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.2,
        times: [0, 0.5, 1],
      },
    },
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleSave}
        animate={status}
        variants={buttonVariants}
        className={cn(
          "group relative grid overflow-hidden rounded-full px-6 py-2 transition-all duration-200",
          status === "idle"
            ? "shadow-[0_1000px_0_0_hsl(142_76%_36%)_inset] dark:shadow-[0_1000px_0_0_hsl(142_71%_45%)_inset]"
            : "",
          "hover:shadow-lg hover:shadow-green-500/25",
          className
        )}
        style={{ minWidth: "120px", height: "40px" }}
        whileHover={status === "idle" ? { scale: 1.05 } : {}}
        whileTap={status === "idle" ? { scale: 0.95 } : {}}
      >
        {status === "idle" && (
          <span>
            <span
              className={cn(
                "spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full",
                "[mask:linear-gradient(black,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,black_360deg)]",
                "before:rotate-[-90deg] before:animate-rotate dark:before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]",
                "before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%] dark:[mask:linear-gradient(white,_transparent_50%)]",
              )}
            />
          </span>
        )}
        <span
          className={cn(
            "backdrop absolute inset-px rounded-[22px] transition-colors duration-200",
            status === "idle"
              ? "bg-green-500/100 group-hover:bg-green-500/40 dark:bg-green-400/30 dark:group-hover:bg-green-400/40"
              : "",
          )}
        />
        <span className="z-10 flex items-center justify-center gap-2 text-sm font-medium">
          <AnimatePresence mode="wait">
            {status === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  rotate: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
                }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.span>
            )}
            {status === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {status === "idle" ? text.idle : status === "saving" ? text.saving : text.saved}
          </motion.span>
        </span>
      </motion.button>
      <AnimatePresence>
        {bounce && (
          <motion.div
            className="absolute top-0 right-0 -mr-1 -mt-1"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={sparkleVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 