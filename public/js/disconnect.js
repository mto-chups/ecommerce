connection.end((err) => {
    if (err) throw err;
    console.log('Connexion à la base de données fermée.');
  });