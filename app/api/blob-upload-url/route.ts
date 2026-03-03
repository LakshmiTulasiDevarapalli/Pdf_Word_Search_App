import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN is not configured")
      return NextResponse.json(
        { error: "Blob storage is not configured. Please add BLOB_READ_WRITE_TOKEN environment variable." },
        { status: 500 },
      )
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            // Optional: Add custom metadata if needed
          }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[v0] Blob upload completed:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Blob upload URL error:", error)
    return NextResponse.json({ error: `Blob upload failed: ${(error as Error).message}` }, { status: 400 })
  }
}