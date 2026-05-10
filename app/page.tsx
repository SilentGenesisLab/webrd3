export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-3xl font-semibold text-brand">webrd3</h1>
      <p className="text-slate-600">Real-time IM customer-service system.</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <a className="text-brand hover:underline" href="/chat">
            User chat (/chat)
          </a>
        </li>
        <li>
          <a className="text-brand hover:underline" href="/agent">
            Agent console (/agent)
          </a>
        </li>
        <li>
          <a className="text-brand hover:underline" href="/api/health">
            Health check (/api/health)
          </a>
        </li>
      </ul>
    </main>
  );
}
