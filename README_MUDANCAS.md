# PET-Saúde Clima — Backend arrumado

## O que estava errado

O backend deste repo era, na prática, um clone de sistema de venda de
ingressos (Ticketmaster: `venues`, `events`, `tickets`, `bookings`,
`payments`). Nada disso tinha relação com o projeto PET-Saúde Clima
(vigilância epidemiológica x clima x território no Piauí). Isso explicava
vários sintomas:

1. **CDC não funcionava.** O `wal_level=logical` (exigido pelo Debezium
   para replicação lógica) era setado com `ALTER SYSTEM SET` dentro do
   script de init do Postgres (`001_init.sql`). `ALTER SYSTEM` só grava o
   `postgresql.auto.conf` — não reinicia o Postgres. Como esse script roda
   no *primeiro boot* do container (antes de qualquer restart), o Postgres
   nunca chegava a subir com `wal_level=logical` de verdade, e o connector
   do Debezium falhava sempre ao tentar criar o slot de replicação.
   **Corrigido**: `wal_level=logical` agora vem via `command:` do serviço
   `postgres` no `docker-compose.yml`, então já sobe certo desde o start.

2. **CDC só indexava a tabela `events`.** `cdc-worker` e `search-service`
   tinham o schema de "evento de show" fixo em Go struct. Generalizei para
   um `map[string]any` roteado por tabela (`indexer.Routes`), cobrindo as
   4 tabelas do domínio novo.

3. **Cache** existia (Redis, padrão cache-aside) mas só no `event-service`
   (que também era do domínio de ingressos). Recriei o padrão no
   `indicators-service` — e o `cdc-worker` agora **invalida o cache em
   tempo real** assim que uma linha muda no Postgres (via CDC), em vez de
   só confiar no TTL.

4. **Frontend sem Tailwind.** Não havia `tailwind.config.js` nem
   `postcss.config.js` — tudo era `style={{...}}` inline com CSS vars.
   Configurei o Tailwind mapeado 1:1 nas CSS vars já existentes
   (`bg-primary`, `text-muted`, `border-border` etc.), para não quebrar o
   tema claro/escuro. Convertido como exemplo: `Importar.tsx`.

5. **"Alimentar com planilhas em sessão"** não existia — a tela
   `Importar.tsx` só listava um mock estático. Criei o `import-service`
   com o fluxo completo: sessão → upload → validação em staging → preview
   → commit (grava nas tabelas reais, dispara o CDC).

## O que foi criado/reescrito

```
backend/
  migrations/001_init.sql          ← schema novo (indicadores, alertas, GATs, sessões de import)
  migrations/seeds/seed_pet_saude.sql
  indicators-service/              ← NOVO: lê indicadores com cache Redis
  import-service/                  ← NOVO: upload de planilha → sessão → staging → commit
  cdc-worker/                      ← generalizado p/ 4 tabelas + invalida cache
  search-service/                  ← adaptado p/ indicadores epidemiológicos
  debezium/register-connector.sh   ← credenciais/tabelas novas
  kong/kong.yml                    ← rotas novas
docker-compose.yml                 ← wal_level fix, serviços novos, removido event/booking-service
frontend/
  tailwind.config.js, postcss.config.js
  src/lib/api.ts                   ← cliente HTTP real (indicadores + import)
  src/pages/Importar.tsx           ← reescrito: Tailwind + fluxo de sessão real
```

Removido: `event-service`, `booking-service`, `sync-events` (domínio de
ingressos, sem uso no projeto).

## Modelo de dados (o que "seria interessante" alimentar)

- **`indicadores_epidemiologicos`** — município, agravo (dengue,
  leptospirose, zika...), competência (mês), casos, óbitos, incidência/100k.
- **`indicadores_climaticos`** — município, data, chuva (mm), temperatura,
  umidade.
- **`indices_vulnerabilidade`** — município, dimensão (saneamento, renda,
  acesso à saúde, cobertura vacinal, exposição climática), valor 0–100.
- **`alertas`** — gerados manualmente por ora; próximo passo natural é
  gerar automaticamente quando `casos` ou `chuva_mm` ultrapassarem um
  limiar (dá pra fazer num trigger SQL ou no `import-service` no momento
  do commit).
- **`gats` / `pesquisadores`** — os 5 Grupos de Aprendizagem Tutorial e
  quem participa de cada um (tutor, preceptor, aluno...), como no seu
  documento de gerenciamento.

## Como rodar

```bash
docker-compose up -d --build
# aguarde todos os healthchecks; depois:
docker exec -i postgres psql -U petsaude -d petsaude < backend/migrations/seeds/seed_pet_saude.sql

cd frontend
npm install
npm run dev
```

O frontend aponta para `http://localhost:8000` (Kong) por padrão —
configurável em `.env` com `VITE_API_BASE_URL`.

**Importante**: os `go.sum` dos serviços novos/alterados (`indicators-service`,
`import-service`, `cdc-worker`) não estão commitados — não tenho acesso à
rede neste ambiente para gerar os checksums reais. Os `Dockerfile` já
rodam `go mod tidy` no build, então a primeira `docker-compose up --build`
resolve isso sozinha (precisa de internet no build, só isso).

## O que ainda falta (priorizado)

1. **Tailwind no resto do frontend.** Só `Importar.tsx` foi convertido
   como referência — `Dashboard.tsx`, `Mapa.tsx`, `Alertas.tsx` etc. ainda
   estão em `style={{...}}` inline. É um trabalho mecânico (mesmo padrão
   de `bg-[...]` → `bg-surface-card` etc.) que se encaixa bem num agente
   tipo Claude Code, arquivo por arquivo.
2. **Dashboard.tsx ainda usa os mocks de `data/Data.ts`** em vez de
   `src/lib/api.ts`. `Importar.tsx` já está 100% real; falta replicar o
   padrão (fetch + loading state) nas outras páginas.
3. **Geração automática de alertas** a partir de limiares de casos/chuva.
4. **Autenticação** — não existe hoje em nenhum serviço; se o dashboard
   for exposto fora da rede interna, isso é pré-requisito.
