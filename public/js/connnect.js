const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Remplace par ton nom d'utilisateur MySQL
  password: '', // Remplace par ton mot de passe MySQL
  database: 'commerce'
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL en tant que id ' + connection.threadId);
});
