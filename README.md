This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Live order status updates

Signed-in buyers can receive order status notifications from the bell beside the shopping cart in the store navigation. New updates also appear briefly on screen, and the bell keeps the buyer's recent notifications in that browser. Buyer tracking pages receive status changes over Laravel Reverb while the page is open.

Signed-in sellers receive a dashboard bell alert and an on-screen toast as soon as a buyer places an order containing one of their products. The seller must have the dashboard open to receive the live alert; the bell stores recently received alerts in that browser. For local development:

1. Configure the Laravel API `.env` with `BROADCAST_CONNECTION=reverb` and the Reverb app credentials. The API and Reverb server must use the same credentials.
2. Start Reverb in the API project with `php artisan reverb:start`. The sample configuration uses port `8082` so it does not conflict with the API server or common XAMPP port `8080`.
3. Copy the API's Reverb app key, host, port, and scheme into the frontend `.env.local` as `NEXT_PUBLIC_REVERB_APP_KEY`, `NEXT_PUBLIC_REVERB_HOST`, `NEXT_PUBLIC_REVERB_PORT`, and `NEXT_PUBLIC_REVERB_SCHEME`. Set `NEXT_PUBLIC_API_URL` to the API's reachable base URL.
4. Restart the Next.js dev server after changing environment variables. Buyers and sellers must be signed in in that browser to authorize their private live updates; buyer order tracking also refreshes every 15 seconds as a fallback.

Email status notifications are separate and require valid SMTP settings in the API `.env`.

The seller dashboard's **Overview** page also shows a daily breakdown of that seller's orders, item quantities, revenue, cost, and profit. Cancelled orders are excluded from the report.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
