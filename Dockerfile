FROM node

WORKDIR /app/sarvusahityanodejs27aug

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]