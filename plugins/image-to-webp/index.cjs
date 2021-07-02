const imageToWebp = require("./imageToWebp.cjs");
const webp = require("./webp.cjs");
const compressImages = require("./compressImages.cjs");

module.exports = {
  onPreBuild: async ({ inputs, utils: { build } }) => {
    try {
      await webp(inputs.imagePath);
      await imageToWebp(inputs.fileLevel);
    } catch (e) {
      build.failBuild("Failed to transform images to webp");
    }
  },
  onPostBuild: async ({ constants, utils: { build } }) => {
    try {
      await compressImages(constants);
    } catch (e) {
      console.log(e);
      build.failBuild("Failed to compress images");
    }
  },
};
