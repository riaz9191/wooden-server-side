const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
//dotenv
require('dotenv').config();

//midleware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send("Simple crud running on port")
});
app.listen (port,()=> {
    console.log(`crud running on port,${port}`)
});