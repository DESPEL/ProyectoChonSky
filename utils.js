const zip = (a, b) => Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);


// we assume that elements is already a valid set
// does not return the empty set

function powerset(elements) {
  elements = powerset_v2(elements)
 return elements.filter(elem=>{return elem.length!=0})
}


function powerset_v2(l) {
  // TODO: ensure l is actually array-like, and return null if not
  return (function ps(list) {
      if (list.length === 0) {
          return [[]];
      }
      var head = list.pop();
      var tailPS = ps(list);
      return tailPS.concat(tailPS.map(function(e) { return [head].concat(e); }));
  })(l.slice());
}