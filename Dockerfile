FROM serversideup/php:8.2-fpm-nginx

# Switch to root to install dependencies and configure permissions
USER root

# Install required system packages
RUN apt-get update && apt-get install -y \
    curl \
    zip \
    unzip \
    git \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install GD PHP extension
RUN install-php-extensions gd

# Install Node.js (for Vite asset compilation)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy the application code
COPY --chown=www-data:www-data . /var/www/html

# Switch to the web user
USER www-data

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Install Node dependencies and build Vite assets
RUN npm install && npm run build

# Clear and cache Laravel settings
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan storage:link
