docker build -t wls_nginx -f Dockerfile .
docker stack deploy -c nginx-service.yml wls_ssl
