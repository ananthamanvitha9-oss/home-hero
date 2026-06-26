FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install standard dependencies
RUN npm install

# Copy application source
COPY . .

# Expose backend API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
