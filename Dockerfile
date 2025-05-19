FROM node:18-alpine as builder
ENV NODE_ENV="production"
COPY . /app
WORKDIR /app
RUN npm install
FROM node:18-alpine
ENV NODE_ENV="production"
COPY --from=builder /app /app
WORKDIR /app
ENV PORT 8080
EXPOSE 8080
CMD ["npm","start"]
