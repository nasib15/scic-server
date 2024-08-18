const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://shop-ease-ae8b6.web.app",
  ],
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
    const categoriesCollection = client
      .db("productsDB")
      .collection("categorization");

    // APIs

    // Get all products
    app.get("/products", async (req, res) => {
      const sort = req?.query?.sort;
      const search = req?.query?.search;
      const category = req?.query?.category;
      const brand = req?.query?.brand;
      const price = parseInt(req?.query?.price);

      // pagination options
      const page = parseInt(req?.query?.page) || 1;
      const limit = 6;

      // sort options
      let options = {};

      if (sort === "h2l") {
        options = { sort: { price: -1 } };
      }

      if (sort === "l2h") {
        options = { sort: { price: 1 } };
      }

      if (sort === "newest") {
        options = { sort: { creationDateTime: -1 } };
      }

      // query options
      let query = {};

      if (search) {
        query.productName = { $regex: search, $options: "i" };
      }

      if (category) {
        query.category = { $regex: category, $options: "i" };
      }

      if (brand) {
        query.productName = { $regex: brand, $options: "i" };
      }

      if (price) {
        query.price = { $lte: price };
      }

      //   pagination based on the query
      const products = await productsCollection
        .find(query, options)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const totalProducts = await productsCollection.countDocuments(query);

      res.send({ products, totalProducts });
    });

    // Get all categories
    app.get("/categories", async (req, res) => {
      const category = req?.query?.category;
      const brand = req?.query?.brand;
      const categorizationArray = await categoriesCollection.find().toArray();

      // cateogry filter
      if (category === "category") {
        const categories = await categorizationArray[0]?.categories;
        res.send(categories);
        return;
      }

      // brand filter
      if (brand === "brand") {
        const brands = await categorizationArray[0]?.brands;
        res.send(brands);
        return;
      }
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
