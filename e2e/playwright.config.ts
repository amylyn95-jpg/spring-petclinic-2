import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:8080',
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Build the jar once (skipping unit tests), then run it. Set PETCLINIC_JAR to reuse a pre-built jar.
    command: process.env.PETCLINIC_JAR
      ? `java -jar ${process.env.PETCLINIC_JAR}`
      : 'cd .. && ./mvnw -B -q package -DskipTests && java -jar target/*.jar',
    url: 'http://localhost:8080',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
