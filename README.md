##GetWork Farm Proxy

#Dependencies
1. nodeJS latest LTS
2. npm
3. docker ce (if you want to run it as a docker container)

#howto
If you want to run it as a single instance node application (without docker), simply run:

npm i && npm run startnode

If you want to use it dockerized with a single docker container simply run:
npm start

it then will automatically build the container and run it with the restart flag always.

If you want to run it in a docker swarm (you have to initialize a swam locally with docker swarm init)
you could simply follow these steps:
1. npm run build
2. docker stack deploy -c proxy_compose.yml cluster

Then docker will create a cluster named cluster with the current built farmproxy image.

Either way if it runs, the proxy will be reachable via http://ip-address:8880

