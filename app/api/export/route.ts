import { type NextRequest, NextResponse } from "next/server"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  ShadingType,
} from "docx"

interface SearchResult {
  keyword: string
  matches: Array<{
    page: number
    context: string
    position: number
    residentName?: string
    location?: string
    effectiveDate?: string
  }>
}

interface UpdatedSearchResult {
  pageNumber: number
  paragraph: string
  residentName: string
  location: string
  admissionDate: string
  effectiveDate?: string
  matchedKeywords?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { results } = (await request.json()) as { results: UpdatedSearchResult[] }

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "No results to export" }, { status: 400 })
    }

    const sections: (Paragraph | Table)[] = []

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PDF Keyword Search Results",
            bold: true,
            font: "Times New Roman",
            size: 32,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    )

    // Create a map of keywords to their matching results
    const resultsByKeyword = new Map<string, UpdatedSearchResult[]>()

    results.forEach((result) => {
      const keywords = result.matchedKeywords || []
      keywords.forEach((keyword) => {
        if (!resultsByKeyword.has(keyword)) {
          resultsByKeyword.set(keyword, [])
        }
        // Check if this result is already added for this keyword to avoid duplicates
        const existingResults = resultsByKeyword.get(keyword) || []
        const isDuplicate = existingResults.some(
          (r) => r.paragraph === result.paragraph && r.pageNumber === result.pageNumber,
        )
        if (!isDuplicate) {
          resultsByKeyword.get(keyword)?.push(result as UpdatedSearchResult)
        }
      })
    })

    // Calculate total matches
    const totalMatches = results.length
    const totalKeywords = resultsByKeyword.size

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total Keywords Matched: ${totalKeywords} | Total Matches Found: ${totalMatches}`,
            bold: true,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 400 },
      }),
    )

    Array.from(resultsByKeyword.entries())
      .sort(([keywordA], [keywordB]) => keywordA.localeCompare(keywordB))
      .forEach(([keyword, keywordResults]) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Category: ${keyword}`,
                bold: true,
                font: "Times New Roman",
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 300 },
          }),
        )

        const totalKeywordOccurrences = keywordResults.reduce((count, result) => {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          // For "1:1": require that it is NOT followed by a digit (avoids HH:MM like 01:13, 1:15)
          const pattern = keyword === "1:1"
            ? new RegExp(`(?<![0-9])${escaped}(?![0-9])`, "gi")
            : new RegExp(escaped, "gi")
          const matches = result.paragraph.match(pattern)
          return count + (matches ? matches.length : 0)
        }, 0)

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Matches: ${totalKeywordOccurrences}`,
                font: "Times New Roman",
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),
        )

        // Create table for this keyword's results
        const tableRows: TableRow[] = []

        // Table header with professional styling
        tableRows.push(
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Match #",
                        bold: true,
                        color: "FFFFFF",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: { size: 400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: {
                  type: ShadingType.SOLID,
                  color: "4472C4",
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Resident Information",
                        bold: true,
                        color: "FFFFFF",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: { size: 2200, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: {
                  type: ShadingType.SOLID,
                  color: "4472C4",
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Paragraph",
                        bold: true,
                        color: "FFFFFF",
                        font: "Times New Roman",
                        size: 22,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: { size: 6400, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: {
                  type: ShadingType.SOLID,
                  color: "4472C4",
                },
              }),
            ],
          }),
        )

        keywordResults.forEach((result, idx) => {
          const textRuns: TextRun[] = []
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          // For "1:1": use lookahead/lookbehind to avoid matching inside time formats like 01:13
          const splitPattern = keyword === "1:1"
            ? new RegExp(`((?<![0-9])${escaped}(?![0-9]))`, "gi")
            : new RegExp(`(${escaped})`, "gi")
          const parts = result.paragraph.split(splitPattern)

          parts.forEach((part) => {
            if (part) {
              const matchPattern = keyword === "1:1"
                ? new RegExp(`^(?<![0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![0-9])$`, "i")
                : new RegExp(`^${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
              const isMatch = matchPattern.test(part)
              textRuns.push(
                new TextRun({
                  text: part,
                  highlight: isMatch ? "yellow" : undefined,
                  font: "Times New Roman",
                  size: 20,
                }),
              )
            }
          })

          const isEvenRow = idx % 2 === 0
          const rowShading = isEvenRow
            ? { type: ShadingType.SOLID, color: "F9F9F9" }
            : { type: ShadingType.CLEAR, color: "FFFFFF" }

          tableRows.push(
            new TableRow({
              children: [
                // Column 1: Match #
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${idx + 1}`,
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: { size: 400, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: rowShading,
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 50,
                    right: 50,
                  },
                }),
                // Column 2: Metadata (vertically stacked)
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Resident Name: ",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                        new TextRun({
                          text: result.residentName || "N/A",
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Location: ",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                        new TextRun({
                          text: result.location || "N/A",
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Admission Date: ",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                        new TextRun({
                          text: result.admissionDate || "N/A",
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Effective Date: ",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                        new TextRun({
                          text: result.effectiveDate || "N/A",
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                  width: { size: 2200, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP,
                  shading: rowShading,
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                  },
                }),
                // Column 3: Paragraph
                new TableCell({
                  children: [
                    new Paragraph({
                      children: textRuns,
                    }),
                  ],
                  width: { size: 6400, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP,
                  shading: rowShading,
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                  },
                }),
              ],
            }),
          )
        })

        sections.push(
          new Table({
            rows: tableRows,
            width: {
              size: 9000,
              type: WidthType.DXA,
            },
            layout: "fixed" as any,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "4472C4" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "4472C4" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "4472C4" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "4472C4" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
            },
          }),
        )

        // Add spacing after each keyword section
        sections.push(
          new Paragraph({
            text: "",
            spacing: { after: 300 },
          }),
        )
      })

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    // Generate buffer
    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=pdf-search-results.docx",
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
