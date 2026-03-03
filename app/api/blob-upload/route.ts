import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ["application/pdf", "text/plain"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          addRandomSuffix: true, // Automatically generate unique filenames
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[v0] Blob upload completed:", blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
