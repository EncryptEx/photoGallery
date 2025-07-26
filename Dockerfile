# Use a lightweight Node.js image for a smaller footprint
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy server's package.json to leverage Docker cache
COPY server/package.json ./server/

# Install server dependencies
RUN npm install --prefix server

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# The command to run your application
CMD [ "node", "server/server.js" ]
