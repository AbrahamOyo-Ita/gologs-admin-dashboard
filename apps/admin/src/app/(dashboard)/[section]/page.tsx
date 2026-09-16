import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmptyTable, InfoBanner, PageHeader, SetupNotice } from "@/components/page-primitives";
import { moduleDetails, type ModuleKey } from "@/lib/navigation";
import { readEnvironment } from "@/lib/env";
import { ChevronDown, Search } from "lucide-react";
import { TeamInviteButton } from "@/components/team-invite-button";

type Props = { params: Promise<{ section: string }> };

function isModuleKey(value: string): value is ModuleKey {
  return value in moduleDetails;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return isModuleKey(section) ? { title: moduleDetails[section].title } : {};
}

export default async function ModulePage({ params }: Props) {
  const { section } = await params;
  if (!isModuleKey(section)) notFound();
  const detail = moduleDetails[section];
  const environment = readEnvironment();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={detail.title}
        description={detail.description}
        action={section === "team" ? undefined : detail.action}
        actionNode={section === "team" ? <TeamInviteButton /> : undefined}
      />

      {!environment.configured && <SetupNotice issues={environment.issues} />}

      {section === "newsletters" && (
        <InfoBanner>
          Production delivery is guarded. Deliveries remain paused until verified production sender credentials and webhook secrets are configured.
        </InfoBanner>
      )}

      {section === "audit" && (
        <InfoBanner>
          Audit logs are cryptographically verifiable and append-only. No updates or deletions are permitted under standard operator roles.
        </InfoBanner>
      )}

      {/* Modern Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
            <input
              id="filter"
              disabled={!environment.configured}
              className="h-10 min-w-64 rounded-full border border-border bg-white pl-9 pr-4 text-xs shadow-xs outline-none transition placeholder:text-muted focus:border-primary disabled:opacity-60"
              placeholder={`Filter ${detail.noun}…`}
            />
          </div>

          <div className="relative">
            <select
              disabled={!environment.configured}
              aria-label="Status filter"
              className="h-10 appearance-none rounded-full border border-border bg-white pl-4 pr-9 text-xs font-semibold text-slate-700 shadow-xs outline-none transition hover:bg-surface-subtle disabled:opacity-60"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3 text-muted" />
          </div>
        </div>

        <span className="rounded-full bg-surface-subtle px-3.5 py-1.5 text-xs font-semibold text-muted">
          0 {detail.noun} found
        </span>
      </div>

      <div>
        <EmptyTable columns={detail.columns} noun={detail.noun} />
      </div>
    </div>
  );
}
