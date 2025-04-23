# Use the same base image (Node 22.x on Debian slim)
FROM node:22.14.0-slim

# between FROM and WORKDIR
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
# Copies both package.json and package-lock.json (if present)
COPY package*.json ./
RUN npm ci

# Copy the rest of your source code
COPY . .

# Run your build (Next.js + TypeScript)
RUN npm run build

EXPOSE 5000

# Start in production mode
CMD ["npm", "start"]
