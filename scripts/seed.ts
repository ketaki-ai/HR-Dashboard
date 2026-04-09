// scripts/seed.ts
// Run: npx tsx scripts/seed.ts
// Seeds the database with the existing recruitment data from the Excel file

import { PrismaClient, FinalStatus, OfferStatus, JoinStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_DATA = [
  { srNo: 1, name: "Philona Choudhary", positionApplied: "Delivery Head", department: "Campaign Management", source: "Consultancy", sourceDetails: "Job Solutions", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 103470, doj: new Date("2023-11-06"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2023-10-12"), monthYear: new Date("2023-10-01") },
  { srNo: 9, name: "Riddhi Kashalkar", positionApplied: "Accounts Executive", department: "Accounts & Finance", source: "Job Portal", sourceDetails: "Indeed Jobs", hrInterviewer: "Ketaki Vaidya", technicalRound: "Rupali Pawar", finalRound: "Arvind Khot", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 23000, offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2023-11-21"), monthYear: new Date("2023-11-01") },
  { srNo: 34, name: "Dhruv Salaria", positionApplied: "Affiliate Sales Manager", department: "Business Development", source: "Consultancy", sourceDetails: "Job Solutions", hrInterviewer: "Ketaki Vaidya", technicalRound: "Subramani Rajagopal", finalRound: "Arvind Khot", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 97950, doj: new Date("2024-01-08"), offerAccepted: "YES" as OfferStatus, joined: "NO" as JoinStatus, reasonNotJoining: "Better Opportunity", interviewDate: new Date("2023-12-18"), monthYear: new Date("2023-12-01") },
  { srNo: 35, name: "Shalini Pandey", positionApplied: "Affiliate Sales Manager", department: "Business Development", source: "Consultancy", sourceDetails: "Job Solutions", hrInterviewer: "Ketaki Vaidya", technicalRound: "Subramani Rajagopal", finalRound: "Arvind Khot", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 64450, doj: new Date("2024-01-08"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2023-12-18"), monthYear: new Date("2023-12-01") },
  { srNo: 69, name: "Henil Nisar", positionApplied: "Media Intern", department: "Marketing", source: "Institute", sourceDetails: "MAEER MIT College", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, doj: new Date("2024-03-04"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2024-02-06"), monthYear: new Date("2024-02-01") },
  { srNo: 70, name: "Sweta Uniyal", positionApplied: "Delivery Manager", department: "Campaign Management", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 38950, doj: new Date("2024-04-01"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2024-03-01"), monthYear: new Date("2024-03-01") },
  { srNo: 71, name: "Arif Mondal", positionApplied: "Biddable Media Manager", department: "Biddable Media", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 45950, doj: new Date("2025-01-01"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2024-12-12"), monthYear: new Date("2024-12-01") },
  { srNo: 72, name: "Feedal Alphonso", positionApplied: "Client Servicing Manager", department: "Client Servicing", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 101950, doj: new Date("2025-07-01"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-06-09"), monthYear: new Date("2025-06-01") },
  { srNo: 73, name: "Priyal Nagar", positionApplied: "Campaign Manager", department: "Campaign Management", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 50950, doj: new Date("2025-08-01"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-07-01"), monthYear: new Date("2025-07-01") },
  { srNo: 74, name: "Nitika Jain", positionApplied: "Campaign Manager", department: "Campaign Management", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 58350, doj: new Date("2025-08-01"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-07-15"), monthYear: new Date("2025-07-01") },
  { srNo: 75, name: "Prabhat Senva", positionApplied: "Sr. Manager - Biddable Media", department: "Biddable Media", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 104000, doj: new Date("2025-09-01"), offerAccepted: "YES" as OfferStatus, joined: "PENDING" as JoinStatus, interviewDate: new Date("2025-07-17"), monthYear: new Date("2025-07-01") },
  { srNo: 76, name: "Dhruvi Shah", positionApplied: "Marketing Intern", department: "Marketing", source: "Institute", sourceDetails: "MAEER MIT College", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 15000, doj: new Date("2025-08-18"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-07-23"), monthYear: new Date("2025-07-01") },
  { srNo: 77, name: "Mansi Methani", positionApplied: "Marketing Intern", department: "Marketing", source: "Institute", sourceDetails: "MAEER MIT College", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 15000, doj: new Date("2025-08-18"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-07-23"), monthYear: new Date("2025-07-01") },
  { srNo: 78, name: "Rupanshi Vijayvargya", positionApplied: "Marketing Intern", department: "Marketing", source: "Institute", sourceDetails: "MAEER MIT College", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 12000, doj: new Date("2025-08-18"), offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-07-28"), monthYear: new Date("2025-07-01") },
  { srNo: 79, name: "Aakansha Jaiswal", positionApplied: "Billing & Collection Specialist", department: "Accounts & Finance", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 45950, offerAccepted: "NO" as OfferStatus, joined: "NO" as JoinStatus, reasonNotJoining: "Counter Offer", interviewDate: new Date("2025-09-02"), monthYear: new Date("2025-09-01") },
  { srNo: 80, name: "Saloni Bhosale", positionApplied: "Billing & Collection Specialist", department: "Accounts & Finance", source: "Portal", sourceDetails: "Naukri.com", hrInterviewer: "Ketaki Vaidya", finalRound: "Subramani Rajagopal", finalStatus: "SELECTED" as FinalStatus, offeredCtc: 31950, offerAccepted: "YES" as OfferStatus, joined: "YES" as JoinStatus, interviewDate: new Date("2025-11-03"), monthYear: new Date("2025-11-01") },
  // Rejected candidates (bulk)
  ...Array.from({ length: 49 }, (_, i) => ({
    srNo: 100 + i,
    name: `Affiliate Candidate ${i + 1}`,
    positionApplied: "Affiliate Sales Manager",
    department: "Business Development",
    source: i % 3 === 0 ? "Consultancy" : i % 3 === 1 ? "Job Portal" : "Portal",
    sourceDetails: i % 3 === 0 ? "Job Solutions" : "Naukri.com",
    hrInterviewer: "Ketaki Vaidya",
    technicalRound: "Subramani Rajagopal",
    finalStatus: "REJECTED" as FinalStatus,
    interviewDate: new Date(`2023-${11 + Math.floor(i / 20)}-${(i % 28) + 1}`),
    monthYear: new Date(`2023-${11 + Math.floor(i / 20)}-01`),
  })),
  ...Array.from({ length: 21 }, (_, i) => ({
    srNo: 200 + i,
    name: `Campaign Candidate ${i + 1}`,
    positionApplied: "Campaign Manager",
    department: "Campaign Management",
    source: "Portal",
    sourceDetails: "Naukri.com",
    hrInterviewer: "Ketaki Vaidya",
    finalStatus: "REJECTED" as FinalStatus,
    interviewDate: new Date(`2025-11-${(i % 28) + 1}`),
    monthYear: new Date("2025-11-01"),
  })),
];

async function main() {
  console.log("🌱 Seeding database...");
  await prisma.candidate.deleteMany();

  for (const candidate of SEED_DATA) {
    await prisma.candidate.create({ data: candidate });
  }

  console.log(`✅ Seeded ${SEED_DATA.length} candidates`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
