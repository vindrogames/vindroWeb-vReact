# Use Node.js 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port 5173 (Vite default port)
EXPOSE 5173

# Run Vite dev server with host option to allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
