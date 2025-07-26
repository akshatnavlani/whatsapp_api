FROM node:20-slim

# Install Chromium for puppeteer
RUN apt-get update && apt-get install -y chromium chromium-driver --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
