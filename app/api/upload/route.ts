import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Note: Vercel Blob supports files up to 5TB
// const MAX_FILE_SIZE = 4.5 * 1024 * 1024 // 4.5 MB in bytes

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // if (file.size > MAX_FILE_SIZE) {
    //   const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    //   return NextResponse.json(
    //     {
    //       error: `File too large: ${fileSizeMB} MB. This preview environment supports files up to 4.5 MB. Please try a smaller PDF file.`,
    //     },
    //     { status: 413 },
    //   )
    // }

    try {
      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      })

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
      })
    } catch (uploadError: any) {
      // Check if it's a storage quota error
      if (uploadError.message?.includes("quota exceeded") || uploadError.message?.includes("Storage quota")) {
        return NextResponse.json(
          {
            error:
              "Storage quota exceeded. Please clean up old files or upgrade your Vercel plan. You can delete old files from your Vercel dashboard: Storage → Blob.",
            quotaExceeded: true,
          },
          { status: 400 },
        )
      }
      throw uploadError
    }
  } catch (error) {
    console.error("[v0] Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: `Upload failed: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
