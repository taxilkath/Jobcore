import { SaveButton } from "@/components/ui/save-button"

export function SaveButtonDemo() {
  return (
    <SaveButton 
      text={{
        idle: "Save me, please!",
        saving: "Working on it...",
        saved: "Saved! Woohoo!"
      }}
    />
  )
} 