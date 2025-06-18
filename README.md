# LivelyChat UI

## Features

- **Realtime connection**: Live broadcast of chat messages
- **Infinite scrolling**: Seamless chat history queries
- **Refreshing design**: Built with TailwindCSS and daisyUI

## Environment variables

- `PUBLIC_API_BASE`: This is the base URL of your LivelyChat API deployment. It should not contain a trailing slash.
- `PUBLIC_SOCKET_URL`: This should point to the same address as that in `PUBLIC_API_BASE`, and the two should only differ in protocols.

## Development

### Prerequisites

- [pnpm](https://pnpm.io/)
- A [LivelyChat API](https://github.com/LivelyChat/api) deployment

### Setup

1. Clone this repository.
2. Copy `.env.example` to `.env` and make necessary changes.
3. Install dependencies via `pnpm i`.
4. Start a development server via `pnpm dev`.

## Deployment

It's recommended that you deploy this app on a cloud service, such as [Vercel](https://vercel.com/) or [Cloudflare Workers](https://workers.cloudflare.com/).
