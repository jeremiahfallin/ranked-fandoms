import bt from './bt';

let approx = false;
let selective_eig = false;

function standardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n,
  );
}

function arrayStandardDeviation(array) {
  const sd = standardDeviation(array);
  return array.map((curr) => curr / sd);
}

function arrayMean(array) {
  return array.map((curr) => curr / array.length);
}

function getScores(matches) {
  return bt(matches);
}

function unrollMatrix(matrix) {
  let g = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (i != j) {
        g = [...g, ...Array(matrix[i][j]).fill([i, j, 1])];
      }
    }
  }
  return g;
}

function computeMinimumSpanningTree(infMatrix) {
  const transpose = infMatrix[0].map((_, colIndex) =>
    infMatrix.map((row) => row[colIndex]),
  );
  const sumMatrix = transpose.map((row, i) =>
    row.map((_, j) => row[j] + infMatrix[i][j]),
  );
  let inverseMatrix = sumMatrix.map((row) => row.map((x) => 1 / x));

  // set values less than 0 in inverseMatrix to 0
  for (let i = 0; i < inverseMatrix.length; i++) {
    for (let j = 0; j < inverseMatrix[i].length; j++) {
      if (inverseMatrix[i][j] < 0) {
        inverseMatrix[i][j] = Infinity;
      }
    }
  }

  // const GrMST =
  // const t =

  // const pairsToCompare =

  // const edges =
  // const pairsToCompare =

  // return
}

export default function asap(matrix) {
  // get shape of matrix
  const n = matrix[0].length;
  const g = unrollMatrix(matrix);
  const [infMatrix, pairsToCompare] = computeInformationGainMatrix(n, g);

  return pairsToCompare;
}

const computeProbabilities = () => {
  // Function that returns prob and probCMP
  // prob is the matrix with probability of one condition
  // chosen over another
  // probCMP is the matrix with probability of performing
  // an evaluation of expected information gain for a pair
  // of conditions
  const prob = [];
  const probCMP = [];

  let standardDeviations = arrayStandardDeviation(scores);
  let means = arrayMean(scores);
};

function getMaximum(gainMatrix) {
  // Function to find the pair of conditions, which,
  // compared would attain a maximum in the information gain matrix.
  // The function returns the indices of the pair of conditions
  // and the value of the maximum in the information gain matrix.
  let result = [];

  const max = Math.max(...gainMatrix.flat());

  for (let i = 0; i < gainMatrix.length; i++) {
    for (let j = 0; j < gainMatrix[i].length; j++) {
      if (gainMatrix[i][j] == max) {
        result.push([i, j]);
      }
    }

    return result;
  }
}

const computeMeanAndVariance = (i, j, g) => {
  // Function to compute the mean and variance of the
  // information gain matrix for a pair of conditions.
  // The function returns the mean and variance of the
  // information gain matrix for a pair of conditions.
  const gij = g.filter((x) => x[0] == i && x[1] == j);
  const gji = g.filter((x) => x[0] == j && x[1] == i);
  const gijMean = arrayMean(gij.map((x) => x[2]));
  const gjiMean = arrayMean(gji.map((x) => x[2]));
  const gijVar = arrayStandardDeviation(gij.map((x) => x[2]));
  const gjiVar = arrayStandardDeviation(gji.map((x) => x[2]));
  return [gijMean, gjiMean, gijVar, gjiVar];
};

function computeInformationGainMatrix(n, g) {
  // Given the number of conditions (N) and
  // comparisons performed (G) the function returns the information
  // gain matrix and the pair of conditions maximizing the information gain
  let gainMatrix = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  let scores = getScores();

  let standardDeviations = arrayStandardDeviation(scores);
  let means = arrayMean(scores);

  let kl1, kl2;

  const [prob, probCMPS] = computeProbabilities();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i[n].length; j++) {
      if (probCMPS >= Math.random()) {
        if (approx) {
          let [m, v] = computeMeanAndVariance(i, j, g);
          kl1 = klDivergenceApprox(m, v, means[i], standardDeviations[i]);
        } else {
          let [m, v] = computeMeanAndVariance(i, j, g);
          kl1 = klDivergenceApprox(m, v, means[i], standardDeviations[i]);
        }
        if (approx) {
          let [m, v] = computeMeanAndVariance(j, i, g);
          kl2 = klDivergenceApprox(m, v, means[j], standardDeviations[j]);
        } else {
          let [m, v] = computeMeanAndVariance(j, i, g);
          kl2 = klDivergenceApprox(m, v, means[j], standardDeviations[j]);
        }
        gainMatrix[i][j] = prob[j][i] * kl1 + prob[i][j] * kl2;
      } else {
        gainMatrix[i][j] = -1;
      }
    }
  }

  const pairsToCompare = getMaximum(gainMatrix);

  return [gainMatrix, pairsToCompare];
}

function klDivergenceApprox(mean1, var1, mean2, var2) {
  // Function to compute the Kullback-Leibler divergence between two
  // normal distributions with means mean1 and mean2 and variances
  // var1 and var2, respectively. The function returns the value of
  // the divergence.
  let kl =
    var2.reduce((acc, curr) => acc + Math.log(curr), 0) -
    var1.reduce((acc, curr) => acc + Math.log(curr), 0) +
    var1.reduce((acc, curr, i) => acc + curr / var2[i], 0) +
    var2
      .map((val) => 1 / val)
      .reduce((acc, curr, i) => acc + curr * (mean1[i] - mean2[i]) ** 2, 0);

  return kl;
}
