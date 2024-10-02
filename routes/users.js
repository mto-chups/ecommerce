const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Utiliser la version promise de mysql2

// Configuration de la base de données
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'commerce'
};

// Route pour récupérer la liste des utilisateurs
router.get('/', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [users] = await connection.query(`
            SELECT id, username, email, role
            FROM users
        `);
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await connection.end();
    }
});

// Route pour changer le rôle d'un utilisateur
router.post('/change-role', async (req, res) => {
    const { userId, newRole } = req.body;

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.query(`
            UPDATE users
            SET role = ?
            WHERE id = ?
        `, [newRole, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ success: true, message: 'Rôle mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await connection.end();
    }
});

// Route pour obtenir les 10 derniers utilisateurs
router.get('/last-users', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [results] = await connection.query(`
            SELECT * FROM users
            ORDER BY created_at DESC
            LIMIT 10
        `);
        res.json({ users: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await connection.end();
    }
});

// Route pour obtenir tous les utilisateurs (pour la nouvelle page)
router.get('/all-users', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [results] = await connection.query(`
            SELECT * FROM users
            ORDER BY created_at DESC
        `);
        res.json({ users: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await connection.end();
    }
});

// Route pour supprimer un utilisateur
router.delete('/delete/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.beginTransaction();

        // Supprimer les articles associés aux commandes
        await connection.query(`
            DELETE FROM order_items
            WHERE order_id IN (
                SELECT id FROM orders
                WHERE order_date IS NULL
            );
        `);

        // Supprimer les commandes avec order_date NULL
        await connection.query(`
            DELETE FROM orders
            WHERE order_date IS NULL;
        `);

        // Supprimer l'utilisateur
        const [result] = await connection.query(`
            DELETE FROM users
            WHERE id = ?;
        `, [userId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await connection.commit();
        res.json({ success: true, message: 'Utilisateur supprimé avec succès' });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    } finally {
        await connection.end();
    }
});


module.exports = router;
