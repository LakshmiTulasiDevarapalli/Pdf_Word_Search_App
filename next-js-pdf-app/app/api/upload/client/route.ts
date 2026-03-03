import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // This runs on your server before generating the upload token
        // Add authentication/authorization here if needed

        return {
          allowedContentTypes: ["application/pdf"],
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called by Vercel when the upload completes
        console.log("[v0] File uploaded to Blob:", blob.url)

        try {
          // Add your database update logic here if needed
        } catch (error) {
          console.error("[v0] Error in onUploadCompleted:", error)
          throw new Error("Could not update database")
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
