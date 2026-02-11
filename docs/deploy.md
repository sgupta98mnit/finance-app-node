# Deployment guide (Caddy + Docker)

This guide covers deploying additional apps behind Caddy at `https://sumit-gupta.cloud/projects/<project-name>/`.

## Step-by-step

1. Choose the internal container port the app listens on (for example `3000`, `5173`, `8080`).
2. Do not bind the app to host `80` or `443`. Caddy owns those ports.
3. Ensure Caddy is on the external Docker network `web`.
4. Attach the app container or compose service to the `web` network.
5. Add a Caddyfile route under `/projects/<project-name>/` using `handle_path` or `handle` (see Decision guide).

Copy-paste commands:

```bash
# one-time: create shared reverse-proxy network
sudo docker network create web || true

# attach a running container to the shared network
sudo docker network connect web <container>
```

If using docker-compose, include the external network in your compose file:

```yaml
networks:
  web:
    external: true

services:
  my-app:
    # ...
    networks:
      - web
```

Caddyfile snippet template:

```caddyfile
sumit-gupta.cloud {
  @project path /projects/<project-name>/*
  handle @project {
    reverse_proxy <service-or-container>:<port>
  }
}
```

## Decision guide

Use `handle_path` when:

- The upstream serves at `/` and does not know about the `/projects/<project-name>/` prefix.
- The app does not redirect to `/` or assume it owns the root path.

Use `handle` (no strip) when:

- The upstream is configured with a base path (Vite `base`, Next.js `basePath`, etc.).
- You see redirect loops or assets requested from `/` instead of the subpath.

Examples:

```caddyfile
# strip prefix (app serves at /)
handle_path /projects/radiant-clothing/* {
  reverse_proxy radiant-clothing:3000
}

# keep prefix (app configured with base path)
@fincore path /projects/fincore/*
handle @fincore {
  reverse_proxy ui:5173
}
```

## Common errors

- `nginx: [emerg] bind() to 0.0.0.0:80 failed`. Fix: Remove any host binding to `80`/`443` from your app. Caddy uses those ports.
- Caddy returns `502`. Fix: Verify the upstream container is running and attached to `web`.
- Browser shows `MIME type text/html` for JS bundles. Fix: The proxy is serving the app index instead of the asset. Check subpath routing and whether the app supports the prefix.
- `docker network rm web` fails with “has active endpoints”. Fix: Disconnect containers first: `docker network disconnect web <container>`.
