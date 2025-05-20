# babylonscan

babylonscan is a monorepo project designed to explore and interact with babylon blockchain. It provides a user interface (the `babylon` app) for viewing blockchain data such as transactions, validators, proposals, tokens, and contracts. It also includes features related to Bitcoin finality providers.

## Monorepo Structure

The project is organized as a monorepo using pnpm workspaces:

*   `apps/`: Contains the main applications.
    *   `babylon/`: The Next.js frontend application for blockchain exploration.
*   `packages/`: Contains shared libraries and modules used across the monorepo.
    *   `core/`: Contains core business logic, components, and hooks related to Cosmos data.
    *   `shared/`: Holds utility functions, types, and constants shared across different parts of the project.
    *   `ui/`: A dedicated package for UI components, layouts, and design elements.
*   `configs/`: Shared configurations for tools like ESLint, Prettier, TypeScript, and TailwindCSS.
*   `server/`: Contains backend services for API handling and database interactions (using Prisma).

## Key Features

Based on the directory structure, babylonscan includes features such as:

*   **Blockchain Exploration:** Viewing blocks, transactions, and specific account details.
*   **Validator Information:** Listing validators, their status, power events, and proposed blocks.
*   **Proposals:** Tracking governance proposals, votes, and deposits.
*   **Token Information:** Displaying token details and top holders.
*   **Contract Interaction:** Support for viewing contract information, their history, or code.
*   **Staking:** Information about staking transactions and delegations.
*   **BTC Finality Providers:** Features related to Bitcoin finality providers on Cosmos chains.
*   **Top Accounts:** Displaying accounts with significant activity or holdings.
*   **Modular Design:** Leverages a monorepo structure for code organization and reusability with `core`, `shared`, and `ui` packages.
*   **Modern Tech Stack:** Uses Next.js for the frontend, tRPC for API communication, TailwindCSS for styling, and Prisma for database interactions.

## Prerequisites

*   [Node.js](https://nodejs.org/) (check `.nvmrc` or `package.json` engines for specific version)
*   [pnpm](https://pnpm.io/)

## Installation

1.  Clone the repository.
2.  Navigate to the project root directory.
3.  Install dependencies:
    ```bash
    pnpm install
    ```

    **Note:** There is a known issue with a missing package `@cosmoscan/mempool-api`. You may need to resolve this dependency for the `apps/babylon` application to install and run correctly. This might involve creating the package, finding its source, or removing the dependency if it's no longer needed.

## Running the Application

To run the development server for the `babylon` application on mainnet:

```bash
pnpm run babylon:dev:mainnet
```

This command utilizes `dotenvx` to load the `.env.mainnet` environment variables and then starts the development server specifically for the `@cosmoscan/babylon` application and the `@cosmoscan/core-db` package.

## Building the Application

To build the `babylon` application for production on mainnet:

```bash
pnpm run babylon:build:mainnet
```
This command uses `dotenvx` to load the `.env.mainnet` environment variables and then builds the `@cosmoscan/babylon` application and the `@cosmoscan/core-db` package.

To build all applications and packages within the monorepo:
```bash
turbo build
```
Alternatively, you can use the pnpm script which executes the same Turbo command:
```bash
pnpm build
```

## Linting and Formatting

The project uses ESLint for linting and Prettier for code formatting.

To lint all packages in the monorepo:
```bash
turbo run lint
```
Alternatively, you can use the pnpm script:
```bash
pnpm run lint
```

To format the entire codebase using Prettier:
```bash
pnpm format
```