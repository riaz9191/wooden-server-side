const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
//dotenv
require('dotenv').config();

//midleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3onslcg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const toyCollections = client.db("toyMarket").collection('toys')

        //postToys
        app.post('/posttoys', async (req, res) => {
            const body = req.body;
            if (!body) {
                return res.status(404).send({ message: "Invalid request." });
            }
            console.log(body)
            const result = await toyCollections.insertOne(body)
            res.send(result)
        })
        app.get('/allToys', async (req, res) => {
            console.log(req.query)
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            const result = await toyCollections.find(query).toArray();
            res.send(result)

        })
        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollections.findOne(query)

            res.send(result)
        })
        // app.get('/allToys', async (req, res) => {
        //     console.log(req.query)
        //     const result = await toyCollections.find({}).toArray();
        //     res.send(result)

        // })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Simple crud running on port")
});
app.listen(port, () => {
    console.log(`crud running on port,${port}`)
});