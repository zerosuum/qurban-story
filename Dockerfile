FROM oven/bun:1.1-alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
RUN bunx prisma generate
RUN bun run build
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma db push && bun start"]