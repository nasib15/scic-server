const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
// Connection URI

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.talr0yk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Collections
    const productsCollection = client.db("productsDB").collection("products");

    // APIs

    // Get all products
    app.get("/products", async (req, res) => {
      const query = req?.query;
      const page = parseInt(query?.page) || 1;
      const limit = parseInt(query?.limit) || 6;
      const sort = query?.sort;
      const search = query?.search;
      const totalProducts = await productsCollection.countDocuments();

      //   sorting based on the query
      if (sort === "h2l") {
        const products = await productsCollection
          .find()
          .sort({ price: -1 })
          .toArray();
        res.send(products);
        return;
      }
      if (sort === "l2h") {
        const products = await productsCollection
          .find()
          .sort({ price: 1 })
          .toArray();
        res.send(products);
        return;
      }
      if (sort === "newest") {
        const products = await productsCollection
          .find()
          .sort({ creationDateTime: -1 })
          .toArray();
        res.send(products);
        return;
      }

      //   search based on the query
      if (search) {
        const products = await productsCollection
          .find({ productName: { $regex: search, $options: "i" } })
          .toArray();
        res.send(products);
        return;
      }

      //   pagination based on the query
      const products = await productsCollection
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      res.send({ products, totalProducts });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
