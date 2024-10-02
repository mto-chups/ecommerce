const fs = require('fs');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;
const checkAuth = require('./middleware/checkAuth');
const productsRouter = require('./routes/products'); 
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/users');
const cors = require('cors');
const updateColorsRouter = require('./routes/updatecolors'); // Assurez-vous que le chemin est correct
const bannerSettingsFile = path.join(__dirname, 'banner-settings.json');

app.use(cors());

// Middleware pour analyser le JSON des requêtes POST
app.use(express.json());

// Middleware pour analyser les données encodées dans l'URL (formulaires)
app.use(express.urlencoded({ extended: true })); // Remplace bodyParser.urlencoded()


// Configuration de la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'commerce'
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connecté à la base de données MySQL');
});

// Configurer le middleware de session
app.use(session({
    secret: 'votre_secret_de_session',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Utilisez true si vous êtes en HTTPS
}));

// Lire les paramètres de la bannière depuis le fichier JSON
function readBannerSettings() {
    try {
        if (fs.existsSync(bannerSettingsFile)) {
            const rawdata = fs.readFileSync(bannerSettingsFile);
            return JSON.parse(rawdata);
        } else {
            return {
                isActive: false,
                product1: null,
                product2: null,
                product3: null
            };
        }
    } catch (error) {
        console.error('Erreur lors de la lecture des paramètres de la bannière:', error);
        return {
            isActive: false,
            product1: null,
            product2: null,
            product3: null
        };
    }
}

function writeBannerSettings(settings) {
    try {
        fs.writeFileSync(bannerSettingsFile, JSON.stringify(settings, null, 4));
    } catch (error) {
        console.error('Erreur lors de l\'écriture des paramètres de la bannière:', error);
    }
}


//Routes API
app.use('/api/auth', authRoutes);  // Route pour l'authentification
app.use('/api/products', productsRouter);
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', userRoutes);
app.use('/api', updateColorsRouter);

//Route pour le dashboard
app.get('/dashboard', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

//Route pour le dashboard-users
app.get('/dashboard-users', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard-users.html'));
});

//Route Stock
app.get('/api/stocks', checkAuth, (req, res) => {
    const query = `SELECT * FROM products`;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ stocks: results });
    });
});

//Route dernières commandes validées
app.get('/api/orders', checkAuth, (req, res) => {
    const query = `
        SELECT o.id, o.order_date, o.total, u.username
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.order_date IS NOT NULL
        ORDER BY o.order_date DESC
        LIMIT 20
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ orders: results });
    });
});

// Route pour obtenir les paramètres actuels de la bannière
app.get('/api/banner-settings', (req, res) => {
    const settings = readBannerSettings();
    res.json(settings);
});

// Route pour mettre à jour les paramètres de la bannière
app.post('/api/update-banner-settings', (req, res) => {
    const { isActive, product1, product2, product3 } = req.body;

    console.log('Mise à jour des paramètres de la bannière...');
    console.log('Données reçues du client:', req.body);

    const newSettings = { isActive, product1, product2, product3 };
    writeBannerSettings(newSettings);

    console.log('Nouveaux paramètres de la bannière enregistrés:', newSettings);

    res.json({ success: true, message: 'Paramètres de la bannière mis à jour avec succès.' });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route pour login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Route pour sign-in
app.get('/sign-in', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sign-in.html'));
});

app.get('/product-indiv', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product-indiv.html'));
});

// Route pour logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

//Ajuster le CSP
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com;");
    next();
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
