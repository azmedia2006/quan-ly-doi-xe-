FROM nginx:alpine

# Custom Nginx config with SPA fallback (try_files $uri /index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built bundle from host
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
