export type ParsedEntry = {
  type: "in" | "out";
  amount: number;
  category: string;
  description: string;
};

const CATEGORIES: Record<string, string[]> = {
  Alimentação: ["almoço", "almoco", "janta", "jantar", "lanche", "comida", "ifood", "mercado", "padaria", "café", "cafe", "restaurante", "pizza"],
  Transporte: ["uber", "gasolina", "combustível", "combustivel", "ônibus", "onibus", "metrô", "metro", "99", "estacionamento"],
  Saúde: ["academia", "suplemento", "whey", "creatina", "farmácia", "farmacia", "médico", "medico", "remédio", "remedio"],
  Moradia: ["aluguel", "luz", "água", "agua", "internet", "condomínio", "condominio", "gás", "gas"],
  Lazer: ["cinema", "bar", "jogo", "netflix", "spotify", "viagem", "balada"],
  Educação: ["curso", "livro", "faculdade", "mentoria"],
  Salário: ["salário", "salario", "pagamento", "freela", "freelance", "bico", "recebi", "vendi", "venda", "pix recebido"],
};

const INCOME_WORDS = ["recebi", "ganhei", "entrou", "salário", "salario", "vendi", "venda", "receita", "pagaram"];

export function parseFinanceCommand(text: string): ParsedEntry | null {
  const t = text.toLowerCase().trim();
  if (!t) return null;

  const match = t.match(/(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(k|mil|reais|conto|pila)?/);
  if (!match) return null;
  let amount = parseFloat(match[1].replace(".", "").replace(",", "."));
  if (match[2] === "k" || match[2] === "mil") amount *= 1000;
  if (!amount || amount <= 0) return null;

  const isIncome = INCOME_WORDS.some((w) => t.includes(w));
  let category = isIncome ? "Salário" : "Outros";
  for (const [cat, words] of Object.entries(CATEGORIES)) {
    if (words.some((w) => t.includes(w))) {
      category = cat;
      break;
    }
  }

  return {
    type: isIncome ? "in" : "out",
    amount,
    category,
    description: text.trim(),
  };
}

/** Optional Gemini-powered parsing when an API key is configured and online. */
export async function parseWithGemini(text: string, apiKey: string): Promise<ParsedEntry | null> {
  const prompt = `Extraia da frase em português os campos JSON: type ("in" para receita, "out" para gasto), amount (número em reais), category (uma palavra), description (curta). Responda SOMENTE o JSON. Frase: "${text}"`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) throw new Error("Gemini indisponível");
  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const json = raw.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return null;
  const parsed = JSON.parse(json);
  if (!parsed?.amount) return null;
  return {
    type: parsed.type === "in" ? "in" : "out",
    amount: Number(parsed.amount),
    category: String(parsed.category ?? "Outros"),
    description: String(parsed.description ?? text),
  };
}
