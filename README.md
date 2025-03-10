This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing Chat Functionality

To create test data specifically for the chat functionality:

1. Make sure your database is set up and migrations have been applied
2. Run the chat seed script:

```bash
npm run seed:chat
```

This will:
- Create a new order for the listing with ID `2b57c4f7-64b2-42f2-92f4-d565c8a3f076`
- Set the buyer as the user with ID `67e755e6-3199-4912-a8f0-dd21f056cb14`
- Generate a conversation with 9 messages between the buyer and seller
- The messages will span across two days to test the date separator feature
- The script will output the order ID that you can use to access the chat

You can then test the chat functionality, including read receipts, by navigating to `/chat/[orderId]` where `[orderId]` is the ID displayed in the console after running the seed.
