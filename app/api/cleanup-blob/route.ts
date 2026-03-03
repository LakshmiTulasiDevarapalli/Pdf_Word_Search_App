import { del, list } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Delete blobs older than this many hours (default: 24 hours)
const MAX_AGE_HOURS = 24

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log("[v0] Starting Blob storage cleanup...")

    const { blobs } = await list()

    console.log(`[v0] Found ${blobs.length} total files in storage`)

    const now = Date.now()
    const maxAgeMs = MAX_AGE_HOURS * 60 * 60 * 1000

    const oldBlobs = blobs.filter((blob) => {
      const age = now - new Date(blob.uploadedAt).getTime()
      return age > maxAgeMs
    })

    console.log(`[v0] Found ${oldBlobs.length} files older than ${MAX_AGE_HOURS} hours`)

    if (oldBlobs.length === 0) {
      return NextResponse.json({
        message: "No old files to clean up",
        deletedCount: 0,
        totalFiles: blobs.length,
      })
    }

    // Delete old blobs
    const deletePromises = oldBlobs.map((blob) => del(blob.url))
    await Promise.all(deletePromises)

    console.log(`[v0] Successfully deleted ${oldBlobs.length} old files`)

    return NextResponse.json({
      message: `Cleaned up ${oldBlobs.length} old files`,
      deletedCount: oldBlobs.length,
      remainingFiles: blobs.length - oldBlobs.length,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: `Cleanup failed: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
