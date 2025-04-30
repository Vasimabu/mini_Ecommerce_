const mssql=require('mssql')
const config=require('../config/connectDatabse')
const axios=require('axios')
const path = require('path');


    // Fetch all products from the database
/* exports.getProducts=async (req, res, next) => {
        try {
            // Connect to the database
            let pool = await mssql.connect(config);

            // Define SQL query to get all products
            const result = await pool.request().query('SELECT * FROM Products');

            // Send the result back to the client
            res.status(200).json({
                success: true,
                data: result.recordset // This contains the array of products
            });
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products'
            });
        } finally {
            // Close the database connection
            await mssql.close(); // Correctly close the connection
        }
} */
//get products API
/* exports.GetProducts = async (req, res, next) => {
    try {
        // Step 1: Fetch data from the API
        const response = await axios.get('http://localhost:3500/products'); // Replace with the actual API URL
        const products = response.data;
        console.log(products);

        // Step 2: Connect to the database
        let pool = await mssql.connect(config);

        // Step 3: Insert or update each product in the database
        for (const product of products) {
            // Insert or update product in Products table using a MERGE statement
            let result = await pool.request()
                .input('name', mssql.NVarChar, product.name)
                .input('price', mssql.Decimal(18, 2), parseFloat(product.price))
                .input('description', mssql.NVarChar, product.description)
                .input('ratings', mssql.Decimal(3, 1), parseFloat(product.ratings))
                .input('category', mssql.NVarChar, product.category)
                .input('seller', mssql.NVarChar, product.seller)
                .input('stock', mssql.Int, parseInt(product.stock))
                .query(`
                    MERGE Products AS target
                    USING (SELECT @name AS Name) AS source
                    ON (target.Name = source.Name)
                    WHEN MATCHED THEN 
                        UPDATE SET Price = @price, Description = @description, Ratings = @ratings, Category = @category, Seller = @seller, Stock = @stock
                    WHEN NOT MATCHED THEN
                        INSERT (Name, Price, Description, Ratings, Category, Seller, Stock)
                        VALUES (@name, @price, @description, @ratings, @category, @seller, @stock)
                    OUTPUT inserted.Id;
                `);
            
            const productId = result.recordset.Id;

            // Insert or update images in ProductImages table
            for (const img of product.images) {
                await pool.request()
                    .input('productId', mssql.Int, productId)
                    .input('imageUrl', mssql.NVarChar, img.image)
                    .query(`
                        MERGE ProductImages AS target
                        USING (SELECT @productId AS ProductId, @imageUrl AS ImageUrl) AS source
                        ON (target.ProductId = source.ProductId AND target.ImageUrl = source.ImageUrl)
                        WHEN NOT MATCHED THEN
                            INSERT (ProductId, ImageUrl)
                            VALUES (@productId, @imageUrl);
                    `);
            }
        }

        console.log('Products managed successfully');

        // Step 4: Fetch all products from the database after management
        const result = await pool.request().query('SELECT * FROM Products');

        // Send the managed products back to the client
        res.status(200).json({
            success: true,
            message: 'Products managed successfully',
            data: result.recordset // This contains the array of products
        });
        

    } catch (err) {
        console.error('Error managing and fetching products:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to manage and fetch products'
        });
    } finally {
        // Close the database connection
        await mssql.close(); // Ensure correct closure of the connection
    }
}; */

