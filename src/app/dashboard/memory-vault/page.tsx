import dynamic from "next/dynamic";

const MemoryVaultClient = dynamic(() => import("./MemoryVaultClient"), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-burgundy-primary/30 border-t-burgundy-primary animate-spin" />
      <p className="text-zinc-500 text-sm font-medium">Loading Memory Vault...</p>
    </div>
  ),
  ssr: false,
});

export default function MemoryVaultPage() {
  return <MemoryVaultClient />;
}
