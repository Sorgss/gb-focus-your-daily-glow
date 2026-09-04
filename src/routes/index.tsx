import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Shell, Card, Bar } from "@/components/Shell";
import { usePersistentState, todayKey, uid } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GB Focus — Hábitos e Ofensiva Diária" },
      {
        name: "description",
        content:
          "Monte sua rotina Monk Mode: marque hábitos diários, acompanhe a ofensiva de dias vencidos e evolua todos os dias.",
      },
      { property: "og:title", content: "GB Focus — Hábitos e Ofensiva Diária" },
      {
        property: "og:description",
        content: "Hábitos, ofensiva diária e disciplina em um app offline-first.",
      },
    ],
  }),
  component: HabitsPage,
});

type Habit = { id: string; name: string };
type Log = Record<string, string[]>;

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Leitura" },
  { id: "h2", name: "Creatina" },
  { id: "h3", name: "Treino" },
  { id: "h4", name: "Dieta" },
  { id: "h5", name: "Água 3L" },
];

const QUOTES = [
  "Disciplina é fazer o que precisa ser feito, mesmo sem vontade.",
  "Você não some. Você evolui em silêncio.",
  "Um dia de cada vez. Sem desculpas.",
  "O desconforto de hoje é a sua vantagem de amanhã.",
  "Ninguém vem te salvar. Levanta.",
];

function shiftDay(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function HabitsPage() {
  const [habits, setHabits] = usePersistentState<Habit[]>("habits", DEFAULT_HABITS);
  const [log, setLog] = usePersistentState<Log>("habitLog", {});
  const [newHabit, setNewHabit] = useState("");
  const today = todayKey();
  const done = log[today] ?? [];

  const streak = useMemo(() => {
    if (habits.length === 0) return 0;
    let count = 0;
    let day = today;
    for (let i = 0; i < 730; i++) {
      const d = log[day] ?? [];
      const complete = habits.every((h) => d.includes(h.id));
      if (complete) {
        count++;
      } else if (day !== today) {
        break;
      }
      day = shiftDay(day, -1);
    }
    return count;
  }, [habits, log, today]);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const pct = habits.length ? (done.length / habits.length) * 100 : 0;
  const dayWon = habits.length > 0 && done.length === habits.length;

  const toggle = (id: string) =>
    setLog((prev) => {
      const list = prev[today] ?? [];
      return {
        ...prev,
        [today]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });

  const addHabit = () => {
    const name = newHabit.trim();
    if (!name) return;
    setHabits((h) => [...h, { id: uid(), name }]);
    setNewHabit("");
  };

  return (
    <Shell title="GB Focus" subtitle="Monk Mode ativado">
      <Card className="glow-surface relative overflow-hidden text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ofensiva</p>
        <p className="font-display text-6xl font-bold text-primary text-glow">{streak}</p>
        <p className="font-display text-sm uppercase tracking-widest">
          {streak === 1 ? "dia" : "dias"} — {dayWon ? "DIA VENCIDO" : "DIA EM ABERTO"}
        </p>
        <p className="mt-3 text-sm italic text-muted-foreground">&ldquo;{quote}&rdquo;</p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-display uppercase tracking-widest">Checklist de hoje</span>
          <span className="text-muted-foreground">
            {done.length}/{habits.length}
          </span>
        </div>
        <Bar value={pct} />
        <ul className="mt-4 space-y-2">
          {habits.map((h) => {
            const checked = done.includes(h.id);
            return (
              <li key={h.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggle(h.id)}
                  className={`flex flex-1 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                    checked
                      ? "border-primary/50 bg-accent text-accent-foreground"
                      : "border-border bg-secondary/40 text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-md border ${
                      checked ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  >
                    {checked && <Check className="size-3.5 text-primary-foreground" />}
                  </span>
                  <span className={checked ? "line-through opacity-70" : ""}>{h.name}</span>
                </button>
                <button
                  onClick={() => setHabits((prev) => prev.filter((x) => x.id !== h.id))}
                  className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                  aria-label={`Remover ${h.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Novo hábito"
            className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            onClick={addHabit}
            className="rounded-xl bg-primary px-4 text-primary-foreground"
            aria-label="Adicionar hábito"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </Card>
    </Shell>
  );
}
