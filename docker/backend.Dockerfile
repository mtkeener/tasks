# Use a lightweight Node image
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["node", "express-server.js"]
