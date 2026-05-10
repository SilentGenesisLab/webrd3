export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>webrd3</h1>
      <p>Real-time IM customer-service system.</p>
      <ul>
        <li>
          <a href="/chat">User chat (/chat)</a>
        </li>
        <li>
          <a href="/agent">Agent console (/agent)</a>
        </li>
        <li>
          <a href="/api/health">Health check (/api/health)</a>
        </li>
      </ul>
    </main>
  );
}
