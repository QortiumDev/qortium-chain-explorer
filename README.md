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

## Deep links

Home and other apps open Chain at its canonical address with a top-level
query string:

- `?_route=<hash route>` — start on any hash route (existing hand-off).
- `?account=<address or name>` — start on that address page, or the name page
  when the value is not an address. This is the Home `explorer`
  assignment-role contract (qortium-home `docs/HOME_APP_ASSIGNMENTS.md`,
  "Roles used by context menus"); Home's "View on explorer" context-menu item
  uses it.

`_route` wins when both are present.

## Naming

The name this app publishes under is set in `src/apps.ts`:

```ts
chain: { qdn: 'Chain', label: 'Chain' },
```

Change `qdn` to whatever name you've registered on your network, then publish under that name. Update the same registry entry in any other apps that link to this one.
