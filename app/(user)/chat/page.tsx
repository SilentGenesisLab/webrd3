export const metadata = {
  title: "webrd3 — chat",
};

export default function ChatPage() {
  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col gap-4 p-8">
      <header>
        <h1 className="text-2xl font-semibold text-brand">User chat</h1>
        <p className="text-sm text-slate-500">
          End-user surface for contacting customer service. Realtime wiring lands in T3.
        </p>
      </header>
      <section
        aria-label="Conversation"
        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400"
      >
        Placeholder conversation pane.
      </section>
      <form className="flex gap-2">
        <input
          aria-label="Message"
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="Type a message…"
          disabled
        />
        <button
          type="button"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white opacity-60"
          disabled
        >
          Send
        </button>
      </form>
    </main>
  );
}
