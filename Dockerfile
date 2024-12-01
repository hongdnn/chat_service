# Use the official Node.js:lst runtime as a base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package*.json ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Set an environment variable 
ENV PORT=3000

# Expose the port that the app will run on
EXPOSE 3000

# Tell docker what command will start the application
CMD [ "yarn", "start" ]