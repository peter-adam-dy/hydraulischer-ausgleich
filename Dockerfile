FROM node:24-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
COPY . .
RUN git config --global --add safe.directory /app
RUN echo "{\"hash\":\"$(git rev-parse --short HEAD 2>/dev/null || echo unknown)\",\"date\":\"$(git log -1 --format=%cI 2>/dev/null || date -Iseconds)\"}" > .buildinfo.json
RUN cat .buildinfo.json
RUN npm ci
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
