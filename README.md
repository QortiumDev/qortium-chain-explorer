# Qortium Chain Explorer

A block explorer Q-App for the Qortium ecosystem. Browse blocks, transactions, and addresses. Includes a payment web graph for tracing native coin flows between accounts, and a universal search bar that resolves blocks, transactions, addresses, and names.

Deep link schema documented in [DEEP-LINKS.md](DEEP-LINKS.md).

Built to be forked — see [Naming](#naming) below.

## Build

```
npm install
npm run build
```

Output is a single HTML file at `dist/index.html`, ready to publish as a Qortium APP.

## Naming

The name this app publishes under is set in `src/apps.ts`:

```ts
chain: { qdn: 'Chain', label: 'Chain' },
```

Change `qdn` to whatever name you've registered on your network, then publish under that name. Update the same registry entry in any other apps that link to this one.
