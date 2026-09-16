import { AlertTriangle, ArrowUpRight, Database, Info } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
  disabled = true,
  actionNode,
}: {
  title: string;
  description: string;
  action?: string;
  disabled?: boolean;
  actionNode?: React.ReactNode;
}) {
  return (
    <header className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-white px-6 py-6 shadow-[0_4px_20px_rgba(9,95,199,0.03)] sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-7">
      <div className="relative z-10">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-cyan" />
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            GO Workspace
          </p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
      {actionNode ?? (action && (
        <button
          disabled={disabled}
          title={disabled ? "Connect Supabase to enable this action" : undefined}
          className="relative shrink-0 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(9,95,199,0.28)] transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {action}
        </button>
      ))}
    </header>
  );
}

export function SetupNotice({ issues = [] }: { issues?: string[] }) {
  return (
    <section
      className="mb-6 flex gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm shadow-xs"
      role="status"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
        <AlertTriangle className="size-5" />
      </div>
      <div className="flex-1 pt-0.5">
        <h2 className="font-semibold text-slate-900">Data source not connected</h2>
        <p className="mt-1 text-xs text-muted leading-relaxed">
          The interface is ready, but operational data is in preview mode until environment variables and database connections are configured.
        </p>
        {issues.length > 0 && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer font-semibold text-slate-800 hover:text-primary">
              Configuration details ({issues.length} items)
            </summary>
            <ul className="mt-2 list-disc pl-5 font-mono text-[11px] text-muted space-y-1">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}

export function EmptyTable({
  columns,
  noun,
}: {
  columns: readonly string[];
  noun: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_4px_20px_rgba(3,34,84,0.03)]">
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={`${noun} table`}
      >
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle/70">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="grid min-h-64 place-items-center px-6 py-14 text-center">
                  <div>
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-subtle text-muted">
                      <Database className="size-6 text-primary/70" />
                    </div>
                    <h2 className="mt-4 font-bold text-navy">No {noun} available</h2>
                    <p className="mt-1 max-w-md text-xs text-muted leading-relaxed">
                      Connect the workspace database to load live persisted records. Demo placeholders are maintained safely in preview mode.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DefinitionLink() {
  return (
    <Link
      href="/docs/metrics"
      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
    >
      Metric definitions <ArrowUpRight className="size-3" />
    </Link>
  );
}

export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-primary-subtle/50 px-4 py-3 text-xs text-navy shadow-xs">
      <Info className="size-4 shrink-0 text-primary" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
