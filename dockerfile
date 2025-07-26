FROM node:20-slim

# Install Chromium for puppeteer
RUN apt-get update && apt-get install -y chromium chromium-driver --no-install-recommends && rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Persistent volume for session
VOLUME ["/data"]

EXPOSE 3000
CMD ["npm", "start"]
