## Description

This is the Chat App backend based on the NestJS.

Additionally, I'm using Twilio Conversation Service for live video chat, Google OAuth for user credentials and Prisma +
PostgreSQL for database.

* Note: You have to manually register users by adding user to the database User table.

## Before Start

You must place an dotenv(.env.local) file at the root of your project.
And this dotenv must contain the following environment variables.

* Note: This project using google secret manager to manage environment variables, so, you could use `yarn env:[env]` to
  generate your dotenv file.

```dotenv
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="REPLACE_ACCORDING_TO_YOUR_SITUATION"
#DATABASE_URL="postgresql://weiliao:ee8P%24me5%7Dhcs%23:2%5E@34.80.23.56:5432/chatting"
GOOGLE_OAUTH_CLIENT_ID="GRANT_YOUR_OWN_CLIENT_ID"
GOOGLE_OAUTH_CLIENT_SECRET="GRANT_YOUR_OWN_CLIENT_SECRET"
JWT_SECRET="GRANT_YOUR_OWN_SECRET"

TWILIO_ACCOUNT_SID="GRANT_YOUR_OWN_SID"
TWILIO_AUTH_TOKEN="GRANT_YOUR_OWN_TOKEN"
TWILIO_API_KEY_SID="GRANT_YOUR_OWN_KEY_SID"
TWILIO_API_KEY_SECRET="GRANT_YOUR_OWN_KEY_SECRET"
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If
you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
