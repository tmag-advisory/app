FROM oven:bun AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven:bun AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["bun", "x", "serve", "-l", "0.0.0.0", "-p", "3000", "dist"]
