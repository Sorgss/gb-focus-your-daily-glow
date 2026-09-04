import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card } from "@/components/Shell";
import { usePersistentState } from "@/lib/storage";

export const Route = createFileRoute("/config")({
  head: () => ({
    meta: [
      { title: "Configurações — GB Focus" },
      {
        name: "description",
        content:
          "Configure a chave da API do Gemini para leitura inteligente de gastos e gerencie os dados salvos no dispositivo.",
      },
      { property: "og:title", content: "Configurações — GB Focus" },
      { property: "og:description", content: "Chave Gemini opcional e gestão de dados locais." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [key, setKey] = usePersistentState<string>("geminiKey", "");
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const value = draft ?? key;

  return (
    <Shell title="Configurações" subtitle="Tudo salvo no seu dispositivo">
      <Card className="space-y-3">
        <p className="font-display text-sm uppercase tracking-widest">Chave da API do Gemini</p>
        <p className="text-xs text-muted-foreground">
          Opcional. Com a chave, os comandos de finanças são interpretados por IA quando você
          estiver online. Sem ela, o app usa o interpretador local offline.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="AIza..."
          className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => {
            setKey(value);
            setDraft(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {saved ? "Salvo!" : "Salvar chave"}
        </button>
      </Card>

      <Card className="space-y-3">
        <p className="font-display text-sm uppercase tracking-widest">Dados locais</p>
        <p className="text-xs text-muted-foreground">
          Hábitos, tarefas, metas, treinos, dieta e finanças ficam no armazenamento do navegador e
          funcionam 100% offline.
        </p>
        <button
          onClick={() => {
            if (!confirm("Apagar todos os dados do GB Focus?")) return;
            Object.keys(localStorage)
              .filter((k) => k.startsWith("gbfocus:"))
              .forEach((k) => localStorage.removeItem(k));
            location.reload();
          }}
          className="w-full rounded-xl border border-destructive py-2.5 text-sm font-semibold text-destructive"
        >
          Apagar todos os dados
        </button>
      </Card>
    </Shell>
  );
}
