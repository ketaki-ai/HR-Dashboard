"use client";
// components/dashboard/DashboardClient.tsx

import { useState, useEffect, useCallback } from "react";
import { Header } from "./Header";
import { NavTabs } from "./NavTabs";
import { OverviewView } from "./OverviewView";
import { PipelineView } from "./PipelineView";
import { ProfilesView } from "./ProfilesView";
import { OffersView } from "./OffersView";
import { AnalyticsView } from "./AnalyticsView";
import { UploadModal } from "./UploadModal";
import { FooterStrip } from "./FooterStrip";

export type TabName = "overview" | "pipeline" | "profiles" | "offers" | "analytics";

interface Props {
  initialData: {
    analytics: any;
    candidates: any[];
  };
}

export function DashboardClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [analytics, setAnalytics] = useState(initialData.analytics);
  const [candidates, setCandidates] = useState(initialData.candidates);
  const [showUpload, setShowUpload] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ─── Auto-refresh every 30 seconds ───────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const [aRes, cRes] = await Promise.all([
        fetch("/api/analytics", { cache: "no-store" }),
        fetch("/api/candidates?limit=200", { cache: "no-store" }),
      ]);
      if (aRes.ok) setAnalytics(await aRes.json());
      if (cRes.ok) {
        const data = await cRes.json();
        setCandidates(data.candidates || []);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    setTimeout(refresh, 1000); // refresh after upload
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onUploadClick={() => setShowUpload(true)} />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-8 py-7 pb-20">
        {activeTab === "overview" && (
          <OverviewView analytics={analytics} candidates={candidates} />
        )}
        {activeTab === "pipeline" && (
          <PipelineView candidates={candidates} />
        )}
        {activeTab === "profiles" && (
          <ProfilesView candidates={candidates} onRefresh={refresh} />
        )}
        {activeTab === "offers" && (
          <OffersView candidates={candidates} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsView analytics={analytics} candidates={candidates} />
        )}
      </main>

      <FooterStrip
        total={analytics.totalProfiles}
        lastRefresh={lastRefresh}
      />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
