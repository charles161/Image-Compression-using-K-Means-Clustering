# Image compression using K-means clustering in Node JS and Visualisation using React JS

This project helps you to understand **k-means clustering algorithm** (an unsupervised learning algorithm) by implementing it using Javascript and visualising its working using React JS.

## Installation Prerequisites

-   [Node JS](https://nodejs.org/en/download/)
-   [Gatsby JS](https://www.gatsbyjs.org/docs/quick-start/)

## Flags

1. **K** - Number of Colors (or) Number of Clusters. Defaults to **5**.
2. **max_iter** - Number of Iterations for the algorithm to run. Defaults to **10**.
3. **imagePath** - Path of the Image to be Compressed. Defaults to **./insta.png**.
4. **comImagePath** - Path of the compressed image to be saved. Defaults to **./compressed_insta.png**.

## Running the Node JS Script

```sh
git clone https://github.com/charles161/Image-Compression-using-K-Means-Clustering.git k-means
cd k-means
npm i
node index.js --K=5 --max_iter=10 --imagePath=./insta.png --comImagePath=./compressed_insta.png
```

## Running the React JS Application

**In Development**
