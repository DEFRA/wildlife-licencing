## SSL Reverse Proxy

In order to develop the service it is sometimes necessary for external services to redirect into the service, such is 
the case with the identity management system (IDM). Here the authenticated user will be directed back into the 
wildlife service with a browser redirect (http status 302).

These services generally require that we provide them with a callback url and that callback url is required to be secure, for instance.
```https://localhost/auth```

The web-service only supports http as it runs behind the Amazon Route 53 which handles the secure sockets layer. 
All traffic within the VPC is unencrypted.

This can be simulated on the local machine by building and running an nginx container, as follows
- ```docker build -t wls_nginx -f Dockerfile .```
- ```docker stack deploy -c nginx-service.yml wls_ssl```
- Install the certificate file in the keychain of the local machine. This can be achieved by following the steps 
- here: [Keychain instructions for MAC OS](https://support.securly.com/hc/en-us/articles/206058318-How-to-install-the-Securly-SSL-certificate-on-Mac-OSX-)
- In addition, opening the following link in chrome allows localhost to use a self-signed certificate (chrome://flags/#allow-insecure-localhost)

The reverse proxy will pass redirects and requests from localhost:443 (ssl) to localhost:4000. 
Simply open https://localhost/ in your browser. You may see some browser warning as the certificate is self-signed.

The certificate can be created using the following command
```sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout private.key -out certificate.crt```
