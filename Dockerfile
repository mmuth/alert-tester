FROM node:14.21.2
LABEL maintainer="info@matthias-muth.de"

RUN useradd --user-group --create-home --shell /bin/false app
ENV HOME=/home/app

COPY package.json package-lock.json $HOME/alert-tester/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/alert-tester
RUN npm install

COPY ./src ./app

CMD ["node", "app/app.js"]
