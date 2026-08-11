const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// MONGODB
// ==========================================

const client = new MongoClient(process.env.MONGO_URI);

let db;

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "HH Goa ID Card Generator API is running!",
  });
});

// ==========================================
// SAVE CARD
// ==========================================

app.post("/api/cards", async (req, res) => {
  try {
    const {
      name,
      selectedStacks,
      xHandle,
      builderClass,
      imageUrl,
    } = req.body;

    const card = {
      name,
      selectedStacks,
      xHandle,
      builderClass,
      imageUrl,
      createdAt: new Date(),
    };

    const result = await db
      .collection("cards")
      .insertOne(card);

    res.status(201).json({
      message: "Card saved successfully!",
      cardId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving card:", error);

    res.status(500).json({
      message: "Failed to save card",
    });
  }
});

// ==========================================
// CREATE SHARE LINK
// ==========================================

app.post("/api/share", async (req, res) => {
  try {
    const { imageURL } = req.body;

    if (!imageURL) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    // Generate unique share ID
    const shareId = crypto.randomUUID();

    // Save share information in MongoDB
    await db.collection("shares").insertOne({
      shareId,
      imageURL,
      createdAt: new Date(),
    });

    // Use deployed backend URL
    const backendURL =
      process.env.BACKEND_URL ||
      "https://id-generator-sfys.onrender.com";

    const shareURL =
      `${backendURL}/share/${shareId}`;

    res.json({
      shareId,
      shareURL,
    });
  } catch (error) {
    console.error(
      "Error creating share link:",
      error
    );

    res.status(500).json({
      message: "Could not create share link",
    });
  }
});

// ==========================================
// SHARE PAGE
// ==========================================

app.get("/share/:id", async (req, res) => {
  try {
    const shareId = req.params.id;

    const share = await db
      .collection("shares")
      .findOne({ shareId });

    if (!share) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Card not found</title>
          </head>
          <body>
            <h1>Card not found</h1>
            <p>This card link is invalid or expired.</p>
          </body>
        </html>
      `);
    }

    const imageURL = share.imageURL;

    // Deployed backend URL
    const backendURL =
      process.env.BACKEND_URL ||
      "https://id-generator-sfys.onrender.com";

    const shareURL =
      `${backendURL}/share/${shareId}`;

    // ==========================================
    // HTML PAGE WITH SOCIAL PREVIEW METADATA
    // ==========================================

    res.set("Cache-Control", "no-store");

    res.send(`
      <!DOCTYPE html>

      <html lang="en">

      <head>

        <meta charset="UTF-8" />

        <title>HH Goa 2026 ID Card</title>

        <meta
          name="description"
          content="Check out my HH Goa 2026 ID card!"
        />

        <!-- ================================
             OPEN GRAPH
        ================================= -->

        <meta
          property="og:title"
          content="HH Goa 2026 ID Card"
        />

        <meta
          property="og:description"
          content="Check out my HH Goa 2026 ID card! 🚀 #FrameInGoa"
        />

        <meta
          property="og:image"
          content="${imageURL}"
        />

        <meta
          property="og:image:secure_url"
          content="${imageURL}"
        />

        <meta
          property="og:image:type"
          content="image/png"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:url"
          content="${shareURL}"
        />

        <!-- ================================
             TWITTER / X
        ================================= -->

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="HH Goa 2026 ID Card"
        />

        <meta
          name="twitter:description"
          content="Check out my HH Goa 2026 ID card! 🚀 #FrameInGoa"
        />

        <meta
          name="twitter:image"
          content="${imageURL}"
        />

        <meta
          name="twitter:image:alt"
          content="HH Goa 2026 ID Card"
        />

      </head>

      <body>

        <h1>HH Goa 2026 ID Card</h1>

        <img
          src="${imageURL}"
          alt="HH Goa 2026 ID Card"
          style="max-width: 90%; height: auto;"
        />

      </body>

      </html>
    `);

  } catch (error) {
    console.error(
      "Error loading share page:",
      error
    );

    res.status(500).send(
      "Could not load shared card."
    );
  }
});

// ==========================================
// START SERVER + CONNECT TO MONGODB
// ==========================================

async function startServer() {
  try {
    await client.connect();

    db = client.db("hh_id_generator");

    console.log(
      "MongoDB connected successfully!"
    );

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error);
  }
}

startServer();