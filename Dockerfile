
FROM node:18-alpine


RUN apk update && apk add --no-cache bash

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build


EXPOSE 3000

CMD ["npm", "run", "start:dev"]
