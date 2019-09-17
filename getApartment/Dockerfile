FROM node:latest
WORKDIR /QA-Apt-Backend-getApt
COPY . .
RUN npm install && npm test
ENTRYPOINT ["npm","start"]
