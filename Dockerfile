################################################################################
# BASE IMAGE WITH DEPENDENCIES
################################################################################

FROM node:10-alpine as dependencies

LABEL maintainer="Quantumsoft LLC"

ARG ENVIRONMENT=development
ENV ENVIRONMENT=${ENVIRONMENT}

ARG API_BASE_URL
ARG AZURE_CLIENT_ID
ARG PUSHER_KEY
ARG PUSHER_CLUSTER
ARG HELPSCOUT_BEACON_ID

ENV REACT_APP_API_BASE_URL=${API_BASE_URL}
ENV REACT_APP_OFFICE_365_CLIENT_ID=${AZURE_CLIENT_ID}
ENV REACT_APP_PUSHER_KEY=${PUSHER_KEY}
ENV REACT_APP_PUSHER_CLUSTER=${PUSHER_CLUSTER}
ENV REACT_APP_BEACON_ID=${HELPSCOUT_BEACON_ID}

ENV APP_HOME=/app

RUN mkdir -p ${APP_HOME}
WORKDIR ${APP_HOME}

COPY ./package.json ./package-lock.json ${APP_HOME}/

RUN npm set progress=false && npm ci

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN ln -s usr/local/bin/docker-entrypoint.sh / # backwards compatibility
ENTRYPOINT ["docker-entrypoint.sh"]

################################################################################
# IMAGE WITH SOURCES
################################################################################

FROM dependencies AS sources

COPY . ${APP_HOME}

################################################################################
# IMAGE WITH BUILT STATIC
################################################################################

FROM sources AS build

RUN npm run build

################################################################################
# RELEASE IMAGE
################################################################################

FROM nginx:alpine as release

RUN rm /etc/nginx/conf.d/default.conf /etc/nginx/nginx.conf
COPY ./docker/config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /www/static
