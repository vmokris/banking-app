# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python server ────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=builder /build/dist ./static

ENV PORT=8080
EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "60", "wsgi:app"]
