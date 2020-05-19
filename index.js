const Jimp = require("jimp");
const math = require("mathjs");

const l = console.log;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getPixelColors(image) {
  let width = image.bitmap.width;
  let height = image.bitmap.height;
  let count = 0;
  let ans = [[]];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let rgbObj = Jimp.intToRGBA(image.getPixelColor(i, j));
      ans[count] = [rgbObj.r / 255, rgbObj.g / 255, rgbObj.b / 255];
      count++;
    }
  }
  return math.matrix(ans);
}

Jimp.read("insta.png")
  .then(image => {
    let X = getPixelColors(image);
    let count = 0;
    X.forEach(function(value, index, matrix) {
      if (count <= 20) console.log("value:", value, "index:", index);
      count++;
    });
  })
  .catch(err => {
    l(err);
  });
