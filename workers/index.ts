// BullMQ worker entry point — real queue handlers are wired up in T2.
// Run with: pnpm worker

async function main(): Promise<void> {
  console.log("[worker] webrd3 worker entry — no queues registered yet (T2).");
}

main().catch((err: unknown) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
