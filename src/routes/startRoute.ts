// A Qortal-family address: base58, 34 chars, version byte rendered as a
// leading Q on both chains. Anything else that reaches `account` is treated as
// a registered name (names are 1–40 chars and may not be plain base58).
const ADDRESS_PATTERN = /^Q[1-9A-HJ-NP-Za-km-z]{33}$/;
const MAX_NAME_LENGTH = 40;

/**
 * Where the app should start, derived from the top-level query string Home
 * hands it on the canonical `qdn://APP/Chain/Chain` address.
 *
 * `_route` is the existing hash-router hand-off and always wins. `account` is
 * the Home `explorer` assignment-role contract (qortium-home
 * docs/HOME_APP_ASSIGNMENTS.md): a context-menu "View on explorer" on an
 * account opens `?account=<address or name>`, which lands on the address page
 * or the name page. Returns the hash route to apply, or null to start on the
 * home page as usual.
 */
export function resolveStartRoute(search: string): string | null {
  const params = new URLSearchParams(search);
  const startRoute = params.get('_route');
  if (startRoute) return startRoute;

  const account = (params.get('account') ?? '').trim();
  if (!account) return null;
  if (ADDRESS_PATTERN.test(account)) return `/address/${account}`;
  if (account.length > MAX_NAME_LENGTH || hasControlCharacter(account)) return null;
  return `/name/${encodeURIComponent(account)}`;
}

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}
