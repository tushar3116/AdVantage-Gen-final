const axios = require("axios");
const FormData = require("form-data");

// Generate an image using Stability AI from a prompt
async function generateImage(prompt) {
  const formData = new FormData();
  formData.append(
    "prompt",
    `Professional product advertisement photo of ${prompt}, studio lighting, high quality, 4k`
  );
  formData.append("output_format", "webp");

  const response = await axios.post(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer",
      validateStatus: () => true, // don't throw on non-2xx
    }
  );

  if (response.status !== 200) {
    const errBody = Buffer.from(response.data).toString("utf-8");
    console.error("Stability AI error:", response.status, errBody);
    throw new Error(`Stability AI failed (${response.status}): ${errBody}`);
  }

  console.log("Stability AI image generated successfully");
  return response.data; //raw image buffer
}

module.exports = generateImage;
