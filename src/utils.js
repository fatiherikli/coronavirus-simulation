import { COLORS as colors } from './constants';
import React, { useState, useEffect, useRef } from 'react';

import {
  SUSCEPTIBLE, SICK, RECOVERED, DEAD,
} from './constants';

export function useInterval(callback, delay) {
  // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  // danke, dan
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function getRandom(length) { return Math.floor(Math.random() * length); }

export function randomSample(array, size) {
  // https://stackoverflow.com/a/37835673
  var r, i = array.length, end = i - size, temp, swaps = randomSample.swaps;

  while (i-- > end) {
      r = getRandom(i + 1);
      temp = array[r];
      array[r] = array[i];
      array[i] = temp;
      swaps.push(i);
      swaps.push(r);
  }

  var sample = array.slice(end);

  while(size--) {
      i = swaps.pop();
      r = swaps.pop();
      temp = array[i];
      array[i] = array[r];
      array[r] = temp;
  }

  return sample;
}
randomSample.swaps = [];

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffle(array) {
  // https://stackoverflow.com/a/2450976
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function weightedRandom(spec) {
  const random = Math.random();
  let sum = .0; 

  for (var i in spec) {
    const [prob, value] = spec[i];
    sum += prob;
    if (random <= sum) {
      return value;
    };
  }
};

export function rangeBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function shade(value) {
  let sum = 0;

  for (var i in colors) {
    const color = colors[i];
    if (value <= sum) {
      return color;
    };

    sum += 1 / colors.length;
  }

  return colors[colors.length - 1];
}

export function padding(value, max, padded) {
  return Math.min(Math.max(padded, value), max - 50);
}

export function distance(source, target) {
    return Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2))
}
