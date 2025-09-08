FROM node:22
WORKDIR /code 
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install -g nodemon
COPY . .

# Copier le script d'attente et d'entrée
COPY wait-for-db.js .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Utiliser le script d'entrée
ENTRYPOINT ["./entrypoint.sh"]
# CMD ["npm", "run", "deploy:prod"]

CMD ["npm", "run", "start:dev"]
