FROM node:latest
WORKDIR /QA-Apt-Backend-getOcc
COPY . .
RUN npm install && npm test
ENTRYPOINT ["npm","start"]

