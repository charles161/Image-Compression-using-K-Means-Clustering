const Jimp = require("jimp");
const math = require("mathjs");

const l = console.log;

const K = 4,
  max_iters = 20;

function kMeansInitCentroids(X, K) {
  const centroids = math.zeros(K, 3);
  for (let i = 1; i <= K; i++) {
    let dimensionsX = math.size(X)._data;
    let randomIndex = getRandomInt(1, dimensionsX[0]);
    let randomCentroid = math.evaluate(`X[randomIndex,:]`, {
      X,
      randomIndex
    });
    math.evaluate(`centroids[i, :] = randomCentroid`, {
      centroids,
      randomCentroid,
      i
    });
  }
  return centroids;
}

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
    l(kMeansInitCentroids(X, K));
  })
  .catch(err => {
    l(err);
  });
