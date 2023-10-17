# iisoc API

The iisoc social site API. Provide groups, threads, messages and more via a Rest API.

## 🏗️ Requirements

- Node runtime | bun runtime
- Package manager (one of): `npm`, `yarn`, `pnpm`, `bun`

## ⚙️ Setup
*replace `bun` with your installed package manager*

Install dependencies
`bun install`

Copy the default .env file & configure
`cp .env.example .env`

Generate `APP_KEY` (required by adonis session)
`node ace generate:key`

(Set `APP_KEY` in `.env`)

Run the project with hot reload
`bun dev`

## Development notes

- Project structure should follow the default of what adonis expects, ex.: `App/Controllers`, `App/Services`, etc.
- Returned JSON should +- follow [this format](https://gist.github.com/Wertik/d4c6c138305672876751ce44e9ae3e63).
