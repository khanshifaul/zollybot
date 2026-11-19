import type { Server } from "node:net";

/**
 * Listens on a free loopback port and resolves that port. A failed `listen` rejects with its
 * error; a listener with no port rejects with `noPort()`. The `error` listener is removed once the
 * server listens, so it does not hold the caller after the start.
 *
 * With `preferredPort`, that port is tried first and any free port is used when it cannot be bound.
 */
export async function listenLoopback(server: Server, noPort: () => Error, preferredPort?: number): Promise<number> {
  if (preferredPort !== undefined) {
    try {
      return await listenOn(server, noPort, preferredPort, "127.0.0.1");
    } catch {
      // Another program holds the port, or this one is not allowed to bind it.
    }
  }
  return listenOn(server, noPort, 0, "127.0.0.1");
}

/**
 * Listens on exactly `port` of the loopback address, or rejects. For an address that another
 * computer chose, such as the callback of a relayed sign-in: any other port is no answer at all.
 */
export function listenLoopbackExact(server: Server, noPort: () => Error, port: number): Promise<number> {
  return listenOn(server, noPort, port, "127.0.0.1");
}

/**
 * Listens on a free port on all interfaces for private-network local access (LAN/Tailscale).
 * Mobile Connect requires the host API to be reachable from the phone on the private network.
 */
export async function listenPrivate(server: Server, noPort: () => Error, preferredPort?: number): Promise<number> {
  if (preferredPort !== undefined) {
    try {
      return await listenOn(server, noPort, preferredPort, "0.0.0.0");
    } catch {
      // Another program holds the port, or this one is not allowed to bind it.
    }
  }
  return listenOn(server, noPort, 0, "0.0.0.0");
}

function listenOn(server: Server, noPort: () => Error, port: number, host: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(noPort());
        return;
      }
      resolve(address.port);
    });
  });
}
