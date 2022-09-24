import * as tf from '@tensorflow/tfjs-node';
import { matrix, pinv } from 'mathjs';

export function runModelingBradleyTerry(alpha) {
  let [m, q] = alpha.shape;
  if (m !== q) return;

  let p = tf.mul(1.0 / m, tf.ones([m]));

  let change = Number.MAX_VALUE;

  let DELTA_THRESHOLD = 1e-8;

  let n = tf.add(alpha, alpha.transpose());
  let pp = tf.add(
    p.as2D(1, m).tile([m, 1]),
    p.as2D(1, m).tile([m, 1]).transpose(),
  );

  while (change > DELTA_THRESHOLD) {
    let pPrev = tf.clone(p);
    n = tf.add(alpha, alpha.transpose());
    pp = tf.add(
      p.as2D(1, m).tile([m, 1]),
      p.as2D(1, m).tile([m, 1]).transpose(),
    );
    p = tf.div(alpha.sum(1), n.div(pp).sum(1));
    p = tf.div(p, p.sum());

    change = tf.norm(tf.sub(p, pPrev)).dataSync()[0];
  }
  p.print();

  n = tf.add(alpha, alpha.transpose());
  pp = tf.add(p.as2D(1, m).tile([m, 1]), p.as2D(1, m).tile([m, 1]).transpose());
  const lbda_ii = tf.sum(
    tf.add(
      tf.div(alpha.mul(-1), tf.square(p.as2D(1, m).tile([m, 1]))),
      tf.div(n, tf.square(pp)),
    ),
    1,
  );

  const lbda_ij = tf.div(n, tf.square(pp));

  const lbda = tf.add(lbda_ij, tf.diag(lbda_ii));

  let cova = tf
    .mul(lbda, -1)
    .concat(tf.ones([1, m]), 0)
    .concat(tf.ones([m, 1]).concat(tf.tensor2d([[0]]), 0), 1);
  let covaMath = matrix(cova.arraySync());
  const covaPinv = pinv(covaMath);
  const covaPinvTensor = tf.tensor2d(covaPinv._data, covaPinv._size);
  const vari = tf.diag(covaPinvTensor.slice([0, 0], [m, m]));
  const stdv = tf.sqrt(vari);

  const scores = tf.log(p);
  const scoresStd = tf.div(stdv, p);

  covaPinvTensor.slice([0, 0], [m, m]);

  return [scores, covaPinvTensor.slice([0, 0], [m, m]), scoresStd];
}

export function EIG_GaussianHermitte_matrix_Hybrid_MST(mu_mtx, sigma_mtx) {
  const epsilon = 1e-9;
  let [m, q] = mu_mtx.shape;

  const mu = tf.reshape(mu_mtx, [1, -1]);
  const sigma = tf.reshape(sigma_mtx, [1, -1]);

  const fs1 = (x) => {
    const a = tf.divNoNan(
      1,
      sigma.mul(tf.sqrt(2)).mul(x).mul(-1).sub(mu).exp(),
    );
    const b = tf.mul(
      -1,
      tf.log(tf.add(1, sigma.mul(x).mul(tf.sqrt(2)).mul(-1).sub(mu).exp())),
    );
    const c = tf.mul(a, b).div(Math.PI);

    return c;
  };
  const fs2 = (x) => {
    const a = tf.sub(
      1,
      tf.divNoNan(1, sigma.mul(tf.sqrt(2)).mul(x).mul(-1).sub(mu).exp().add(1)),
    );
    const b = tf.divNoNan(
      tf.log(tf.exp(sigma.mul(x).mul(tf.sqrt(2).mul(x).mul(-1).sub(mu)))),
      tf.add(1, tf.exp(sigma.mul(x).mul(tf.sqrt(2).mul(-1).sub(mu)))),
    );
    const c = tf.mul(a, b).div(Math.PI);
    return c;
  };
  const fs3 = (x) => {
    const a = tf.divNoNan(
      1,
      tf.add(1, sigma.mul(tf.sqrt(2)).mul(x).mul(-1).sub(mu).exp()),
    );
    const b = tf.divNoNan(a, tf.sqrt(Math.PI));
    return b;
  };
  const fs4 = (x) => {
    const a = tf.sub(
      1,
      tf.divNoNan(
        1,
        tf.add(1, sigma.mul(tf.sqrt(2)).mul(x).mul(-1).sub(mu).exp()),
      ),
    );
    const b = tf.divNoNan(a, tf.sqrt(Math.PI));
    return b;
  };

  let x = [
    -6.86334529, -6.13827922, -5.53314715, -4.98891897, -4.48305536, -4.0039086,
    -3.54444387, -3.09997053, -2.66713212, -2.24339147, -1.82674114, -1.4155278,
    -1.00833827, -0.60392106, -0.20112858, 0.20112858, 0.60392106, 1.00833827,
    1.4155278, 1.82674114, 2.24339147, 2.66713212, 3.09997053, 3.54444387,
    4.0039086, 4.48305536, 4.98891897, 5.53314715, 6.13827922, 6.86334529,
  ];
  let w = [
    2.9082547e-21, 2.8103336e-17, 2.87860708e-14, 8.1061863e-12, 9.17858042e-10,
    5.10852245e-8, 1.57909489e-6, 2.93872523e-5, 3.48310124e-4, 2.73792247e-3,
    1.47038297e-2, 5.51441769e-2, 1.46735848e-1, 2.80130931e-1, 3.8639489e-1,
    3.8639489e-1, 2.80130931e-1, 1.46735848e-1, 5.51441769e-2, 1.47038297e-2,
    2.73792247e-3, 3.48310124e-4, 2.93872523e-5, 1.57909489e-6, 5.10852245e-8,
    9.17858042e-10, 8.1061863e-12, 2.87860708e-14, 2.8103336e-17, 2.9082547e-21,
  ];
  x = tf.reshape(x, [-1, 1]);
  w = tf.reshape(w, [-1, 1]);

  const es1 = tf.sum(tf.mul(w, fs1(x)), 0);
  const es2 = tf.sum(tf.mul(w, fs2(x)), 0);
  let es3 = tf.sum(tf.mul(w, fs3(x)), 0);
  es3 = tf.mul(es3, tf.log(tf.add(es3, epsilon)));
  let es4 = tf.sum(tf.mul(w, fs4(x)), 0);
  es4 = tf.mul(es4, tf.log(tf.add(es4, epsilon)));

  let ret = es1.add(es2).sub(es3).add(es4);
  ret = tf.reshape(ret, [m, m]);
  ret = tf.mul(ret, -1);
  let retMul = [];
  for (let i = 1; i <= m; i++) {
    const zeroes = Array(i).fill(0);
    const ones = Array(m - i).fill(1);
    retMul.push([...zeroes, ...ones]);
  }
  ret = tf.mul(ret, retMul);

  return tf.add(ret, tf.transpose(ret));
}

