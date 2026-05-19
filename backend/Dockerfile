FROM golang:alpine AS builder

WORKDIR /app

# Go mod dosyalarını kopyala ve bağımlılıkları indir
COPY go.mod go.sum ./
RUN go mod download

# Tüm kodları kopyala
COPY . .

# Uygulamayı derle
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Final stage - Sadece çalışan uygulamayı alarak boyutu küçültüyoruz
FROM alpine:latest

WORKDIR /app

# Derlenmiş dosyayı kopyala
COPY --from=builder /app/main .

# Gerekliyse .env ve json dosyasını kopyala (Docker Compose üzerinden mount ediliyor olsa da burada bulunsun)
COPY .env* ./
COPY google-services.json* ./

# Portu dışarıya aç
EXPOSE 3001

# Uygulamayı çalıştır
CMD ["./main"]
