import FarmScene from "./components/FarmScene.jsx";

export default function App() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-farm-night text-slate-100">
      <FarmScene />

      <section className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3 self-center rounded-2xl border border-farm-line bg-farm-panel px-4 py-3 shadow-panel backdrop-blur-md sm:self-stretch">
          <StatCard label="Temp" value="24°C" />
          <StatCard label="pH" value="6.0" />
          <StatCard label="EC" value="1.5" />
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="min-w-[88px] rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/55">{label}</p>
      <p className="mt-1 text-base font-semibold text-white sm:text-lg">{value}</p>
    </div>
  );
}
