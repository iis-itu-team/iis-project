# iisoc API

The iisoc social site API. Provide groups, threads, messages and more via a Rest API.

## 🏗️ Requirements

- Node runtime | bun runtime
- Package manager (one of): `npm`, `yarn`, `pnpm`, `bun`
- Docker

## ⚙️ Setup
*replace `bun` with your installed package manager*

Start database through a docker container
`docker compose up -d`
(`-d` to detach, aka run in background)

Install dependencies
`bun install`

Copy the default .env file & configure
`cp .env.example .env`

Generate `APP_KEY` (required by adonis session)
`node ace generate:key`

(Set `APP_KEY` in `.env`)

Run migrations
`node ace migration:run`

Run the project with hot reload
`bun dev`

## Development notes

- Project structure should follow the default of what adonis expects, ex.: `App/Controllers`, `App/Services`, etc.

- Returned JSON should +- follow [this format](https://gist.github.com/Wertik/d4c6c138305672876751ce44e9ae3e63).

- Validation schemas are defined in controllers instead of classes so we don't have to create a class for each validation schema.

- `HttpException` is used for all possible expected errors. Different causes are reflected through it's parameters instead of per-error classes.

- Make sure to run new migrations (if any) via `node ace migration:run`.

- Each time a change in database structure is made, create new migrations `node ace make:migration <name>` (ex.: `node ace make:migration create_users_table`, check the name, adonis alters it)
