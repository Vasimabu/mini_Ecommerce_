const express=require('express')
const {GetProducts, getSingleProducts,} = require('../controller/productController')
const router=express.Router()

// router.route('/json').get(insertProductsFromAPI)
//router.route('/products').get(productsController)
router.get('/products',GetProducts);
//router.post('/products/manage',insertProductFromAPI);
router.route('/products/:id').get(getSingleProducts)


module.exports=router