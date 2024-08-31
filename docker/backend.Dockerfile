# Use Node.js as the base image
FROM node:14

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the Express server
CMD ["npm", "start"]
