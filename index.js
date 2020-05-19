const Jimp = require("jimp");

const l = console.log;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

Jimp.read("insta.png")
  .then(image => {
    let width = image.bitmap.width;
    let height = image.bitmap.height;
    for (let i = 0; i < width; i++)
      for (let j = 0; j < height; j++) {
        let rgbObj = Jimp.intToRGBA(image.getPixelColor(i, j));
        const hex = Jimp.rgbaToInt(getRandomInt(145, 150), getRandomInt(145, 150), getRandomInt(145, 150), rgbObj.a);
        image.setPixelColor(hex, i, j);
      }
    image.write("insta.png");
  })
  .catch(err => {
    l(err);
  });
