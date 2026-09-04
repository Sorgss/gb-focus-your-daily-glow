import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Shell, Card, Bar } from "@/components/Shell";
import { usePersistentState, uid, todayKey } from "@/lib/storage";

export const Route = createFileRoute("/dieta")({
  head: () => ({
    meta: [
      { title: "Dieta & Macros — GB Focus" },
      {
        name: "description",
        content:
          "Controle proteína, carboidrato, gordura e calorias do dia, calcule seu gasto energético e registre refeições manualmente.",
      },
      { property: "og:title", content: "Dieta & Macros — GB Focus" },
      { property: "og:description", content: "Macros diários, TDEE e registro de refeições." },
    ],
  }),
  component: DietPage,
});

type Food = { id: string; date: string; meal: string; name: string; p: number; c: number; f: number };
type Targets = { kcal: number; p: number; c: number; f: number };
type Profile = {
  sex: "m" | "f";
  age: number;
  height: number;
  weight: number;
  activity: number;
};

const MEALS = ["Café da manhã", "Almoço", "Lanche", "Jantar", "Ceia"];
const DEFAULT_TARGETS: Targets = { kcal: 2600, p: 180, c: 280, f: 70 };
const DEFAULT_PROFILE: Profile = { sex: "m", age: 28, height: 178, weight: 80, activity: 1.55 };

function DietPage() {
  const [foods, setFoods] = usePersistentState<Food[]>("foods", []);
  const [targets, setTargets] = usePersistentState<Targets>("macroTargets", DEFAULT_TARGETS);
  const [profile, setProfile] = usePersistentState<Profile>("profile", DEFAULT_PROFILE);
  const [openCalc, setOpenCalc] = useState(false);
  const [meal, setMeal] = useState(MEALS[1]);
  const [form, setForm] = useState({ name: "", p: "", c: "", f: "" });

  const today = todayKey();
  const todays = useMemo(() => foods.filter((f) => f.date === today), [foods, today]);
  const total = todays.reduce(
    (a, f) => ({ p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }),
    { p: 0, c: 0, f: 0 },
  );
  const kcal = total.p * 4 + total.c * 4 + total.f * 9;

  const tdee = useMemo(() => {
    const { sex, age, height, weight, activity } = profile;
    const bmr =
      10 * weight + 6.25 * height - 5 * age + (sex === "m" ? 5 : -161);
    return Math.round(bmr * activity);
  }, [profile]);

  const add = () => {
    if (!form.name.trim()) return;
    setFoods((p) => [
      {
        id: uid(),
        date: today,
        meal,
        name: form.name.trim(),
        p: Number(form.p) || 0,
        c: Number(form.c) || 0,
        f: Number(form.f) || 0,
      },
      ...p,
    ]);
    setForm({ name: "", p: "", c: "", f: "" });
  };

  const macro = (label: string, value: number, target: number, unit = "g") => (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>
          {Math.round(value)}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="mt-1">
        <Bar value={target ? (value / target) * 100 : 0} />
      </div>
    </div>
  );

  return (
    <Shell title="Dieta & Macros" subtitle="Você é o que você come">
      <Card className="glow-surface space-y-3">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Calorias hoje</p>
          <p className="font-display text-4xl font-bold text-primary text-glow">
            {Math.round(kcal)}
            <span className="text-base"> kcal</span>
          </p>
          <p className="text-xs text-muted-foreground">meta {targets.kcal} kcal</p>
        </div>
        <Bar value={targets.kcal ? (kcal / targets.kcal) * 100 : 0} />
        <div className="space-y-2 pt-1">
          {macro("Proteína", total.p, targets.p)}
          {macro("Carboidratos", total.c, targets.c)}
          {macro("Gordura", total.f, targets.f)}
        </div>
      </Card>

      <Card>
        <button
          onClick={() => setOpenCalc((v) => !v)}
          className="flex w-full items-center justify-between font-display text-sm uppercase tracking-widest"
        >
          <span className="flex items-center gap-2">
            <Calculator className="size-4 text-primary" /> Gasto diário estimado
          </span>
          <span className="text-primary">{tdee} kcal</span>
        </button>

        {openCalc && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex gap-2">
              {(["m", "f"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setProfile((p) => ({ ...p, sex: s }))}
                  className={`flex-1 rounded-xl border py-2 text-xs ${
                    profile.sex === s
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {s === "m" ? "Masculino" : "Feminino"}
                </button>
              ))}
            </div>
            {(
              [
                ["Idade", "age", "anos"],
                ["Altura", "height", "cm"],
                ["Peso", "weight", "kg"],
              ] as const
            ).map(([label, key, unit]) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {label} ({unit})
                </span>
                <input
                  type="number"
                  value={profile[key]}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-24 rounded-lg border border-input bg-secondary/40 px-2 py-1.5 text-right outline-none focus:border-primary"
                />
              </label>
            ))}
            <label className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Atividade</span>
              <select
                value={profile.activity}
                onChange={(e) => setProfile((p) => ({ ...p, activity: Number(e.target.value) }))}
                className="rounded-lg border border-input bg-secondary/40 px-2 py-1.5 outline-none focus:border-primary"
              >
                <option value={1.2}>Sedentário</option>
                <option value={1.375}>Leve</option>
                <option value={1.55}>Moderado</option>
                <option value={1.725}>Intenso</option>
                <option value={1.9}>Atleta</option>
              </select>
            </label>
            <button
              onClick={() =>
                setTargets({
                  kcal: tdee,
                  p: Math.round(profile.weight * 2),
                  f: Math.round(profile.weight * 0.9),
                  c: Math.max(
                    0,
                    Math.round(
                      (tdee - profile.weight * 2 * 4 - profile.weight * 0.9 * 9) / 4,
                    ),
                  ),
                })
              }
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Usar como meta diária
            </button>
          </div>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="font-display text-sm uppercase tracking-widest">Adicionar alimento</p>
        <select
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
          className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          {MEALS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Alimento (ex: 200g frango)"
          className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          {(
            [
              ["P (g)", "p"],
              ["C (g)", "c"],
              ["G (g)", "f"],
            ] as const
          ).map(([label, key]) => (
            <input
              key={key}
              inputMode="decimal"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          ))}
        </div>
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Adicionar
        </button>
      </Card>

      <Card>
        <p className="mb-2 font-display text-sm uppercase tracking-widest">Refeições de hoje</p>
        {todays.length === 0 && (
          <p className="text-sm text-muted-foreground">Nada registrado hoje.</p>
        )}
        <ul className="space-y-2">
          {todays.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
              <div>
                <p>{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.meal} · {f.p}P {f.c}C {f.f}G ·{" "}
                  {Math.round(f.p * 4 + f.c * 4 + f.f * 9)} kcal
                </p>
              </div>
              <button
                onClick={() => setFoods((p) => p.filter((x) => x.id !== f.id))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Excluir alimento"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </Shell>
  );
}
