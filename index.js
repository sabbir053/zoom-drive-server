const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv')
const cors = require('cors')
const port = process.env.PORT || 5000

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async () => {
  try {
    await client.connect();
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("zoom-drive-db");
    const carsCollection = db.collection("cars")

    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get("/cars/:carsId", async (req, res) => {
      const {carsId} = req.params;
      const query = { _id: new ObjectId(carsId) }
      const result = await carsCollection.findOne(query);
      res.send(result)
    })





    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {
    // await client.close();
  }
};
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
