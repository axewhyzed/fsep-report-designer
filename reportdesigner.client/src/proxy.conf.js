const PROXY_CONFIG = [
  {
    context: [
      "/databaseinfo",
      "/reports",
    ],
    target: "https://localhost:7129",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
