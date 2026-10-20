FROM oven/bun:1.4-alpine

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json bun.lock* ./

# Bağımlılıkları yükle
RUN bun install --production

# Kaynak kodları kopyala
COPY . .

# Port 4444
EXPOSE 4444

ENV PORT=4444
ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
