"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CleanupStorageButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCleanup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cleanup-blob", { method: "POST" })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Storage Cleaned",
          description: data.message || `Deleted ${data.deletedCount} old files`,
        })
      } else {
        throw new Error(data.error || "Cleanup failed")
      }
    } catch (error) {
      console.error("[v0] Cleanup error:", error)
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : "Failed to clean up storage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCleanup}
      disabled={isLoading}
      className="btn-royal flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      style={{ opacity: isLoading ? 0.75 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      Clean Up
    </button>
  )
}