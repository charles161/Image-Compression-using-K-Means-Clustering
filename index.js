const Jimp = require("jimp");
const math = require("mathjs");

const l = console.log;

let K = 5;
let max_iters = 10;
let imagePath = "insta.png";
let compressedImagePath = "compressed_insta.png";

process.argv.forEach(argument => {
  if (argument.includes("--K=")) {
    K = Number(argument.split("=")[1]) || K;
  } else if (argument.includes("--max_iter=")) {
    max_iters = Number(argument.split("=")[1]) || max_iters;
  } else if (argument.includes("--imagePath=")) {
    imagePath = argument.split("=")[1] || imagePath;
  } else if (argument.includes("--comImagePath=")) {
    compressedImagePath = argument.split("=")[1] || compressedImagePath;
  }
});

const filterByIndex = index => val => val == index;

function createCompressedImage(X, image, path) {
  let width = image.bitmap.width;
  let height = image.bitmap.height;
  let count = 0;
  for (let i = 0; i < width; i++)
    for (let j = 0; j < height; j++) {
      let rgbObj = Jimp.intToRGBA(image.getPixelColor(i, j));
      const hex = Jimp.rgbaToInt(X[count][0] * 255, X[count][1] * 255, X[count][2] * 255, rgbObj.a);
      image.setPixelColor(hex, i, j);
      count++;
    }
  image.write(path);
}

function mapPixelsToCentroids(X, centroids, idx) {
  let XData = X._data;
  let centroidsData = centroids._data;
  let idxData = idx._data;
  for (let index = 0; index < idxData.length; index++) {
    XData[index] = centroidsData[idxData[index] - 1];
  }
  return XData;
}

function addRows(row, matrix, index) {
  for (let i = 0; i < row.length; i++) {
    matrix[index][i] = matrix[index][i] + row[i];
  }
  return math.matrix(matrix);
}

function factorize(matrix, index, factor) {
  for (let i = 0; i < matrix[index].length; i++) {
    matrix[index][i] = matrix[index][i] * factor;
  }
  return math.matrix(matrix);
}

function computeCentroids(X, idxMatrix, K) {
  let centroids = math.zeros(K, 3);
  const idx = idxMatrix._data;
  for (let i = 0; i < idx.length; i++) {
    centroids = addRows(X._data[i], centroids._data, idx[i] - 1);
  }
  for (let i = 0; i < K; i++) {
    let factor = 1 / idx.filter(filterByIndex(i + 1)).length;
    centroids = factorize(centroids._data, i, factor);
  }
  return centroids;
}

function getColumnIndex(values, realMatrix) {
  let indexes = [];
  for (let i = 0; i < values.length; i++) {
    indexes[i] = realMatrix[i].indexOf(values[i]) + 1;
  }
  return indexes;
}

function findClosestCentroids(X, centroids, K) {
  let m = math.size(X)._data[0];
  let idx = math.zeros(m, 1);
  let values = math.zeros(m, 1);
  let ansMatrix = math.zeros(m, K);
  for (let i = 1; i <= K; i++) {
    let rowCentroid = math.evaluate(`centroids[i,:]`, {
      centroids,
      i
    });
    let mat1 = math.transpose(rowCentroid);
    let mat2 = math.ones(1, m);
    let duplicateCentroid = math.transpose(math.multiply(mat1, mat2));
    math.evaluate(`ansMatrix[:,i] = sum((X-duplicateCentroid).^2,2);`, {
      ansMatrix,
      i,
      X,
      duplicateCentroid
    });
  }
  values = math.evaluate(`min(ansMatrix,2)`, {
    ansMatrix
  });
  idx = math.matrix(getColumnIndex(values._data, ansMatrix._data));
  return idx;
}

function runkMeans(X, initial_centroids, max_iters, K) {
  let m = math.size(X)._data[0];
  let idx = math.zeros(m, 1);
  let centroids = math.zeros(K, 3);
  let previous_centroids = math.zeros(K, 3);
  centroids = initial_centroids;
  previous_centroids = initial_centroids;
  for (let iteration = 0; iteration < max_iters; iteration++) {
    idx = findClosestCentroids(X, centroids, K);
    centroids = computeCentroids(X, idx, K);
  }
  return [centroids, idx];
}

function initCentroids(X, K) {
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function init() {
  Jimp.read(imagePath)
    .then(image => {
      let X = getPixelColors(image);
      let initial_centroids = initCentroids(X, K);
      let [centroids, idx] = runkMeans(X, initial_centroids, max_iters, K);
      idx = findClosestCentroids(X, centroids, K);
      newX = mapPixelsToCentroids(X, centroids, idx);
      createCompressedImage(newX, image, compressedImagePath);
    })
    .catch(err => {
      l(err);
    });
}

init();
