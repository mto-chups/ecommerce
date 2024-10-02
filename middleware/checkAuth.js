function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        // Vérifiez que l'utilisateur est un commerçant
        if (req.session.user.role === 'commercant') {
            return next();  // L'utilisateur est authentifié et est un commerçant
        } else {
            return res.status(403).send('Accès refusé : vous n\'êtes pas autorisé à accéder à cette page.');
        }
    } else {
        res.redirect('/login'); // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
    }
}

module.exports = checkAuth;
