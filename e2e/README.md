# PetClinic end-to-end tests

Browser tests for the PetClinic UI, written with [Playwright](https://playwright.dev).
They run against an already-running instance of the application (default `http://localhost:8080`,
override with `PETCLINIC_URL`).

```bash
# 1. start the app from the repo root (default H2 profile)
./mvnw spring-boot:run

# 2. in another terminal
cd e2e
npm install
npx playwright install --with-deps chromium
npm test
```

Tests that create data (owners, pets, visits) use unique names so they can be re-run
against the same instance.
