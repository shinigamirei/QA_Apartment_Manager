FROM node:latest
WORKDIR /QA-Apt-BackEnd-AppManagement
COPY . .
RUN npm install && npm test
ENTRYPOINT ["npm","start"]

