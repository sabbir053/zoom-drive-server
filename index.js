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

    const bookingsCollection = db.collection("bookings");

    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingsCollection.insertOne(bookingData);
      res.status(201).send(result);
    });
    

    app.get("/my-bookings", async (req, res) => {
      const cursor = bookingsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get("/cars/:carsId", async (req, res) => {
      const { carsId } = req.params;
      const query = { _id: new ObjectId(carsId) }
      const result = await carsCollection.findOne(query);
      res.send(result)
    })


    app.get("/availablecars", async (req, res) => {
      const cursor = carsCollection.find().limit(4);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post("/cars", async (req, res) => {
      try {
        const newCar = req.body;

        const carPayload = {
          ...newCar,
          availabilityStatus: "Available",
          createdAt: new Date(),
        };

        const result = await carsCollection.insertOne(carPayload);

        res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        console.error("Error saving car:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {
    // No need as a beginning to end with a single connection to MongoDB.
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
