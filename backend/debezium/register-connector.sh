#!/bin/sh
set -e

DEBEZIUM_URL="http://debezium:8083"
CONNECTOR_NAME="postgres-petsaude-connector"

echo "🔍 Verificando se o connector '$CONNECTOR_NAME' já existe..."

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEBEZIUM_URL/connectors/$CONNECTOR_NAME")

if [ "$STATUS" = "200" ]; then
  echo "✅ Connector '$CONNECTOR_NAME' já registrado. Nada a fazer."
  exit 0
fi

echo "📝 Connector não encontrado (status $STATUS). Registrando..."

# table.include.list cobre as 4 tabelas que alimentam os gráficos do
# dashboard. Se adicionar uma tabela nova, inclua aqui E em
# backend/cdc-worker/config/config.go (DefaultTopics) e
# backend/cdc-worker/indexer/indexer.go (Routes).
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$DEBEZIUM_URL/connectors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'"$CONNECTOR_NAME"'",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "database.hostname": "postgres",
      "database.port": "5432",
      "database.user": "petsaude",
      "database.password": "petsaude",
      "database.dbname": "petsaude",
      "topic.prefix": "dbserver",
      "table.include.list": "public.indicadores_epidemiologicos,public.indicadores_climaticos,public.indices_vulnerabilidade,public.alertas",
      "plugin.name": "pgoutput",
      "slot.name": "debezium_petsaude_slot",
      "publication.autocreate.mode": "filtered"
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Connector registrado com sucesso!"
elif [ "$HTTP_CODE" = "409" ]; then
  echo "✅ Connector já existia (409 conflict). Ok."
else
  echo "❌ Falha ao registrar connector (status $HTTP_CODE):"
  echo "$BODY"
  echo ""
  echo "⚠️  Causa mais comum: wal_level != logical. Confirme que o serviço"
  echo "    postgres do docker-compose está com 'command: [\"postgres\", \"-c\", \"wal_level=logical\"]'"
  echo "    e que o container foi recriado (docker-compose up -d --force-recreate postgres)."
  exit 1
fi
