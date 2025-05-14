const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors()); // Enable CORS for frontend use

const PORT = process.env.PORT || 8080;

app.post("/api/imagga", async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image base64 string is required." });
  }

  try {
    const response = await fetch("https://api.imagga.com/v2/models/general-image-recognition/outputs", {
      method: "POST",
      headers: {
        Authorization: process.env.IMAGGA_API_KEY, // replace with actual Imagga key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64,
              },
            },
          },
        ],
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from Imagga", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
