# Step 1: Build the React app using an official Node image
FROM node:20 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Serve the built app using Nginx with a custom configuration
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 8080 instead of the default 80
EXPOSE 8080

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
