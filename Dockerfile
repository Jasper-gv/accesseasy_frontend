# Build stage
FROM node:16 as build-stage

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire project
COPY . .

# Build the application
ARG VITE_API_URL
ARG VITE_API_TOKEN
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_TOKEN=${VITE_API_TOKEN}
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy the built assets
COPY --from=build-stage /build/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the correct port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]