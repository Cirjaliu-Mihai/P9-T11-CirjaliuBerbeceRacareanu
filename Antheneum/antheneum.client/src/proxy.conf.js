const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5095';

const PROXY_CONFIG = [
  {
    context: [
      "/auth",
      "/books",
      "/branches",
      "/copies",
      "/loans",
      "/readers",
      "/blacklist",
      "/reports",
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
