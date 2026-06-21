
FROM node:lts-alpine3.24

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

RUN mkdir -p /app/data && chown app:app /app/data

COPY --chown=app:app package*.json ./
RUN npm ci --omit=dev

COPY --chown=app:app . .

USER app

CMD ["node", "app.js"]
