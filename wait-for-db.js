const mysql = require('mysql2/promise');

const waitForDatabase = async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'tellico',
    password: process.env.DB_PASSWORD || 'tellico',
    database: process.env.DB_DATABASE || 'tellico',
  };

  const maxRetries = 30;
  const retryDelay = 2000; // 2 secondes

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Tentative de connexion à MySQL (${i + 1}/${maxRetries})...`);
      
      const connection = await mysql.createConnection(config);
      
      // Tester la connexion avec une requête simple
      await connection.execute('SELECT 1');
      await connection.end();
      
      console.log(' MySQL est prêt ! Démarrage de l\'application...');
      return;
    } catch (error) {
      console.log(` MySQL non disponible (${error.code}). Nouvelle tentative dans ${retryDelay/1000}s...`);
      
      if (i === maxRetries - 1) {
        console.error(' Impossible de se connecter à MySQL après toutes les tentatives');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

waitForDatabase();
