export function extractPageMetadata(pageText: string) {
  const residentNameMatch = pageText.match(/Resident Name:\s*(.+)/i)
  const locationMatch = pageText.match(/Location:\s*(.+)/i)
  const admissionDateMatch = pageText.match(/Admission Date:\s*(.+)/i)

  return {
    residentName: residentNameMatch?.[1]?.trim() || "Unknown",
    location: locationMatch?.[1]?.trim() || "Unknown",
    admissionDate: admissionDateMatch?.[1]?.trim() || "Unknown",
  }
}

export function extractSections(pageText: string) {
  const sections: Array<{
    noteText: string
    effectiveDate: string
    type: string
  }> = []

  // Split by common section markers
  const lines = pageText.split("\n")
  let currentNote = ""
  let currentEffectiveDate = ""
  let currentType = "Note"

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Check for effective date
    const effectiveDateMatch = trimmedLine.match(/Effective Date:\s*(.+)/i)
    if (effectiveDateMatch) {
      // Save previous section if exists
      if (currentNote) {
        sections.push({
          noteText: currentNote.trim(),
          effectiveDate: currentEffectiveDate,
          type: currentType,
        })
      }
      currentEffectiveDate = effectiveDateMatch[1].trim()
      currentNote = ""
      continue
    }

    // Check for note type
    const typeMatch = trimmedLine.match(/^(Progress Note|Nursing Note|Care Plan|Assessment):/i)
    if (typeMatch) {
      currentType = typeMatch[1]
      continue
    }

    // Accumulate note text
    if (trimmedLine) {
      currentNote += (currentNote ? " " : "") + trimmedLine
    }
  }

  // Add final section
  if (currentNote) {
    sections.push({
      noteText: currentNote.trim(),
      effectiveDate: currentEffectiveDate,
      type: currentType,
    })
  }

  // If no sections found, treat entire page as one section
  if (sections.length === 0) {
    sections.push({
      noteText: pageText.trim(),
      effectiveDate: "Unknown",
      type: "Note",
    })
  }

  return sections
}
