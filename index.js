const Jimp = require("jimp");
const math = require("mathjs");

const l = console.log;

const K = 4,
  max_iters = 20;

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

const filterByIndex = index => val => val == index;

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

function runKMeans(X, initial_centroids, max_iters, plot_progress) {}

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
    // ansMatrix(:,i) = sum((X.-centroids(i,:)).^2,2);
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
    let centroids = initCentroids(X, K);
    l("old centroids", centroids._data);
    let idx = findClosestCentroids(X, centroids, K);
    l("new centroids", computeCentroids(X, idx, K)._data);

    // let mat1 = math.matrix([[1, 2, 3], [5, 6, 7]]);
    // l(
    //   math.evaluate(`max(mat1,1)`, {
    //     mat1
    //   })
    // );
  })
  .catch(err => {
    l(err);
  });
