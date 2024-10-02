const express = require('express');
const router = express.Router();  // Utilisez router pour définir les routes
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');


// Configuration de la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'commerce'
});

router.use(bodyParser.json()); // Utilisez router.use() pour les middlewares


// Route pour gérer l'inscription
router.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
        } else {
            // Hachage du mot de passe
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Insérer le nouvel utilisateur dans la base de données
                const insertQuery = `INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())`;
                db.query(insertQuery, [username, email, hash], (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès' });
                });
            });
        }
    });
});

// Route pour gérer la connexion
router.post('/login', (req, res) => {
    //console.log('Début de la route de connexion');

    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Erreur bcrypt:', err);
                    return res.status(500).json({ error: 'Erreur interne du serveur' });
                }

                if (isMatch) {
                    req.session.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                    // Ajouter le rôle dans la réponse JSON
                    return res.status(200).json({ success: true, role: user.role });
                } else {
                    return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
    });
});


// Route de test 
router.get('/test-session', (req, res) => {
    console.log('Session actuelle:', req.session.user);  // Log pour vérifier
    if (req.session && req.session.user) {
        res.json({ message: 'Session active', user: req.session.user });
    } else {
        res.json({ message: 'Aucune session active' });
    }
});

// Route de check session
router.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ 
            loggedIn: true, 
            username: req.session.user.username,
            role: req.session.user.role
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.clearCookie('connect.sid');  // Si vous utilisez des cookies pour les sessions
        res.status(200).json({ success: true, message: 'Déconnecté avec succès' });
    });
});

module.exports = router;
