const puppeteer = require("puppeteer");
const fs = require("fs");

const transformImages = async (filePath) => {
  const isHtmlRegex = RegExp(/[^/].+\.html$/);
  const browser = await puppeteer.launch();
  const fileNames = fs.readdirSync(filePath);
  const htmlFiles = fileNames.filter((file) => isHtmlRegex.test(file));

  try {
    await Promise.all(
      htmlFiles.map(async (file) => {
        console.log("Transforming ", file);
        const page = await browser.newPage();
        await page.goto(`file://${filePath}/${file}`);

        await page.waitForSelector("img");
        await page.evaluate(() => {
          const images = document.getElementsByTagName("img");
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageSrcSet = image.src;
            const isSvgRegex = RegExp(/(.svg)$/g);
            const fileRegex = RegExp(/[^\\\/]*\.(\w+)$/);

            if (!isSvgRegex.test(imageSrcSet)) {
              const imageId = image.id;
              // Get file extenstion
              const fileType = imageSrcSet.match(/([^.]*$|$)/i)[0];
              let type = "image/" + fileType;

              const fileName = image.src.match(fileRegex)[0];
              // Get file classes
              const imageClasses = image.className;
              const webpSrcSet = fileName.replace(
                /(.png|.jpeg|.jpg)$/g,
                ".webp"
              );

              // Create create picture element
              const pictureContainer = document.createElement("picture");
              const webpSource = document.createElement("source");
              const imageSource = document.createElement("source");
              webpSource.lazy = true;
              webpSource.alt = image.alt;
              webpSource.className = imageClasses;
              webpSource.id = imageId;
              webpSource.type = "image/webp";
              webpSource.srcset = "images/webp/" + webpSrcSet;

              imageSource.lazy = true;
              imageSource.alt = image.alt;
              imageSource.className = imageClasses;
              imageSource.id = imageId;
              imageSource.type = type;
              imageSource.srcset = "images/" + fileName;

              pictureContainer.className = imageClasses;
              pictureContainer.id = imageId;
              pictureContainer.innerHTML =
                webpSource.outerHTML + imageSource.outerHTML + image.outerHTML;
              if (image.parentElement.nodeName.toLowerCase() !== "picture") {
                image.parentElement.replaceChild(pictureContainer, image);
              }
            }
          }
          return;
        });

        const html = await page.content();
        fs.writeFileSync(`${filePath}/${file}`, html);
        console.log("- Transformed ", file);
      })
    );
  } catch (e) {
    console.log(e);
    await browser.close();
  }
  await browser.close();
};

module.exports = transformImages;
