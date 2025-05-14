const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors());

const PORT = process.env.PORT || 8080;

// Base64-encoded "apiKey:apiSecret"
const IMAGGA_AUTH_HEADER = "e95afaca24b913b424c45f353d3a7dee"; // Replace this with the real one

app.post("/api/imagga", async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image base64 string is required." });
  }

  try {
    // STEP 1: Upload the image
    const uploadRes = await fetch("https://api.imagga.com/v2/uploads", {
      method: "POST",
      headers: {
        Authorization: IMAGGA_AUTH_HEADER,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image_base64: imageBase64,
      }),
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.result || !uploadData.result.upload_id) {
      return res.status(500).json({ error: "Upload failed", details: uploadData });
    }

    const uploadId = uploadData.result.upload_id;

    // STEP 2: Get tags using the upload ID
    const tagsRes = await fetch(`https://api.imagga.com/v2/tags?image_upload_id=${uploadId}`, {
      method: "GET",
      headers: {
        Authorization: IMAGGA_AUTH_HEADER,
      },
    });

    const tagsData = await tagsRes.json();

    res.status(200).json(tagsData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Imagga", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
