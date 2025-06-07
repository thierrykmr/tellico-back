FROM node:22
WORKDIR /code 
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install
COPY . .
CMD ["npm", "run", "deploy:prod"]
