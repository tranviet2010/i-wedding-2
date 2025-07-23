# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Set Node.js memory limit to prevent heap out of memory errors
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx's default port)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 