/* const mssql = require('mssql');
const fs = require('fs').promises; // For reading files asynchronously
const path = require('path');
const config = require('../config/connectDatabse'); // Adjust the path as necessary

// Load JSON data from the file
async function loadProducts() {
    try {
        const filePath = path.join(__dirname, 'product.json'); // Adjust the path as necessary
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading JSON file:', err);
        throw err;
    }
}

// Insert products into the database
async function insertProducts() {
    try {
        let pool = await mssql.connect(config);
        const products = await loadProducts();

        for (const product of products) {
            // Insert product into Products table
            let result = await pool.request()
                .input('name', mssql.NVarChar, product.name)
                .input('price', mssql.Decimal(18, 2), parseFloat(product.price))
                .input('description', mssql.NVarChar, product.description)
                .input('ratings', mssql.Decimal(3, 1), parseFloat(product.ratings))
                .input('category', mssql.NVarChar, product.category)
                .input('seller', mssql.NVarChar, product.seller)
                .input('stock', mssql.Int, parseInt(product.stock))
                .query('INSERT INTO Products (Name, Price, Description, Ratings, Category, Seller, Stock) OUTPUT INSERTED.Id VALUES (@name, @price, @description, @ratings, @category, @seller, @stock)');

            const productId = result.recordset[0].Id;

            // Insert images into ProductImages table
            for (const img of product.images) {
                await pool.request()
                    .input('productId', mssql.Int, productId)
                    .input('imageUrl', mssql.NVarChar, img.image) // Ensure 'image' is the correct property name
                    .query('INSERT INTO ProductImages (ProductId, ImageUrl) VALUES (@productId, @imageUrl)');
            }
        }

        console.log('Products inserted successfully');
    } catch (err) {
        console.error('Error inserting products:', err);
    } finally {
        await mssql.close();
    }
}

module.exports={insertProducts}
 */