module.exports = {
  apps: [
    {
      name: "ova-app",
      script: "server.js",
      args: "--port 3003",
      cwd: "C:\\ova-app",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        HOSTNAME: "0.0.0.0",
      },
      // Add environment variables for database connection
      env_production: {
        NODE_ENV: "production",
        PORT: 3003,
        HOSTNAME: "0.0.0.0",
        // Make sure these match your .env.production file
        DATABASE_URL:
          "postgresql://ovaadmin:22@172.16.51.49:5432/OVADEV?schema=public",
        NEXTAUTH_URL: "http://172.16.51.49:3003",
        NEXTAUTH_SECRET: "O44/g/kwx5FBy+bCek/R8UYVecyaP1JxAvxSRRtKmoI=",
      },
    },
  ],
};
