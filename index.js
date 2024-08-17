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
    const categoriesCollection = client
      .db("productsDB")
      .collection("categorization");

    // APIs

    // Get all products
    app.get("/products", async (req, res) => {
      const query = req?.query;
      const page = parseInt(query?.page) || 1;
      const limit = 6;
      const sort = query?.sort;
      const search = query?.search;
      const category = query?.category;
      const totalProducts = await productsCollection.countDocuments();

      //   sorting based on the query
      if (sort === "h2l") {
        const products = await productsCollection
          .find()
          .sort({ price: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        res.send({ products, totalProducts });
        return;
      }
      if (sort === "l2h") {
        const products = await productsCollection
          .find()
          .sort({ price: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        res.send({ products, totalProducts });
        return;
      }
      if (sort === "newest") {
        const products = await productsCollection
          .find()
          .sort({ creationDateTime: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        res.send({ products, totalProducts });
        return;
      }

      //   search based on the query
      if (search) {
        const products = await productsCollection
          .find({ productName: { $regex: search, $options: "i" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        const totalProducts = await productsCollection.countDocuments({
          productName: { $regex: search, $options: "i" },
        });
        res.send({ products, totalProducts });
        return;
      }

      //   pagination based on the query
      const products = await productsCollection
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // category filter
      if (category) {
        const products = await productsCollection
          .find({ category: { $regex: category, $options: "i" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        const totalProducts = await productsCollection.countDocuments({
          category: { $regex: category, $options: "i" },
        });
        res.send({ products, totalProducts });
        return;
      }

      res.send({ products, totalProducts });
    });

    // Get all categories
    app.get("/categories", async (req, res) => {
      const category = req?.query?.category;
      const brands = req?.query?.brands;
      const categorizationArray = await categoriesCollection.find().toArray();

      // cateogry filter
      if (category === "category") {
        const categories = await categorizationArray[0]?.categories;
        res.send(categories);
        return;
      }

      // brand filter
      if (brands === "brands") {
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
