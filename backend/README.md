# iisoc API

The iisoc social site API. Provide groups, threads, messages and more via a Rest API.

## 🏗️ Requirements

- Node runtime | bun runtime
- Package manager (one of): `npm`, `yarn`, `pnpm`, `bun`
- Docker
- psql client `psql`

## ⚙️ Setup
*aka what to do after I clone this repo*

*\* replace `bun` with your installed package manager*

Install dependencies \
`bun install`

Create a new `.env` from template \
`../ensure-env` (bash script, only unix based systems, otherwise copy `.env.template` to `.env`)

Generate `APP_KEY` (required by adonis session) \
`node ace generate:key`

(Set `APP_KEY` in `.env`)

Start docker containers with PSQL database
`docker compose up -d`

Create database (same name as `PG_DB_NAME`)
`psql -h 127.0.0.1 -U postgres -W` (pass: `postgres`)
`create database "iisoc";`

## 🌊 Workflow
*aka what to do before I start working on something*

Pull latest changes \
`git pull`

Append any new env variables from `.env.template` to `.env` \
`../ensure-env` (bash script, only unix based systems, otherwise add env vars by hand from `.env.template` to `.env`)

Install any new packages that may have been added \
`bun install`

Start docker containers with required services (postgre, iisoc) \
`docker compose up -d` (or `docker-compose up -d`)

Run any new migrations that may have been added \
`node ace migration:run`

Start the dev server with hot reload \
`bun dev`

## 🗒️ Development notes

- Project structure should follow the default of what adonis expects, ex.: `App/Controllers`, `App/Services`, etc.

- Returned JSON should +- follow [this format](https://gist.github.com/Wertik/d4c6c138305672876751ce44e9ae3e63).

- Validation schemas are defined in controllers instead of classes so we don't have to create a class for each validation schema.

- `HttpException` is used for all possible expected errors. Different causes are reflected through it's parameters instead of per-error classes.

- Make sure to run new migrations (if any) via `node ace migration:run`.

- Each time a change in database structure is made, create new migrations `node ace make:migration <name>` (ex.: `node ace make:migration create_users_table`, check the name, adonis alters it)