exports.GetProducts = async (req, res, next) => {
    try {
        // Step 1: Fetch data from the API
        const response = await axios.get('http://localhost:3500/products');
        const products = response.data;
        //console.log(products);

        // Step 2: Connect to the database
        let pool = await mssql.connect(config);

        // Step 3: Insert or update each product in the database
        for (const product of products) {
            // Ensure images is an array, if not, handle accordingly
            const imagesArray = Array.isArray(product.images) ? product.images : [];
            const imagesJson = JSON.stringify(imagesArray);

            const price = parseFloat(product.price);
            if (isNaN(price)) {
                console.error(`Invalid price for product: ${product.name}. Skipping product.`);
                continue; // Skip products with invalid prices
            }

            // Insert or update product in Products table using a MERGE statement
            await pool.request()
                .input('name', mssql.NVarChar, product.name)
                .input('price', mssql.Decimal(18, 2), parseFloat(product.price))
                .input('description', mssql.NVarChar, product.description)
                .input('ratings', mssql.Decimal(3, 1), parseFloat(product.ratings))
                .input('category', mssql.NVarChar, product.category)
                .input('seller', mssql.NVarChar, product.seller)
                .input('stock', mssql.Int, parseInt(product.stock))
                .input('images', mssql.NVarChar, imagesJson)
                .query(`
                    MERGE Products AS target
                    USING (SELECT @name AS Name) AS source
                    ON (target.Name = source.Name)
                    WHEN MATCHED THEN 
                        UPDATE SET 
                            Price = @price, 
                            Description = @description, 
                            Ratings = @ratings, 
                            Category = @category, 
                            Seller = @seller, 
                            Stock = @stock, 
                            Images = @images, 
                            UpdatedAt = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (Name, Price, Description, Ratings, Category, Seller, Stock, Images, CreatedAt, UpdatedAt)
                        VALUES (@name, @price, @description, @ratings, @category, @seller, @stock, @images, GETDATE(), GETDATE());
                `);
        }

        console.log('Products managed successfully');

        // Step 4: Fetch all products from the database after management
        let query = 'SELECT * FROM Products';
        const keyword = req.query.keyword;
        

        // If a keyword is provided, modify the query to search by product name
        if (keyword) {
            query += ` WHERE Name LIKE '%${keyword}%'`;
        }

        const result = await pool.request().query(query);
        //console.log(result.recordset);

        
        // Send the managed products back to the client
        res.status(200).json({
            products: result.recordset
        });

    } catch (err) {
        console.error('Error managing and fetching products:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to manage and fetch products'
        });
    } finally {
        // Close the database connection
        await mssql.close();
    }
};
/* CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Price DECIMAL(18, 2),
    Description NVARCHAR(MAX),
    Ratings DECIMAL(3, 1),
    Category NVARCHAR(255),
    Seller NVARCHAR(255),
    Stock INT,
    Images NVARCHAR(MAX),  -- Stores image URLs as JSON or comma-separated values
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
); */


//get single products API -/api/v1/products/:id

exports.getSingleProducts = async (req, res, next) => {
    let id = req.params.id;
    try {
        // Step 1: Connect to the database
        const pool = await mssql.connect(config);
        
        // Step 2: Create a new request instance
        const request = new mssql.Request(pool);
        
        // Step 3: Define the SQL query
        let query = 'SELECT * FROM Products';
        if (id) {
            query += ' WHERE Id = @Id'; // Add condition to the query
            request.input('Id', mssql.Int, id);
        }
        
        // Step 4: Execute the query
        const result = await request.query(query);
        
        // Step 5: Check if the product was found
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Step 6: Send the response with the product data
        res.status(200).json({
            //success: true,
            products: result.recordset[0] // Return the first product record
        });
        
    } catch (err) {
        console.error('Error managing and fetching product:', err);
        res.status(404).json({
            success: false,
            message: 'Failed to manage and fetch product'
        });
    } finally {
        // Step 7: Close the database connection
        await mssql.close(); // Ensure the connection is properly closed
    }
};


/* CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Price DECIMAL(18, 2) NOT NULL,
    Description NVARCHAR(MAX),
    Ratings NVARCHAR(50),
    Category NVARCHAR(255),
    Seller NVARCHAR(255),
    Stock INT,
    NumOfReviews INT,
    CreatedAt DATETIME DEFAULT GETDATE()
);

select*from Products
CREATE TABLE ProductImages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT FOREIGN KEY REFERENCES Products(Id),
    ImageUrl NVARCHAR(MAX) -- Assuming ImageUrl is a string representing the path or URL
);
select*from ProductImages */