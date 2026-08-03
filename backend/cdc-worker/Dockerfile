FROM golang:1.22-alpine AS builder
WORKDIR /app
# go.sum não está commitado (gerado no seu ambiente); por isso copiamos o
# código-fonte ANTES do `go mod tidy` — ele precisa ver os imports reais
# pra saber quais dependências manter/baixar. Rodar tidy só com o go.mod
# (sem os .go) faz ele "limpar" tudo como não usado.
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o cdc-worker .

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/cdc-worker .
CMD ["./cdc-worker"]