FROM node:24-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
COPY . .
RUN git config --global --add safe.directory /app
ENV GIT_HASH=""
ENV GIT_DATE=""
RUN export GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") && \
    export GIT_DATE=$(git log -1 --format=%cI 2>/dev/null || date -Iseconds) && \
    echo "Build: $GIT_HASH @ $GIT_DATE" && \
    GIT_HASH=$GIT_HASH GIT_DATE=$GIT_DATE npm ci && \
    GIT_HASH=$GIT_HASH GIT_DATE=$GIT_DATE npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
