FROM node

EXPOSE 9000

COPY . ./server

WORKDIR /server

CMD ["npm", "start"]