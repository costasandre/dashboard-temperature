# This file is a template, and might need editing before it works on your project.

FROM node:14.4.0

WORKDIR /var/www

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /var/www
RUN npm install --cache /tmp/empty-cache
COPY . /var/www

CMD [ "npm", "start" ]

# replace this with your application's default port
EXPOSE 3001

