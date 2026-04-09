"use client";
// components/dashboard/ProfilesView.tsx

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SectionHeader, StatusBadge, DeptTag } from "./UIKit";
import { fmtCTC, fmtDate } from "@/lib/utils";

interface Props {
  candidates: any[];
  onRefresh: () => void;
}

const PAGE_SIZE = 20;

export function ProfilesView({ candidates, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("interviewDate");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const filtered = useMemo(() => {
    let data = [...candidates];

    if (statusFilter !== "all") {
      data = data.filter((c) => c.finalStatus === statusFilter.toUpperCase());
    }
    if (deptFilter) {
      data = data.filter((c) => c.department === deptFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.positionApplied?.toLowerCase().includes(q) ||
          c.department?.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return -sortDir;
      if (av > bv) return sortDir;
      return 0;
    });

    return data;
  }, [candidates, search, statusFilter, deptFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
    setPage(1);
  }

  const statusFilters = [
    { key: "all", label: `All (${candidates.length})` },
    { key: "selected", label: `✅ Selected (${candidates.filter((c) => c.finalStatus === "SELECTED").length})` },
    { key: "rejected", label: `❌ Rejected (${candidates.filter((c) => c.finalStatus === "REJECTED").length})` },
    { key: "shortlisted", label: `⏳ Shortlisted (${candidates.filter((c) => c.finalStatus === "SHORTLISTED").length})` },
  ];

  const departments = [...new Set(candidates.map((c) => c.department).filter(Boolean))];

  return (
    <div>
      <SectionHeader
        title="All Candidate Profiles"
        sub="Complete database — click column headers to sort"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, role, department..."
            className="pl-8 pr-4 py-2 rounded-lg text-sm outline-none w-56 transition-all"
            style={{
              background: "#181b23",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#f0f2f7",
            }}
          />
        </div>

        {statusFilters.map((f) => (
          <FilterBtn
            key={f.key}
            active={statusFilter === f.key}
            onClick={() => { setStatusFilter(f.key); setDeptFilter(""); setPage(1); }}
          >
            {f.label}
          </FilterBtn>
        ))}

        {departments.slice(0, 4).map((dept) => (
          <FilterBtn
            key={dept}
            active={deptFilter === dept}
            onClick={() => {
              setDeptFilter(deptFilter === dept ? "" : dept);
              setStatusFilter("all");
              setPage(1);
            }}
          >
            {dept.split(" ")[0]}
          </FilterBtn>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#111318", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#181b23" }}>
                {[
                  { key: "name", label: "Name" },
                  { key: "interviewDate", label: "Date" },
                  { key: "positionApplied", label: "Role" },
                  { key: "department", label: "Department" },
                  { key: "source", label: "Source" },
                  { key: "hrInterviewer", label: "HR Interviewer" },
                  { key: "finalStatus", label: "Status" },
                  { key: "joined", label: "Joined" },
                  { key: "offeredCtc", label: "CTC" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap border-b hover:text-white transition-colors"
                    style={{
                      color: sortKey === col.key ? "#c8f135" : "#6b7280",
                      borderColor: "rgba(255,255,255,0.07)",
                    }}
                  >
                    {col.label} {sortKey === col.key ? (sortDir === 1 ? "↑" : "↓") : "↕"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((c) => (
                <tr
                  key={c.id}
                  className="border-b transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{fmtDate(c.interviewDate)}</td>
                  <td className="px-4 py-3">{c.positionApplied || "—"}</td>
                  <td className="px-4 py-3">
                    <DeptTag dept={c.department || "—"} />
                  </td>
                  <td className="px-4 py-3 text-[#9ca3af]">{c.source || "—"}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{c.hrInterviewer || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.finalStatus || "PENDING"} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-semibold"
                      style={{
                        color: c.joined === "YES" ? "#c8f135" : c.joined === "NO" ? "#ff4d6d" : c.joined === "PENDING" ? "#f1a535" : "#6b7280",
                      }}
                    >
                      {c.joined || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#c8f135" }}>
                    {fmtCTC(c.offeredCtc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs text-[#6b7280]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-md text-xs flex items-center justify-center transition-all"
                style={{
                  background: p === page ? "rgba(200,241,53,0.1)" : "#181b23",
                  border: `1px solid ${p === page ? "rgba(200,241,53,0.3)" : "rgba(255,255,255,0.07)"}`,
                  color: p === page ? "#c8f135" : "#9ca3af",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? "rgba(200,241,53,0.1)" : "#181b23",
        border: `1px solid ${active ? "rgba(200,241,53,0.3)" : "rgba(255,255,255,0.07)"}`,
        color: active ? "#c8f135" : "#6b7280",
      }}
    >
      {children}
    </button>
  );
}
