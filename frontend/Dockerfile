FROM nginx:alpine

# Copy built bundle from host
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
