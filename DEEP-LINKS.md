# Chain Deep Link Schema

Base URL format (QDN):
```
qdn://APP/Chain/#/<route>
```

---

## Transaction Search (Home)

**Route:** `/#/`

Lands on the transaction explorer with the given filters pre-applied and auto-searched.

| Param | Type | Description |
|-------|------|-------------|
| `address` | string | Filter by involved address |
| `name` | string | Filter by Qortal name |
| `type` | string | Comma-separated tx types (see list below) |
| `status` | string | `CONFIRMED` (default), `UNCONFIRMED`, or `BOTH` |
| `from` | number | Start block height |
| `to` | number | End block height |
| `group` | number | Group ID |

**Examples:**
```
qdn://APP/Chain/#/?address=Qabc123...
qdn://APP/Chain/#/?name=devuser
qdn://APP/Chain/#/?type=PAYMENT,REWARD_SHARE
qdn://APP/Chain/#/?address=Qabc123...&type=PAYMENT
qdn://APP/Chain/#/?address=Qabc123...&from=500000&to=600000
qdn://APP/Chain/#/?status=UNCONFIRMED
```

---

## Payment Web

**Route:** `/#/payments`

| Param | Type | Description |
|-------|------|-------------|
| `address` | string | Auto-load this address into the payment graph on open |

```
qdn://APP/Chain/#/payments?address=Qabc123...
```

Loads the address as the focal node and fetches its last 100 PAYMENT transactions. From there, any node can be expanded to trace further. Nodes show total received (↓) and sent (↑) amounts. Green arrows = incoming QORT, orange arrows = outgoing QORT.

---

## Block Explorer

**Route:** `/#/blocks`

No params. Loads the block explorer dashboard with live stats and recent blocks.

```
qdn://APP/Chain/#/blocks
```

---

## Block Detail

**Route:** `/#/block/:height`

```
qdn://APP/Chain/#/block/1234567
```

---

## Transaction Detail

**Route:** `/#/tx/:signature`

Signature must be URL-encoded.

```
qdn://APP/Chain/#/tx/5Ygt3...encodedSig
```

---

## Address Page

**Route:** `/#/address/:address`

Shows account stats (balance, level, blocks minted) and transaction history.

```
qdn://APP/Chain/#/address/Qabc123...
```

> To show all transactions for an address with filter controls, use `/#/?address=Qabc123...` instead.

---

## Transaction Types

Valid values for the `type` param:

| Value | Label |
|-------|-------|
| `PAYMENT` | Payment |
| `REWARD_SHARE` | Reward Share |
| `REGISTER_NAME` | Register Name |
| `UPDATE_NAME` | Update Name |
| `SELL_NAME` | Sell Name |
| `CANCEL_SELL_NAME` | Cancel Sale |
| `BUY_NAME` | Buy Name |
| `TRANSFER_ASSET` | Transfer Asset |
| `ISSUE_ASSET` | Issue Asset |
| `CREATE_ASSET_ORDER` | Asset Order |
| `CANCEL_ASSET_ORDER` | Cancel Order |
| `UPDATE_ASSET` | Update Asset |
| `MULTI_PAYMENT` | Multi-Payment |
| `TRANSFER_PRIVS` | Transfer Privs |
| `DEPLOY_AT` | Deploy AT |
| `ARBITRARY` | Arbitrary |
| `PUBLICIZE` | Publicize |
| `CREATE_POLL` | Create Poll |
| `VOTE_ON_POLL` | Vote |
| `UPDATE_POLL` | Update Poll |
| `CREATE_GROUP` | Create Group |
| `UPDATE_GROUP` | Update Group |
| `ADD_GROUP_ADMIN` | Add Admin |
| `REMOVE_GROUP_ADMIN` | Remove Admin |
| `GROUP_BAN` | Group Ban |
| `CANCEL_GROUP_BAN` | Cancel Ban |
| `GROUP_KICK` | Group Kick |
| `GROUP_INVITE` | Group Invite |
| `CANCEL_GROUP_INVITE` | Cancel Invite |
| `JOIN_GROUP` | Join Group |
| `LEAVE_GROUP` | Leave Group |
| `GROUP_APPROVAL` | Group Approval |
| `SET_GROUP` | Set Group |
| `RATE_ACCOUNT` | Rate Account |
