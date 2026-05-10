export const metadata = {
  title: "webrd3 — agent console",
};

export default function AgentPage() {
  return (
    <main className="mx-auto grid h-full max-w-5xl grid-cols-[260px_1fr] gap-4 p-8">
      <aside
        aria-label="Conversation list"
        className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400"
      >
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Inbox</h2>
        Placeholder conversation list.
      </aside>
      <section
        aria-label="Active conversation"
        className="flex flex-col rounded-lg border border-slate-200"
      >
        <header className="border-b border-slate-200 p-3 text-sm font-medium text-slate-700">
          Agent console
        </header>
        <div className="flex-1 p-4 text-sm text-slate-400">
          Placeholder agent workspace. Realtime + assignment logic lands in T3.
        </div>
      </section>
    </main>
  );
}
