const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Dictionnaire des chemins de vos fichiers CSS
const cssFiles = {
    'styles.css': path.join(__dirname, '..', 'public', 'css', 'styles.css'),
    'style_sign-in.css': path.join(__dirname, '..', 'public', 'css', 'style_sign-in.css'),
    'style_dashboard.css': path.join(__dirname, '..', 'public', 'css', 'style_dashboard.css'),
    'style_dashboard-all.css': path.join(__dirname, '..', 'public', 'css', 'style_dashboard-all.css')
};

// Variables de couleur par défaut
const defaultColors = {
    couleur1: '#1c1c1c',
    couleur2: '#ffffff',
    couleur3: '#c59d5f',
    couleur4: '#f4f4f4',
    couleur5: '#333333',
    couleur6: '#dddddd',
    couleur7: '#555555',
    couleur11: '#dfb577'
};

// Fonction pour remplacer les couleurs dans le fichier CSS
function updateCSSFile(filePath, variables) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Erreur de lecture du fichier ${filePath}:`, err);
            return;
        }

        // Remplacer chaque variable avec la nouvelle valeur
        let updatedCSS = data;
        for (const [variable, value] of Object.entries(variables)) {
            const regex = new RegExp(`(--${variable}):\\s*[^;]+;`, 'g');
            updatedCSS = updatedCSS.replace(regex, `--${variable}: ${value};`);
        }

        // Écrire le CSS mis à jour dans le fichier
        fs.writeFile(filePath, updatedCSS, 'utf8', (err) => {
            if (err) {
                console.error(`Erreur d'écriture du fichier ${filePath}:`, err);
                return;
            }
            //console.log(`Fichier ${filePath} mis à jour avec succès.`);
        });
    });
}

// Route pour mettre à jour les couleurs
router.post('/update-colors', (req, res) => {
    console.log('Requête reçue pour mettre à jour les couleurs:', req.body);

    // Vérifiez que req.body est défini et n'est pas vide
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('Aucune donnée de couleurs reçue dans la requête.');
        return res.status(400).json({ success: false, message: 'Aucune donnée de couleurs reçue.' });
    }

    const { couleur1, couleur2, couleur3, couleur4, couleur5, couleur6, couleur7, couleur11 } = req.body;

    // Vérifiez que toutes les couleurs sont présentes
    if (!couleur1 || !couleur2 || !couleur3 || !couleur4 || !couleur5 || !couleur6 || !couleur7 || !couleur11) {
        console.error('Des couleurs manquent dans la requête:', req.body);
        return res.status(400).json({ success: false, message: 'Des couleurs manquent dans la requête.' });
    }

    const variables = {
        couleur1, couleur2, couleur3, couleur4, couleur5, couleur6, couleur7, couleur11
    };

    console.log('Variables de couleurs filtrées:', variables);

    const colorVariables = [
        'couleur1', 'couleur2', 'couleur3', 'couleur4', 
        'couleur5', 'couleur6', 'couleur7', 'couleur11'
    ];

    const filteredVariables = Object.keys(variables).reduce((acc, key) => {
        if (colorVariables.includes(key)) {
            acc[key] = variables[key];
        }
        return acc;
    }, {});

    // Appliquez les modifications sur chaque fichier CSS
    for (const fileName of Object.keys(cssFiles)) {
        updateCSSFile(cssFiles[fileName], filteredVariables);
    }

    res.json({ success: true, message: 'Les couleurs ont été mises à jour avec succès.' });
});

// route pour réinitialiser les couleurs aux valeurs par défaut
router.post('/reset-colors', (req, res) => {
  //  console.log('Réinitialisation des couleurs aux valeurs par défaut.');
    
    for (const fileName of Object.keys(cssFiles)) {
       // console.log(`Réinitialisation du fichier CSS: ${fileName}`);
        updateCSSFile(cssFiles[fileName], defaultColors);
    }

    res.json({ success: true, message: 'Les couleurs ont été réinitialisées avec succès.' });
});


module.exports = router;
