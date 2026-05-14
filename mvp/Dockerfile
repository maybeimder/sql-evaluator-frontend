FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 5173
CMD npx vite --host 0.0.0.0

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80