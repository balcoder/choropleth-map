'use strict';

const test = [1, 2, 3, 4, 5, 6];

const double = test.map(function(num) {
  let multiplier = 5;
  return num * multiplier;
});

document.getElementById('test').style.fontSize = "250%";
