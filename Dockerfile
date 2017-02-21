FROM node:6

RUN mkdir -p /usr/src/app
COPY *.json /usr/src/app/
COPY *.js /usr/src/app/
COPY lib /usr/src/app/lib
COPY modules /usr/src/app/modules
RUN cd /usr/src/app && npm install --no-optional .

ENTRYPOINT cd /usr/src/app && node .
