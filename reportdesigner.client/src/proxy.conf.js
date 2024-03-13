const PROXY_CONFIG = [
  {
    context: [
      "/databaseinfo",
    ],
    target: "https://localhost:7129",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
