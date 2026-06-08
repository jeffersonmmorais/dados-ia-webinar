module.exports = {
  apps: [
    {
      name: "dados-ia-webinar",
      script: "./dist/server/entry.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        HOST: "127.0.0.1",
        PORT: "4321",
        NODE_ENV: "production"
      }
    }
  ]
};
