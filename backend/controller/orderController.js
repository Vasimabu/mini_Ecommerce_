const mssql=require('mssql')
const config=require('../config/connectDatabse')

/* exports.createorder=(req,res,next)=>{
    const cartItems=req.body
    const amount=cartItems.reduce((acc,item)=>(acc + item.product.Price * item.qty),0);//total array comvert into single total amount value
    console.log(amount,'Amount');
    
        res.json({
            success:true,
            message:"order works"
        })
    } */

/*  exports.createorder=async (req,res,next)=>{
   const cartItems=req.body
    // Calculate total amount
    const amount = Number(cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price); // Ensure price is a number
        const quantity = parseInt(item.qty); // Ensure quantity is a number
        return acc + (price * quantity);
        }, 0)).toFixed(2);
    //const status='pending';

    //const order =await orderModel.create({cartItems,amount,status})

    console.log(amount,'amount');
    
    res.json({
        success:true,
        order:amount
    })
}  */

// Adjust the path to your MSSQL config
/* exports.createorder = async (req, res, next) => {
    const { cartItems, status } = req.body;

    // Validate cartItems
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing cart items'
        });
    }

    // Calculate total amount
    const amount = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price);
        const quantity = parseInt(item.qty, 10);
        return acc + (price * quantity);
    }, 0);

    try {
        let pool = await mssql.connect(config);

        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            const orderRequest = new mssql.Request(transaction);
            const orderResult = await orderRequest.query(`
                SELECT ISNULL(MAX(Id), 0) + 1 AS NewOrderId FROM Orders;
            `);

            const orderId = orderResult.recordset.NewOrderId;

            for (const item of cartItems) {
                const itemRequest = new mssql.Request(transaction);
                
                // Log item data
                console.log('Inserting Order:', {
                    amount, 
                    status, 
                    productId: item.product.Id, 
                    quantity: item.qty, 
                    price: item.product.Price
                });
            
                await itemRequest
                    .input('amount', mssql.Decimal(18, 2), amount)
                    .input('status', mssql.NVarChar, status)
                    .input('productId', mssql.Int, item.product.Id)
                    .input('productName', mssql.NVarChar, item.product.Name)
                    .input('quantity', mssql.Int, item.qty)
                    .input('price', mssql.Decimal(18, 2), item.product.Price)
                    .query(`
                        INSERT INTO Orders (Amount, Status, ProductId, ProductName, Quantity, Price)
                        VALUES (@amount, @status, @productId, @ProductName, @quantity, @price);
                    `);
            }
            await transaction.commit();

            res.json({
                success: true,
                order: {
                    id: orderId,
                    amount: amount,
                    status: status,
                    items: cartItems
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            details: error.message
        });
    } finally {
        await mssql.close();
    }
}; */
/* CREATE TABLE Orders (
    Id INT PRIMARY KEY IDENTITY(1,1),        -- Unique identifier for the order
    Amount DECIMAL(18, 2),                   -- Total amount for the order
    Status NVARCHAR(50),                     -- Status of the order
    CreatedAt DATETIME DEFAULT GETDATE(),    -- Timestamp for when the order was created
    ProductId INT,                           -- Product ID (from OrderItems)
    Quantity INT,                            -- Quantity of the product (from OrderItems)
    Price DECIMAL(18, 2)                     -- Price of the product (from OrderItems)
); */
/* exports.createorder = async (req, res, next) => {
    const { cartItems, status } = req.body;

    // Validate cartItems
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing cart items'
        });
    }

    // Calculate total amount
    const amount = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price);
        const quantity = parseInt(item.qty, 10);
        return acc + (price * quantity);
    }, 0);

    try {
        let pool = await mssql.connect(config);
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // Check stock availability
            for (const item of cartItems) {
                const stockCheckRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                const stockCheckResult = await stockCheckRequest.query(`
                    SELECT stock FROM Products WHERE Id = @productId;
                `).input('productId', mssql.Int, productId);

                const stockAvailable = stockCheckResult.recordset.stock;

                if (stockAvailable < quantityOrdered) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for product ID ${productId}. Requested: ${quantityOrdered}, Available: ${stockAvailable}`
                    });
                }
            }

            // Update stock levels in Products table
            for (const item of cartItems) {
                const updateStockRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                await updateStockRequest.query(`
                    UPDATE Products 
                    SET stock = stock - @quantity
                    WHERE Id = @productId;
                `)
                .input('quantity', mssql.Int, quantityOrdered)
                .input('productId', mssql.Int, productId);
            }

            // Insert the order into Orders table
            const orderRequest = new mssql.Request(transaction);
            const orderResult = await orderRequest.query(`
                SELECT ISNULL(MAX(Id), 0) + 1 AS NewOrderId FROM Orders;
            `);
            
            const orderId = orderResult.recordset.NewOrderId;

            for (const item of cartItems) {
                const itemRequest = new mssql.Request(transaction);
                
                console.log('Inserting Order:', {
                    amount, 
                    status, 
                    productId: item.product.Id, 
                    quantity: item.qty, 
                    price: item.product.Price
                });

                await itemRequest
                    .input('amount', mssql.Decimal(18, 2), amount)
                    .input('status', mssql.NVarChar, status)
                    .input('productId', mssql.Int, item.product.Id)
                    .input('quantity', mssql.Int, item.qty)
                    .input('price', mssql.Decimal(18, 2), item.product.Price)
                    .query(`
                        INSERT INTO Orders (Amount, Status, ProductId, Quantity, Price)
                        VALUES (@amount, @status, @productId, @quantity, @price);
                    `);
            }

            await transaction.commit();
            res.json({
                success: true,
                order: {
                    id: orderId,
                    amount: amount,
                    status: status,
                    items: cartItems
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            details: error.message
        });
    } finally {
        await mssql.close();
    }
}; */
/* exports.createorder = async (req, res, next) => {
    const { cartItems, status, amount } = req.body;

    // Validate cartItems
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing cart items'
        });
    }

    // Re-calculate total amount on the backend to ensure correctness
    const calculatedAmount = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price);
        const quantity = parseInt(item.qty, 10);
        return acc + (price * quantity);
    }, 0);

    // Compare the amount from request body with the calculated amount
    if (amount !== calculatedAmount) {
        return res.status(400).json({
            success: false,
            message: 'Amount mismatch. Please verify the cart items and total amount.'
        });
    }

    try {
        let pool = await mssql.connect(config);
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // Check stock availability
            for (const item of cartItems) {
                const stockCheckRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                // Ensure to input the parameter after the query is called
                stockCheckRequest.input('productId', mssql.Int, productId);
                const stockCheckResult = await stockCheckRequest.query(`
                    SELECT stock FROM Products WHERE Id = @productId;
                `);

                const stockAvailable = stockCheckResult.recordset[0].stock; // Accessing the first record

                if (stockAvailable < quantityOrdered) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for product ID ${productId}. Requested: ${quantityOrdered}, Available: ${stockAvailable}`
                    });
                }
            }

            // Update stock levels in Products table
            for (const item of cartItems) {
                const updateStockRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                updateStockRequest.input('quantity', mssql.Int, quantityOrdered);
                updateStockRequest.input('productId', mssql.Int, productId);

                await updateStockRequest.query(`
                    UPDATE Products 
                    SET stock = stock - @quantity
                    WHERE Id = @productId;
                `);
            }

            // Insert the order into Orders table
            const orderRequest = new mssql.Request(transaction);
            const orderResult = await orderRequest.query(`
                SELECT ISNULL(MAX(Id), 0) + 1 AS NewOrderId FROM Orders;
            `);
            
            const orderId = orderResult.recordset[0].NewOrderId; // Accessing first record

            for (const item of cartItems) {
                const itemRequest = new mssql.Request(transaction);
                
                itemRequest.input('amount', mssql.Decimal(18, 2), calculatedAmount); // Use calculated amount
                itemRequest.input('status', mssql.NVarChar, status);
                itemRequest.input('productId', mssql.Int, item.product.Id);
                itemRequest.input('productName', mssql.NVarChar, item.product.Name);
                itemRequest.input('quantity', mssql.Int, item.qty);
                itemRequest.input('price', mssql.Decimal(18, 2), item.product.Price);

                await itemRequest.query(`
                    INSERT INTO Orders (Amount, Status, ProductId, ProductName, Quantity, Price)
                    VALUES (@amount, @status, @productId, @productName, @quantity, @price);
                `);
            }

            await transaction.commit();
            res.json({
                success: true,
                order: {
                    id: orderId,
                    amount: calculatedAmount,
                    status: status,
                    items: cartItems,
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            details: error.message
        });
    } finally {
        await mssql.close();
    }
}; */


  exports.createorder = async (req, res, next) => {
    const { cartItems, status } = req.body;

    // Validate cartItems
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing cart items'
        });
    }

    // Calculate total amount
    const amount = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price);
        const quantity = parseInt(item.qty, 10);
        return acc + (price * quantity);
    }, 0);

    try {
        let pool = await mssql.connect(config);
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // Check stock availability
            for (const item of cartItems) {
                const stockCheckRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                // Ensure to input the parameter after the query is called
                stockCheckRequest.input('productId', mssql.Int, productId);
                const stockCheckResult = await stockCheckRequest.query(`
                    SELECT stock FROM Products WHERE Id = @productId;
                `);

                const stockAvailable = stockCheckResult.recordset.stock; // Accessing the first record

                if (stockAvailable < quantityOrdered) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for product ID ${productId}. Requested: ${quantityOrdered}, Available: ${stockAvailable}`
                    });
                }
            }

            // Update stock levels in Products table
            for (const item of cartItems) {
                const updateStockRequest = new mssql.Request(transaction);
                const productId = item.product.Id;
                const quantityOrdered = item.qty;

                updateStockRequest.input('quantity', mssql.Int, quantityOrdered);
                updateStockRequest.input('productId', mssql.Int, productId);

                await updateStockRequest.query(`
                    UPDATE Products 
                    SET stock = stock - @quantity
                    WHERE Id = @productId;
                `);
            }

            // Insert the order into Orders table
            const orderRequest = new mssql.Request(transaction);
            const orderResult = await orderRequest.query(`
                SELECT ISNULL(MAX(Id), 0) + 1 AS NewOrderId FROM Orders;
            `);
            
            const orderId = orderResult.recordset.NewOrderId; // Accessing first record

            for (const item of cartItems) {
                const itemRequest = new mssql.Request(transaction);
                
                itemRequest.input('amount', mssql.Decimal(18, 2), amount);
                itemRequest.input('status', mssql.NVarChar, status);
                itemRequest.input('productId', mssql.Int, item.product.Id);
                itemRequest.input('productName', mssql.NVarChar, item.product.Name)
                itemRequest.input('quantity', mssql.Int, item.qty);
                itemRequest.input('price', mssql.Decimal(18, 2), item.product.Price);

                await itemRequest.query(`
                    INSERT INTO Orders (Amount, Status, ProductId,ProductName,Quantity, Price)
                    VALUES (@amount, @status, @productId, @ProductName, @quantity, @price);
                `);
            }
            await transaction.commit();
            res.json({
                success: true,
                order: {
                    id: orderId,
                    items: cartItems,
                    amount: amount,
                    status: status
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            details: error.message
        });
    } finally {
        await mssql.close();
    }
}; 


/*exports.createorder = async (req, res, next) => {
    //const status='pending';
    const { cartItems, status } = req.body;

    // Validate cartItems
    if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid cart items'
        });
    }

    // Calculate total amount
    const amount = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product.Price);
        const quantity = parseInt(item.qty);
        return acc + (price * quantity);
    }, 0);

    try {
        // Convert cartItems to a JSON string
        const cartItemsJSON = JSON.stringify(cartItems);

        // Connect to the database
        let pool = await mssql.connect(config);

        // Insert the order into the Orders table
        const orderRequest = pool.request();
        const orderResult = await orderRequest
            .input('CartItems', mssql.NVarChar(mssql.MAX), cartItemsJSON)
            .input('Amount', mssql.Decimal(18, 2), amount)
            .input('Status', mssql.NVarChar(50), status)
            .query(`
                INSERT INTO Orders (CartItems, Amount, Status)
                OUTPUT INSERTED.Id
                VALUES (@CartItems, @Amount, @Status);
            `);

        const orderId = orderResult.recordset[0].Id;

        // Return the order information
        res.json({
            success: true,
            order: {
                id: orderId,
                amount: amount,
                status: status,
                items: cartItems
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    } finally {
        // Close the database connection
        await mssql.close();
    }
};*/

//above exports table
/* CREATE TABLE Orders (
    Id INT PRIMARY KEY IDENTITY(1,1), -- Auto-incremented ID
    CarItems NVARCHAR(MAX),  -- Assuming we store an array in JSON format as a string
    Amount NVARCHAR(255),     -- Using NVARCHAR to accommodate string values
    Status NVARCHAR(50),      -- Using NVARCHAR for the status
    CreatedAt DATETIME        -- DATETIME for the created timestamp
); */
//thunder client post api
/* {
    "cartItems":[
    {
      "product" :{
      "Id": 1,
      "Name": "iPhone 14 Pro Max",
      "Price": 1199.99,
      "Description": "Apple iPhone 14 Pro Max with A16 Bionic chip, 6.7-inch Super Retina XDR display, and ProMotion technology.",
      "Ratings": "4.8",
      "Category": "Smartphones",
      "Seller": "Apple Store",
      "Stock": 150,
      "NumOfReviews": null,
      "CreatedAt": "2024-08-24T21:25:17.573Z"
    },
      "qty":2
    },
    {
      "product":{
      "Id": 3,
      "Name": "Google Pixel 7 Pro",
      "Price": 899.99,
      "Description": "Google Pixel 7 Pro with Google Tensor G2 chip, 6.7-inch LTPO AMOLED display, and advanced camera system.",
      "Ratings": "4.6",
      "Category": "Smartphones",
      "Seller": "Google Store",
      "Stock": 180,
      "NumOfReviews": null,
      "CreatedAt": "2024-08-24T21:25:17.627Z"
    },
      "qty":3
    }
  ],
   "status":"pending"
  } */