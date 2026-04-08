import { useState } from "react";
import FarmScene from "./components/FarmScene.jsx";

const INITIAL_STATE = {
  emptyPots: 3,
  plantedSlotIds: []
};

export default function App() {
  const [farmState, setFarmState] = useState(INITIAL_STATE);

  const handlePlant = (slotId) => {
    setFarmState((current) => {
      if (current.emptyPots <= 0 || current.plantedSlotIds.includes(slotId)) {
        return current;
      }

      return {
        emptyPots: current.emptyPots - 1,
        plantedSlotIds: [...current.plantedSlotIds, slotId]
      };
    });
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-farm-night text-slate-100">
      <FarmScene
        plantedSlotIds={farmState.plantedSlotIds}
        onPlant={handlePlant}
      />

      <section className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3 self-center rounded-2xl border border-farm-line bg-farm-panel px-4 py-3 shadow-panel backdrop-blur-md sm:self-stretch">
          <StatCard label="Temp" value="24°C" />
          <StatCard label="pH" value="6.0" />
          <StatCard label="EC" value="1.5" />
        </div>

        <div className="pointer-events-auto flex flex-col gap-4 rounded-3xl border border-farm-line bg-farm-panel p-4 shadow-panel backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Inventory</p>
            <p className="mt-2 text-lg font-semibold text-white">
              Empty Pots: {farmState.emptyPots}
            </p>
          </div>

          <button
            type="button"
            className="rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/25 active:scale-[0.98]"
          >
            Activate Pump
          </button>
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
