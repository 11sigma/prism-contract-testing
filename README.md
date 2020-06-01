# Contract Testing APIs with Prism & OpenAPI

If you got here by accident, this repository illustrates how to use and experimental Prism programmatic API & [jest](https://jestjs.io) framework to perform contract testing with minimal amount of code.

You can read more about this stuff [in an article I wrote](https://11sigma.com/blog/2019-11-22--contract-testing) but if you don't care and want to figure it out yourself here are some hints.

## Using this code

### Prerequisites

- [Install Docker](https://docs.docker.com/install/)
- Run [httpbin](https://httpbin.org) server locally `docker run -p 80:80 kennethreitz/httpbin`
- Add `httpbin` alias to `/etc/hosts` (optional) `sudo su -c 'echo "0.0.0.0 httpbin"' >> /etc/hosts`

(Part of this code was inspired by the Prism source code, hence the use of `httpbin`).

### Running tests

```bash
yarn # or `npm install`
yarn test
```

This test **should fail** with a body.title violation.
