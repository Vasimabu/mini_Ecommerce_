const express=require('express')
const app=express();
var cors = require('cors')
const dotenv=require('dotenv')
const path=require('path')
const bodyParser=require('body-parser')
const connectDatabase=require('./config/connectDatabse')
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config({path: path.join(__dirname, 'config','config.env')})
//const PORT=process.env.PORT || 8000;


const products=require('./routes/product')
const orders=require('./routes/order')


app.use('/api/v1/',products)
app.use('/api/v1/',orders)

if(process.env.NODE_ENV == 'production'){
    app.use(express.static(path.join(__dirname,'..','frontend','dist','frontend','browser')))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'..','frontend','dist','frontend','browser','index.html'))
    })
}

app.listen(process.env.PORT,()=>{
    console.log(`running on ${process.env.PORT} in ${process.env.NODE_ENV}`);
})