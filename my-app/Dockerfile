# Stage 1: Build the React app
FROM node:16 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the app source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the React app with NGINX
FROM nginx:1.17-alpine

# Copy the build output to the NGINX HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom NGINX configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g","daemon off;"]

# FROM node:16 as builder
# WORKDIR /app
# COPY package*.json /app/
# RUN npm install
# COPY ./ /app/
# RUN npm run build


# FROM nginx:1.17-alpine
# RUN apk --no-cache add curl
# RUN curl -L https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-`uname -s`-`uname -m` -o envsubst && \
#     chmod +x envsubst && \
#     mv envsubst /usr/local/bin


# COPY --from=builder /app/nginx.conf /etc/nginx/nginx.template
# CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
# COPY --from=builder /app/build/ /usr/share/nginx/html