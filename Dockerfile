FROM node:carbon

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8880

CMD [ "./start.js" ]
