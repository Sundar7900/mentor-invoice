# ── Stage 1: Build ────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go module files from repo root context (Render uses repo root as build context)
COPY backend/mentor-invoice/go.mod backend/mentor-invoice/go.sum ./
RUN go mod download

# Copy all backend source code
COPY backend/mentor-invoice/ .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

# ── Stage 2: Run ──────────────────────────────────────────────────
FROM alpine:3.18

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/server .

# Expose port (Render uses the PORT env variable)
EXPOSE 8080

# Run the binary
CMD ["./server"]
