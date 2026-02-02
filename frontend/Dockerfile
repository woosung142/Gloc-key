# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL="https://www.glok.store/api"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build app.
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# 커스텀 nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
