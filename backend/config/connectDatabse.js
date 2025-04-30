const mssql = require('mssql');

// Database Configuration
const config = {
    user: 'sa', // Database username
    password: 'sql2005', // Database password
    server: 'localhost', // Server IP address
    database: 'mini_ecommerce', // Database name
    options: {
        encrypt: false,// Disable encryption
        trustServerCertificate:true
    }
};

// Connect to Database
mssql.connect(config, err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit process with failure
    } else {
        console.log('Database connection successful');
    }
}); 

module.exports=config