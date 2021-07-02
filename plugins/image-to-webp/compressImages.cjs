const fs = require("fs");
const globby = require("globby");
const imagemin = require("imagemin-keep-folder");
const optipng = require("imagemin-optipng");
const jpegtran = require("imagemin-jpegtran");

const produceWebP = async (constants) => {
  const files = {};
  const glob = `${constants.PUBLISH_DIR}/**/*.{jpg,jpeg,png}`;
  const paths = await globby(glob);

  paths.map((path) => {
    const stats = fs.statSync(path);

    files[`./${path}`] = {
      initialSize: stats.size,
    };

    return path;
  });

  const compressedFiles = await imagemin([glob], {
    destination: "images/",
    plugins: [optipng(), jpegtran()],
  });

  compressedFiles.map(({ path }) => {
    const stats = fs.statSync(path);
    files[path].difference = files[path].initialSize - stats.size;

    return path;
  });
  const totalSaved = Object.keys(files).reduce((total, filename) => {
    return files[filename].difference + total;
  }, 0);

  console.log("PNGs, JPGs and JPEGs compressed");
  console.log(`Images optimized - ${totalSaved} saved`);
};
module.exports = produceWebP;
