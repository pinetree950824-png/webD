# Stage 1: Build React Client
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Bundle Backend & Nginx together
FROM node:20

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server package configuration and install production dependencies
COPY server/package*.json ./
RUN npm install

# Copy server application files
COPY server/ ./

# Copy static frontend build output to Nginx directory
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Overwrite Nginx configuration with our custom reverse proxy rules
COPY nginx/nginx.conf /etc/nginx/sites-available/default

# Create SQLite persistent data folder
RUN mkdir -p /app/data

# Copy and configure the container startup script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 80

CMD ["./start.sh"]
