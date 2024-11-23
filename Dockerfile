FROM node

WORKDIR /app/sarvusahityanodejs27aug

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8086

CMD ["npm", "start"]