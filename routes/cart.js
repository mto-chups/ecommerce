const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Configuration de la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'commerce'
});

// Fonction pour ajouter un article à une commande existante
function addItemToOrder(order_id, product_id, quantity) {
    return new Promise((resolve, reject) => {
        const addItemQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            SELECT ?, ?, ?, price FROM products WHERE id = ?
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        db.query(addItemQuery, [order_id, product_id, quantity, product_id], (err, itemInsertResult) => {
            if (err) {
                console.error('Erreur lors de l\'ajout de l\'article:', err.message);
                return reject(err);
            }

            // Mettre à jour le total dans la table `orders`
            const updateOrderTotalQuery = `
                UPDATE orders
                SET total = (
                    SELECT SUM(oi.quantity * p.price)
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                )
                WHERE id = ?
            `;
            db.query(updateOrderTotalQuery, [order_id, order_id], (err, updateResult) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour du total de la commande:', err.message);
                    return reject(err);
                }
                resolve(updateResult);
            });
        });
    });
}


// Fonction pour récupérer ou créer une commande non finalisée
function getOrCreateOrder(user_id) {
    return new Promise((resolve, reject) => {
        // Vérifier si une commande non finalisée existe déjà pour cet utilisateur
        const checkOrderQuery = `SELECT id FROM orders WHERE user_id = ? AND order_date IS NULL`;
        db.query(checkOrderQuery, [user_id], (err, orderResults) => {
            if (err) return reject(err);

            if (orderResults.length > 0) {
                console.log(`Commande existante trouvée: ${orderResults[0].id}`);
                resolve(orderResults[0].id);
            } else {
                // Créer une nouvelle commande
                const createOrderQuery = `INSERT INTO orders (user_id, total) VALUES (?, 0)`;
                db.query(createOrderQuery, [user_id], (err, orderInsertResult) => {
                    if (err) return reject(err);
                    console.log(`Nouvelle commande créée: ${orderInsertResult.insertId}`);
                    resolve(orderInsertResult.insertId);
                });
            }
        });
    });
}

// Route pour ajouter un produit au panier
router.post('/add', async (req, res) => {
    const { product_id, quantity } = req.body;

    // Récupérer l'ID de l'utilisateur à partir de la session
    const user_id = req.session.user ? req.session.user.id : null;

    if (!user_id) {
        return res.status(401).json({ error: 'Utilisateur non connecté' });
    }

    try {
        const order_id = await getOrCreateOrder(user_id);
        console.log(`Utilisation de la commande ID: ${order_id} pour l'utilisateur: ${user_id}`);
        await addItemToOrder(order_id, product_id, quantity);
        res.status(200).json({ message: 'Produit ajouté au panier avec succès.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer l'état actuel du panier
router.get('/current', (req, res) => {
    const user_id = req.session.user ? req.session.user.id : null;

    if (!user_id) {
        return res.status(401).json({ error: 'Utilisateur non connecté' });
    }

    const getCartQuery = `
        SELECT oi.product_id, oi.quantity, p.name, p.price
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ? AND o.order_date IS NULL
    `;
    db.query(getCartQuery, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // console.log('Résultats de la requête du panier:', results);
        res.json({ cart: results });
    });
});


//Route pour vider le panier
router.post('/clear', (req, res) => {
    const user_id = req.session.user ? req.session.user.id : null;

    if (!user_id) {
        return res.status(401).json({ error: 'Utilisateur non connecté' });
    }

    // Supprimer tous les articles du panier
    const clearCartQuery = `
        DELETE oi
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? AND o.order_date IS NULL
    `;

    db.query(clearCartQuery, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Mettre le total de la commande à 0
        const resetTotalQuery = `
            UPDATE orders
            SET total = 0
            WHERE user_id = ? AND order_date IS NULL
        `;

        db.query(resetTotalQuery, [user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Panier vidé avec succès et total réinitialisé.' });
        });
    });
});

// Route pour supprimer un produit du panier
router.post('/remove', (req, res) => {
    const user_id = req.session.user ? req.session.user.id : null;
    const { product_id } = req.body;

    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Utilisateur non connecté' });
    }

    // Requête pour supprimer l'article du panier
    const removeItemQuery = `
        DELETE FROM order_items 
        WHERE product_id = ? AND order_id = (
            SELECT id FROM orders WHERE user_id = ? AND order_date IS NULL
        )
    `;

    db.query(removeItemQuery, [product_id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'article du panier' });
        }

        // Mettre à jour le total de la commande après la suppression
        const updateOrderTotalQuery = `
            UPDATE orders
            SET total = (
                SELECT SUM(oi.quantity * p.price)
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = orders.id
            )
            WHERE user_id = ? AND order_date IS NULL
        `;

        db.query(updateOrderTotalQuery, [user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du total de la commande' });
            }
            res.status(200).json({ success: true, message: 'Article supprimé du panier avec succès' });
        });
    });
});


//Route pour finaliser la commande
router.post('/order', (req, res) => {
    const user_id = req.session.user ? req.session.user.id : null;

    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Utilisateur non connecté' });
    }

    const getOrderItemsQuery = `
        SELECT oi.product_id, oi.quantity, p.stock, p.name 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = (SELECT id FROM orders WHERE user_id = ? AND order_date IS NULL)
    `;

    db.query(getOrderItemsQuery, [user_id], (err, items) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des articles de la commande' });
        }

        const outOfStockItems = items.filter(item => item.quantity > item.stock);

        if (outOfStockItems.length > 0) {
            // Supprimer les articles en rupture de stock du panier
            const removeItemsQuery = `
                DELETE FROM order_items 
                WHERE order_id = (SELECT id FROM orders WHERE user_id = ? AND order_date IS NULL)
                AND product_id IN (?)
            `;

            const productIdsToRemove = outOfStockItems.map(item => item.product_id);

            db.query(removeItemsQuery, [user_id, productIdsToRemove], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erreur lors de la suppression des articles en rupture de stock' });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Commande impossible. Certains articles ont été retirés car ils sont en rupture de stock.',
                    outOfStockItems: outOfStockItems.map(item => ({
                        product_id: item.product_id,
                        name: item.name,
                        stock: item.stock
                    }))
                });
            });
        } else {
            // Finaliser la commande si tous les articles sont en stock
            const finalizeOrderQuery = `
                UPDATE orders 
                SET order_date = NOW()
                WHERE user_id = ? AND order_date IS NULL
            `;
            
            db.query(finalizeOrderQuery, [user_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erreur lors de la finalisation de la commande' });
                }

                // Mettre à jour le stock de chaque produit commandé
                const updateStockQueries = items.map(item => {
                    return new Promise((resolve, reject) => {
                        const updateStockQuery = `
                            UPDATE products 
                            SET stock = stock - ?
                            WHERE id = ?
                        `;

                        db.query(updateStockQuery, [item.quantity, item.product_id], (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(updateStockQueries)
                    .then(() => {
                        res.status(200).json({ success: true, message: 'Commande passée avec succès, le stock a été mis à jour' });
                    })
                    .catch(error => {
                        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du stock des produits' });
                    });
            });
        }
    });
});


module.exports = router;
