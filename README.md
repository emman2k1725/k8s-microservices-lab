# Kubernetes Microservices Lab

A minimal, beginner-friendly starter for learning Kubernetes with three
small Node.js microservices. Each service uses only Node.js 20 built-in
modules — no npm, no `package.json`, no frameworks.

## Overview

- **product-service** returns a hardcoded list of products.
- **order-service** calls `product-service` and builds a fake order from
  the first product it gets back.
- **api-gateway** is the single entry point: it proxies `/products` to
  `product-service` and `/orders` to `order-service`.

Every JSON response includes `servedBy` (the pod's hostname), so once
these are running in Kubernetes with multiple replicas, you can watch
requests land on different pods — that's load balancing in action.

## Folder structure

```
k8s-microservices-lab/
├── README.md
├── .gitignore
├── product-service/
│   ├── server.js
│   ├── Dockerfile
│   └── .dockerignore
├── order-service/
│   ├── server.js
│   ├── Dockerfile
│   └── .dockerignore
├── api-gateway/
│   ├── server.js
│   ├── Dockerfile
│   └── .dockerignore
└── k8s/
    └── product-service.yaml   (starter manifest — see "What's left" below)
```

## Building the images

From the repo root:

```bash
docker build -t product-service:1.0 ./product-service
docker build -t order-service:1.0 ./order-service
docker build -t api-gateway:1.0 ./api-gateway
```

## Testing each service locally with Docker

**product-service** (no dependencies):

```bash
docker run --rm -p 3000:3000 -e HOSTNAME=local-test product-service:1.0
curl localhost:3000/
curl localhost:3000/health
```

**order-service** (needs `PRODUCT_URL` pointing at a running
product-service container; use `host.docker.internal` on Mac/Windows,
or run with `--network host` on Linux):

```bash
docker run --rm -p 3001:3000 \
  -e HOSTNAME=local-test \
  -e PRODUCT_URL=http://host.docker.internal:3000 \
  order-service:1.0
curl localhost:3001/
curl localhost:3001/health
```

**api-gateway** (needs `PRODUCT_URL` and `ORDER_URL`):

```bash
docker run --rm -p 3002:3000 \
  -e HOSTNAME=local-test \
  -e PRODUCT_URL=http://host.docker.internal:3000 \
  -e ORDER_URL=http://host.docker.internal:3001 \
  api-gateway:1.0
curl localhost:3002/products
curl localhost:3002/orders
curl localhost:3002/health
```

## What's left for you

Only `k8s/product-service.yaml` is provided, as a starter example of the
Deployment + Service pattern. You'll need to write, on your own:

- Deployment + Service manifests for `order-service` and `api-gateway`
- A ConfigMap (or equivalent) to supply `PRODUCT_URL` and `ORDER_URL` to
  the services that need them
- An Ingress to expose `api-gateway` outside the cluster

No solutions for these are included — that's the lab.
