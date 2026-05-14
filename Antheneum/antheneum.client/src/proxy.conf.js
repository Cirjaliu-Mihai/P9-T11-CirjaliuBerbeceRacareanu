const { env } = require('process');

const urls = env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';') : [];
const httpsUrl = urls.find((url) => url.startsWith('https://'));
const httpUrl = urls.find((url) => url.startsWith('http://'));

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  httpsUrl ??
  httpUrl ??
  'https://localhost:7293';

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
      "/images",
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
