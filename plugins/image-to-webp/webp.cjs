const webp = require("imagemin-webp");
const imagemin = require("imagemin");

const produceWebP = async (imagePath) => {
  await imagemin(["images/*.png"], {
    destination: imagePath,
    plugins: [
      webp({
        lossless: true,
      }),
    ],
  });
  console.log("PNGs processed");
  await imagemin(["images/*.{jpg,jpeg}"], {
    destination: imagePath,
    plugins: [
      webp({
        quality: 65,
      }),
    ],
  });
  console.log("JPGs and JPEGs processed");
};
module.exports = produceWebP;
