FROM php:8.2-cli

# Install system dependencies and database drivers
RUN apt-get update && apt-get install -y \
    git zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Copy Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application code
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose web port
EXPOSE 10000

# Start Laravel built-in web server listening on Render's $PORT
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}