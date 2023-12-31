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

        // Creating index on two fields
        const indexKeys = { title: 1, category: 1 }; // Replace field1 and field2 with your actual field names
        const indexOptions = { title: "nameCategory" }; // Replace index_name with the desired index name 
        const result = await toyCollections.createIndex(indexKeys, indexOptions);
        // console.log(result);
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
            let query = {};
            if (req.query?.sellerEmail) {
                query = { sellerEmail: req.query.sellerEmail }
            }
            let sort = {};
            if (req.query?.sort) {
                sort = { price: (req.query.sort === "asc" ? 1 : -1) } 
            }
            const result = await toyCollections.find(query).sort(sort).toArray();
            res.send(result);
        }); 
        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollections.findOne(query)

            res.send(result)
        })
        // get toy by search
        app.get("/searchtoy/:text", async (req, res) => {
            const searchToy = req.params.text;
            const result = await toyCollections.find({
                $or: [
                    { name: { $regex: searchToy, $options: "i" } },
                    { category: { $regex: searchToy, $options: "i" } },
                ],
            }).toArray()
            res.send(result)
        })
        
        app.put('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateToy = req.body
            const updateDoc = {
                $set: {
                    pictureURL: updateToy.pictureURL,
                    name: updateToy.name,
                    sellerName: updateToy.sellerName,
                    sellerEmail: updateToy.sellerEmail,
                    subCategory: updateToy.subCategory,
                    price: updateToy.price,
                    rating: updateToy.rating,
                    quantity: updateToy.quantity,
                    description: updateToy.description,
                },
            };
            const result = await toyCollections.updateOne(filter, updateDoc, options)
            res.send(result);
        })

        app.delete('/allToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toyCollections.deleteOne(query);
            res.send(result)

        })
       
        
        // app.get('/testSellerSort', async (req, res) => {
        //     const sellerEmail = req.query.sellerEmail;
        //     const sort = req.query.sort === "asc" ? 1 : -1;
        //     const query = { sellerEmail: sellerEmail }
        //     const result = await toyCollections.find(query).sort({price: sort}).toArray();
        //     res.send(result);
        // });
        
        
        // app.get('/testsort', async (req, res) => {
        //     const sort = req.query.sort === "asc" ? 1 : -1;
        //     const result = await toyCollections.find().sort({price: sort}).toArray();
        //     res.send(result);
        // });
        
        
        
        
        
        

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