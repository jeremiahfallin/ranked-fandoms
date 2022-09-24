export function generateArray(w: number, h: number, val: number) {
  const arr: number[][] = [];
  for (let i = 0; i < h; i++) {
    arr[i] = [];
    for (let j = 0; j < w; j++) {
      arr![i]![j] = val;
    }
  }
  return arr;
}

export default function bt(
  votes: any,
  length: number,
  initialRanks: number[] = [],
) {
  const initialArray = generateArray(length, length, 0);

  const matrix = votes.reduce((acc: any, curr: any) => {
    const votedForId = parseInt(curr.votedFor.id.split('-').pop()) - 1;
    const votedAgainstId = parseInt(curr.votedAgainst.id.split('-').pop()) - 1;
    acc[votedForId][votedAgainstId] = acc[votedForId][votedAgainstId] + 1;
    return acc;
  }, initialArray);

  let ranks: number[] =
    initialRanks.length > 0 ? initialRanks : [...Array(length)].map((_) => 1);

  for (let i = 0; i < length; i++) {
    const numerator = matrix[i].reduce((acc: any, curr: any) => {
      return acc + curr;
    }, 0);
    let denominator = 0;
    for (let j = 0; j < length; j++) {
      if (typeof ranks[i] !== undefined) {
        const rankI: any = ranks[i];
        const rankJ: any = ranks[j];
        const rankSum = rankI + rankJ;
        denominator += (matrix[i][j] + matrix[j][i]) / rankSum;
      }
    }
    ranks[i] = numerator / denominator || 0;
  }

  const sum = ranks.reduce((acc, curr) => {
    return acc + curr;
  }, 0);

  ranks = ranks
    .map((rank) => {
      return rank / sum;
    })
    .sort((a, b) => {
      return b - a;
    });

  return ranks;
}