export function activeLearningPairMatrixHybridMST(mu, muCova) {
  const pvsNum = mu.shape[0];

  let eig = tf.zeros([pvsNum, pvsNum]);

  const mu1 = mu.as2D(1, mu.shape[0]).tile([pvsNum, 1]);

  // create diagonal array from muCova
  let sigma = [];
  const muCovaData = muCova.arraySync();
  for (let i = 0; i < muCovaData.length; i++) {
    sigma.push(muCovaData[i][i]);
  }
  sigma = sigma.map((val, _, arr) => {
    return arr;
  });
  const sigma1 = tf.tensor2d(sigma);

  const muDiff = tf.sub(tf.transpose(mu1), mu1);
  const sigmaDiff = tf
    .sub(tf.add(tf.transpose(sigma1), sigma1), tf.mul(2, muCova))
    .abs()
    .sqrt();

  eig = EIG_GaussianHermitte_matrix_Hybrid_MST(muDiff, sigmaDiff);

  return eig;
}

export function initialLearning(pcm) {
  const pvsNum = pcm.shape[0];
  pcm = tf.ones([pvsNum, pvsNum]);
  // loop over tensor and set diagonal to 0
  for (let i = 0; i < pvsNum; i++) {
    pcm.set(i, i, 0);
  }
  return pcm;
}

function isValidEdge(u, v, inMST) {
  if (u == v) return false;
  if (inMST[u] == false && inMST[v] == false) return false;
  else if (inMST[u] == true && inMST[v] == true) return false;
  return true;
}

function minimumSpanningTree(adjacencyMatrix) {
  let V = adjacencyMatrix.length;
  let let_MAX = Number.MAX_VALUE;
  let inMST = Array(V).fill(false);
  let ret = Array(V)
    .fill()
    .map((_) => Array(V).fill(0));

  // Include first vertex in MST
  inMST[0] = true;

  // Keep adding edges while number of included
  // edges does not become V-1.
  let edge_count = 0,
    mincost = 0;
  while (edge_count < V - 1) {
    // Find minimum weight valid edge.
    let min = let_MAX,
      a = -1,
      b = -1;
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (adjacencyMatrix[i][j] < min) {
          if (isValidEdge(i, j, inMST)) {
            min = adjacencyMatrix[i][j];
            a = i;
            b = j;
          }
        }
      }
    }

    if (a !== -1 && b !== -1) {
      mincost = mincost + min;
      inMST[b] = inMST[a] = true;
      edge_count++;
      ret[a][b] = min;
    }
  }

  return ret;
}

export function generatePlaylistHybridMST(prePCM) {
  if (tf.sum(prePCM) === 0) {
    prePCM = initialLearning(prePCM);
  }
  const [mu, muCova, stdv] = runModelingBradleyTerry(prePCM);

  const eigMatrix = activeLearningPairMatrixHybridMST(mu, muCova);

  let retMul = [];
  for (let i = 1; i <= eigMatrix.shape[0]; i++) {
    const zeroes = Array(i).fill(0);
    const ones = Array(eigMatrix.shape[0] - i).fill(1);
    retMul.push([...zeroes, ...ones]);
  }

  const tcsr = minimumSpanningTree(
    tf.mul(tf.mul(eigMatrix, retMul), -1).arraySync(),
  );
  const tcsrTmp = tf.tensor2d(tcsr);
  const results = tf.less(tcsrTmp, 0);
  const pairMST = tf.transpose(results).arraySync();

  return pairMST;
}

export default function hybrid(data) {
  let pcm = tf.tensor2d(data);

  const playlist = generatePlaylistHybridMST(pcm);

  let results = [];
  for (let i = 0; i < playlist.length; i++) {
    for (let j = 0; j < playlist[i].length; j++) {
      if (playlist[i][j] === 1) {
        results.push([i, j]);
      }
    }
  }

  return results;
}
