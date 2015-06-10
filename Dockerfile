FROM node

# Build app
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN git config --global http.sslVerify false \
	&& git config --global http.postBuffer 524288000 \
	&& npm install pm2 -g \
	&& npm install

EXPOSE 1337

CMD ["pm2 start","app.js"]
