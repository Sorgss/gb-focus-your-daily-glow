# GB Focus: Your Daily Glow

Crie um aplicativo web mobile-first de alta performance e desenvolvimento pessoal chamado "GB Focus", com estilo visual "Monk Mode" / "Glow Up" em Dark Mode (fundo preto/cinza escuro #09090B, detalhes em cinza claro/branco e destaques em verde neon #22C55E para elementos ativos).

O aplicativo deve ser um PWA (Progressive Web App) totalmente funcional e otimizado para funcionar 100% offline, salvando todos os dados no LocalStorage ou IndexedDB do navegador.

Menu inferior fixo (Bottom Navigation) com as seguintes 5 abas:

1. HÁBITOS:

- Contador de ofensiva no topo com número de dias em destaque ("X DIAS - DIA VENCIDO") e uma frase motivacional em destaque.

- Lista de verificação diária de hábitos (ex: Leitura, Creatina, Treino, Dieta, Água) com caixa de seleção (checkbox). Ao marcar, atualiza o progresso visualmente.

- Botão para adicionar novos hábitos personalizados.

2. TAREFAS & METAS:

- Seção de Tarefas organizadas por abas: "Pendentes/Vencidas" e "Concluídas".

- Seção de Metas Visuais com cards individuais contendo: Título da meta, foto de capa/ícone, valor/progresso em % ou R$ (ex: Meta Financeira de R$ 50k, Meta Física) e barra de progresso.

3. TREINOS:

- Registro de rotinas de musculação (ex: Peito/Tríceps, Costas/Bíceps).

- Tabela interativa para cada exercício com colunas para: Série, Carga (kg) e Repetições.

- Botão "Finalizar Treino" para salvar o histórico.

4. DIETA & MACROS:

- Painel no topo mostrando os totais do dia: Proteína (g), Carboidratos (g), Gordura (g) e Calorias Totais (kcal) com barra de progresso em relação a uma meta diária.

- Calculadora/Estimadora de gasto diário baseado nos dados do usuário (Sexo, Idade, Altura, Peso, Nível de Atividade).

- Formulário para adicionar refeições e alimentos manualmente.

5. FINANÇAS (COM IA):

- Dashboard com Saldo Atual, Entradas (Receitas) e Saídas (Gastos).

- Campo de input estilo Chat onde o usuário pode digitar comandos rápidos para registrar gastos (ex: "Gastei 50 no almoço"). Crie um parser inteligente usando expressões regulares ou lógica local para extrair o valor, categoria e tipo (gasto ou receita) e atualizar o saldo automaticamente, mesmo offline. Se houver chave da API do Gemini cadastrada nas configurações, utilize a API para processar a linguagem natural.

- Extrato com a lista das últimas movimentações com opção de excluir.

CONFIGURAÇÃO TÉCNICA E OFFLINE:

- Configure um Service Worker para fazer cache de todos os ativos da interface (HTML, CSS, JS) permitindo abertura instantânea sem conexão de internet.

- Implemente persistência de dados completa no LocalStorage para que hábitos marcados, tarefas, treinos, dieta e finanças não se percam ao fechar ou recarregar o app.

- Adicione o manifesto PWA (manifest.json) para permitir que o usuário adicione o app diretamente à Tela de Início do Android/iOS.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e07d2888-1877-421a-b582-4602a67577ea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
