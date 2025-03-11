FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Using npm install instead of npm ci
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]