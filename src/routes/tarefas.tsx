import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus, Trash2, Target } from "lucide-react";
import { Shell, Card, Bar } from "@/components/Shell";
import { usePersistentState, uid, todayKey, dateLabel } from "@/lib/storage";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas e Metas — GB Focus" },
      {
        name: "description",
        content:
          "Organize tarefas pendentes e concluídas e acompanhe metas visuais financeiras e físicas com barra de progresso.",
      },
      { property: "og:title", content: "Tarefas e Metas — GB Focus" },
      {
        property: "og:description",
        content: "Tarefas pendentes, vencidas e concluídas + metas com progresso.",
      },
    ],
  }),
  component: TasksPage,
});

type Task = { id: string; title: string; due: string; done: boolean };
type Goal = { id: string; title: string; emoji: string; current: number; target: number; unit: string };

const DEFAULT_GOALS: Goal[] = [
  { id: "g1", title: "Meta Financeira", emoji: "💰", current: 12500, target: 50000, unit: "R$" },
  { id: "g2", title: "Meta Física", emoji: "🏋️", current: 6, target: 12, unit: "kg de massa" },
];

function TasksPage() {
  const [tasks, setTasks] = usePersistentState<Task[]>("tasks", []);
  const [goals, setGoals] = usePersistentState<Goal[]>("goals", DEFAULT_GOALS);
  const [tab, setTab] = useState<"open" | "done">("open");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(todayKey());
  const [goalForm, setGoalForm] = useState(false);
  const [gTitle, setGTitle] = useState("");
  const [gEmoji, setGEmoji] = useState("🎯");
  const [gTarget, setGTarget] = useState("100");
  const [gUnit, setGUnit] = useState("%");

  const today = todayKey();
  const list = tasks.filter((t) => (tab === "done" ? t.done : !t.done));

  const addTask = () => {
    if (!title.trim()) return;
    setTasks((p) => [{ id: uid(), title: title.trim(), due, done: false }, ...p]);
    setTitle("");
  };

  const addGoal = () => {
    if (!gTitle.trim()) return;
    setGoals((p) => [
      ...p,
      {
        id: uid(),
        title: gTitle.trim(),
        emoji: gEmoji || "🎯",
        current: 0,
        target: Number(gTarget) || 100,
        unit: gUnit,
      },
    ]);
    setGTitle("");
    setGoalForm(false);
  };

  return (
    <Shell title="Tarefas & Metas" subtitle="Execução acima da motivação">
      <Card>
        <div className="mb-3 flex gap-2 rounded-xl bg-secondary/50 p-1 text-sm">
          {(["open", "done"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
                tab === t ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "open" ? "Pendentes/Vencidas" : "Concluídas"}
            </button>
          ))}
        </div>

        {tab === "open" && (
          <div className="mb-4 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Nova tarefa"
              className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={addTask}
                className="rounded-xl bg-primary px-4 text-primary-foreground"
                aria-label="Adicionar tarefa"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {list.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">Nada por aqui ainda.</li>
          )}
          {list.map((t) => {
            const overdue = !t.done && t.due < today;
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-3"
              >
                <button
                  onClick={() =>
                    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
                  }
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    t.done ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                  aria-label="Concluir"
                >
                  {t.done && <Check className="size-3.5 text-primary-foreground" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </p>
                  <p className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                    {overdue ? "Vencida em " : "Prazo "} {dateLabel(t.due)}
                  </p>
                </div>
                <button
                  onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Excluir tarefa"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-sm uppercase tracking-widest">Metas visuais</h2>
        <button
          onClick={() => setGoalForm((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary"
        >
          <Plus className="size-3.5" /> nova meta
        </button>
      </div>

      {goalForm && (
        <Card className="space-y-2">
          <div className="flex gap-2">
            <input
              value={gEmoji}
              onChange={(e) => setGEmoji(e.target.value)}
              className="w-14 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-center text-sm outline-none focus:border-primary"
            />
            <input
              value={gTitle}
              onChange={(e) => setGTitle(e.target.value)}
              placeholder="Título da meta"
              className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={gTarget}
              onChange={(e) => setGTarget(e.target.value)}
              inputMode="decimal"
              placeholder="Alvo"
              className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              value={gUnit}
              onChange={(e) => setGUnit(e.target.value)}
              placeholder="Unidade (R$, kg, %)"
              className="flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={addGoal}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Criar meta
          </button>
        </Card>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const pct = g.target ? (g.current / g.target) * 100 : 0;
          return (
            <Card key={g.id} className="glow-surface">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-2xl">
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm uppercase tracking-wide">{g.title}</p>
                    <button
                      onClick={() => setGoals((p) => p.filter((x) => x.id !== g.id))}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Excluir meta"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {g.unit === "R$"
                      ? `R$ ${g.current.toLocaleString("pt-BR")} de R$ ${g.target.toLocaleString("pt-BR")}`
                      : `${g.current} / ${g.target} ${g.unit}`}{" "}
                    · {pct.toFixed(0)}%
                  </p>
                  <div className="mt-2">
                    <Bar value={pct} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Target className="size-3.5 text-primary" />
                    <input
                      type="number"
                      value={g.current}
                      onChange={(e) =>
                        setGoals((p) =>
                          p.map((x) =>
                            x.id === g.id ? { ...x, current: Number(e.target.value) } : x,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-input bg-secondary/40 px-2 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
