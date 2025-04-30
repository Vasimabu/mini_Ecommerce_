const express=require('express')
const { createorder } = require('../controller/orderController')
const router=express.Router()

router.route('/order').post(createorder)

module.exports=router