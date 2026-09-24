FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM php:8.2-apache
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN a2enmod rewrite
COPY --from=build /app/dist /var/www/html
COPY backend /var/www/html/backend
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
