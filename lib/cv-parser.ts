// lib/cv-parser.ts
import pdf from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedCV {
  name: string;
  email: string | null;
  phone: string | null;
  positionApplied: string | null;
  totalExperience: string | null;
  skills: string[];
  education: string | null;
  currentLocation: string | null;
  rawText: string;
}

// ─── Extract text from file buffer ────────────────────────────────────────────
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  // Plain text
  return buffer.toString("utf-8");
}

// ─── Parse structured data from raw text ──────────────────────────────────────
export function parseStructuredData(text: string): ParsedCV {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Email
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
  );
  const email = emailMatch ? emailMatch[0] : null;

  // Phone
  const phoneMatch = text.match(
    /(?:\+91[\s\-]?)?(?:\d{5}[\s\-]?\d{5}|\d{3}[\s\-]?\d{3}[\s\-]?\d{4})/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  // Name — usually first non-empty line that looks like a name
  const name = inferName(lines);

  // Experience
  const expMatch = text.match(
    /(\d+\.?\d*)\s*(?:\+\s*)?(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i
  );
  const totalExperience = expMatch ? `${expMatch[1]} years` : null;

  // Skills — look for skills section
  const skills = extractSkills(text);

  // Education
  const education = extractEducation(text);

  // Location
  const location = extractLocation(text);

  // Role/Position
  const positionApplied = extractPosition(text);

  return {
    name,
    email,
    phone,
    positionApplied,
    totalExperience,
    skills,
    education,
    currentLocation: location,
    rawText: text.substring(0, 5000), // cap at 5k chars for DB storage
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function inferName(lines: string[]): string {
  // Skip lines that look like headers, emails, phones
  for (const line of lines.slice(0, 8)) {
    if (
      line.length > 3 &&
      line.length < 50 &&
      !line.includes("@") &&
      !line.match(/\d{5,}/) &&
      !line.match(/^(resume|cv|curriculum|name:|email:|phone:|address:)/i) &&
      line.match(/^[A-Za-z\s.'-]+$/)
    ) {
      return line;
    }
  }
  return lines[0] || "Unknown";
}

function extractSkills(text: string): string[] {
  const skillsSection = text.match(
    /(?:skills?|technical skills?|key skills?)[:\s]+([\s\S]{0,500}?)(?:\n\n|\n[A-Z])/i
  );
  if (!skillsSection) return [];
  return skillsSection[1]
    .split(/[,|•\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40)
    .slice(0, 15);
}

function extractEducation(text: string): string | null {
  const eduMatch = text.match(
    /(?:b\.?tech|b\.?e|m\.?tech|mba|bba|b\.?com|m\.?com|bachelor|master|pgdm|b\.?sc|m\.?sc)[^\n]*/i
  );
  return eduMatch ? eduMatch[0].trim() : null;
}

function extractLocation(text: string): string | null {
  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
    "Noida",
    "Gurgaon",
    "Gurugram",
    "Navi Mumbai",
    "Thane",
  ];
  for (const city of cities) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return null;
}

function extractPosition(text: string): string | null {
  const roles = [
    "Campaign Manager",
    "Affiliate Sales Manager",
    "Biddable Media",
    "Delivery Manager",
    "Delivery Head",
    "Accounts Executive",
    "Client Servicing",
    "Marketing Intern",
    "Media Intern",
    "Performance Marketing",
    "Digital Marketing",
    "Media Planner",
    "Media Buyer",
  ];
  for (const role of roles) {
    if (text.toLowerCase().includes(role.toLowerCase())) return role;
  }
  // Fall back to "Applying for" pattern
  const applyMatch = text.match(
    /(?:applying for|position:|role:|applied for)[:\s]+([^\n]{3,50})/i
  );
  return applyMatch ? applyMatch[1].trim() : null;
}
