import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Shell, Card } from "@/components/Shell";
import { usePersistentState, uid, todayKey, dateLabel } from "@/lib/storage";

export const Route = createFileRoute("/treinos")({
  head: () => ({
    meta: [
      { title: "Treinos — GB Focus" },
      {
        name: "description",
        content:
          "Registre rotinas de musculação com séries, carga em kg e repetições, e salve o histórico de cada treino finalizado.",
      },
      { property: "og:title", content: "Treinos — GB Focus" },
      { property: "og:description", content: "Rotinas, séries, carga e histórico de treinos." },
    ],
  }),
  component: WorkoutsPage,
});

type SetRow = { id: string; weight: string; reps: string };
type Exercise = { id: string; name: string; sets: SetRow[] };
type Routine = { id: string; name: string; exercises: Exercise[] };
type HistoryEntry = { id: string; date: string; routine: string; volume: number; sets: number };

const DEFAULT_ROUTINES: Routine[] = [
  {
    id: "r1",
    name: "Peito / Tríceps",
    exercises: [
      { id: "e1", name: "Supino reto", sets: [{ id: "s1", weight: "", reps: "" }] },
      { id: "e2", name: "Tríceps corda", sets: [{ id: "s2", weight: "", reps: "" }] },
    ],
  },
  {
    id: "r2",
    name: "Costas / Bíceps",
    exercises: [
      { id: "e3", name: "Puxada frontal", sets: [{ id: "s3", weight: "", reps: "" }] },
      { id: "e4", name: "Rosca direta", sets: [{ id: "s4", weight: "", reps: "" }] },
    ],
  },
];

function WorkoutsPage() {
  const [routines, setRoutines] = usePersistentState<Routine[]>("routines", DEFAULT_ROUTINES);
  const [history, setHistory] = usePersistentState<HistoryEntry[]>("workoutHistory", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newRoutine, setNewRoutine] = useState("");
  const [newExercise, setNewExercise] = useState("");

  const active = routines.find((r) => r.id === activeId) ?? routines[0];

  const update = (fn: (r: Routine) => Routine) =>
    setRoutines((p) => p.map((r) => (r.id === active?.id ? fn(r) : r)));

  const finish = () => {
    if (!active) return;
    let volume = 0;
    let sets = 0;
    active.exercises.forEach((e) =>
      e.sets.forEach((s) => {
        const w = parseFloat(s.weight.replace(",", ".")) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > 0 || r > 0) sets++;
        volume += w * r;
      }),
    );
    setHistory((h) => [
      { id: uid(), date: todayKey(), routine: active.name, volume, sets },
      ...h,
    ]);
    update((r) => ({
      ...r,
      exercises: r.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s, weight: "", reps: "" })),
      })),
    }));
  };

  return (
    <Shell title="Treinos" subtitle="Carga progressiva, sempre">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {routines.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveId(r.id)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs transition-colors ${
              active?.id === r.id
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newRoutine}
          onChange={(e) => setNewRoutine(e.target.value)}
          placeholder="Nova rotina (ex: Perna)"
          className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => {
            if (!newRoutine.trim()) return;
            const r = { id: uid(), name: newRoutine.trim(), exercises: [] };
            setRoutines((p) => [...p, r]);
            setActiveId(r.id);
            setNewRoutine("");
          }}
          className="rounded-xl bg-primary px-4 text-primary-foreground"
          aria-label="Adicionar rotina"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {active && (
        <>
          {active.exercises.map((ex) => (
            <Card key={ex.id}>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-sm uppercase tracking-wide">{ex.name}</p>
                <button
                  onClick={() =>
                    update((r) => ({ ...r, exercises: r.exercises.filter((e) => e.id !== ex.id) }))
                  }
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Excluir exercício"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="w-12 pb-2">Série</th>
                    <th className="pb-2">Carga (kg)</th>
                    <th className="pb-2">Reps</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, i) => (
                    <tr key={s.id}>
                      <td className="py-1 text-muted-foreground">{i + 1}</td>
                      <td className="py-1 pr-2">
                        <input
                          inputMode="decimal"
                          value={s.weight}
                          onChange={(e) =>
                            update((r) => ({
                              ...r,
                              exercises: r.exercises.map((x) =>
                                x.id === ex.id
                                  ? {
                                      ...x,
                                      sets: x.sets.map((y) =>
                                        y.id === s.id ? { ...y, weight: e.target.value } : y,
                                      ),
                                    }
                                  : x,
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-secondary/40 px-2 py-1.5 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          inputMode="numeric"
                          value={s.reps}
                          onChange={(e) =>
                            update((r) => ({
                              ...r,
                              exercises: r.exercises.map((x) =>
                                x.id === ex.id
                                  ? {
                                      ...x,
                                      sets: x.sets.map((y) =>
                                        y.id === s.id ? { ...y, reps: e.target.value } : y,
                                      ),
                                    }
                                  : x,
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-input bg-secondary/40 px-2 py-1.5 outline-none focus:border-primary"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            update((r) => ({
                              ...r,
                              exercises: r.exercises.map((x) =>
                                x.id === ex.id
                                  ? { ...x, sets: x.sets.filter((y) => y.id !== s.id) }
                                  : x,
                              ),
                            }))
                          }
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remover série"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() =>
                  update((r) => ({
                    ...r,
                    exercises: r.exercises.map((x) =>
                      x.id === ex.id
                        ? { ...x, sets: [...x.sets, { id: uid(), weight: "", reps: "" }] }
                        : x,
                    ),
                  }))
                }
                className="mt-3 w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground"
              >
                + adicionar série
              </button>
            </Card>
          ))}

          <div className="flex gap-2">
            <input
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              placeholder="Novo exercício"
              className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => {
                if (!newExercise.trim()) return;
                update((r) => ({
                  ...r,
                  exercises: [
                    ...r.exercises,
                    {
                      id: uid(),
                      name: newExercise.trim(),
                      sets: [{ id: uid(), weight: "", reps: "" }],
                    },
                  ],
                }));
                setNewExercise("");
              }}
              className="rounded-xl bg-primary px-4 text-primary-foreground"
              aria-label="Adicionar exercício"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <button
            onClick={finish}
            className="glow-ring flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground"
          >
            <Save className="size-4" /> Finalizar treino
          </button>
        </>
      )}

      <Card>
        <p className="mb-2 font-display text-sm uppercase tracking-widest">Histórico</p>
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum treino salvo ainda.</p>
        )}
        <ul className="space-y-2">
          {history.slice(0, 20).map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm">
              <span>
                {h.routine}
                <span className="ml-2 text-xs text-muted-foreground">{dateLabel(h.date)}</span>
              </span>
              <span className="text-xs text-primary">
                {h.sets} séries · {h.volume.toLocaleString("pt-BR")} kg
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </Shell>
  );
}
