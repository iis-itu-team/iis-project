# iisoc frontend

## 🏗️ Requirements

- Node runtime | Bun runtime
- Package manager (one of): `npm`, `yarn`, `pnpm`, `bun`

## ⚙️ Setup
*aka what to do after I clone this repo*

*\* replace `bun` with your installed package manager*

Create a new `.env` from template \
`../ensure-env` (bash script, only unix based systems, otherwise copy `.env.template` to `.env`)

## 🌊 Workflow
*aka what to do before I start working on something*

*\* replace `bun` with your installed package manager*

Pull latest changes \
`git pull`

Append any new env variables from `.env.template` to `.env` \
`../ensure-env` (bash script, only unix based systems, otherwise add env vars by hand from `.env.template` to `.env`)

Install any new packages that may have been added \
`bun install`

Ensure the API is running (if needed) \
[more in backend readme](../backend/README.md)

Start the dev server with hot reload \
`bun dev`
