module.exports = {
    testDir: './e2e',
    use: {
      baseURL: 'http://localhost:3000',
    },
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 30000,
    },
  };