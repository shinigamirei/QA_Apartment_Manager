FROM node:latest
WORKDIR /QA-Apt-Backend-OccuManagement
COPY . .
RUN npm install && npm test
ENTRYPOINT ["npm","start"]
