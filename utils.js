const zip = (a, b) => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);


// we assume that elements is already a valid set
// does not return the empty set
function powerset(elements) {
  // []
  // then [], [1]
  // then [2], [1, 2]
  // then [3], [1, 3], [2, 3], [1, 2, 3]
  // total 8
  result = []
  for (const element of elements) {
    for (let i = 0; i < result.length; i++) {
      result.push([...result[i], element])
    }
  }
  return result
}