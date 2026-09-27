# Social AIO Worker Keeper — P1.5

Purpose: keep one Social AIO `https://fbaio.org/#/apis` browser tab healthy for the W1 pilot without changing the Community Sales OS business logic.

## What it does

- Elects one `/apis` tab as the primary Worker tab.
- Detects `Connected` / `Disconnect` / `Connect` state.
- After F5 or a transient WebSocket drop, retries the visible **Connect** button with backoff.
- Can dismiss the **WebSocket error** modal automatically before retrying.
- Publishes local heartbeat/status to the extension popup.
- Does **not** reload the page automatically.
- Does **not** close duplicate tabs. Only one tab is primary; duplicate tabs remain passive.
- Does **not** store or transmit the full Client ID. The popup only receives a masked form.

## Install in W1 browser profile

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `worker-keeper` folder.
5. Pin **Social AIO Worker Keeper** to the toolbar.
6. Open `https://fbaio.org/#/apis` and connect once if the site requires an initial authorization.
7. Open the extension popup and confirm:
   - **Worker = ONLINE**
   - **Tự reconnect khi rớt = ON**
   - **Tự đóng popup WebSocket error = ON**

## Acceptance test

### A. Normal state
- Social AIO page shows Connected.
- Popup shows `ONLINE`.
- Reconnect count stays unchanged.

### B. F5 recovery
1. F5 only the `fbaio.org/#/apis` tab.
2. Do not click Connect manually.
3. Within roughly 2–15 seconds the extension should click Connect if required.
4. Popup returns to `ONLINE`.

### C. WebSocket error recovery
- If the WebSocket error modal appears, the extension dismisses it.
- It retries Connect with backoff: about 2s → 4s → 8s → 16s → max 30s.
- It never reloads the page in a loop.

### D. Duplicate API tabs
- Open a second `/apis` tab.
- Only one tab should actively reconnect.
- The second tab remains passive and is not auto-closed.

## Safety boundary

This extension is only a browser connection keeper. It does not scrape Facebook, does not call the Community Sales OS backend, and does not alter scan/pagination/AI/Lead Gate logic.
