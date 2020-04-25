import { shuffle } from '../utils';

export function applyFixedNodeGrid(nodes, height=600) {
  shuffle(nodes);

  const gridSize = 100;
  const nodesToAlign = nodes.filter(({ type }) => type === 'venue');
  const count = nodesToAlign.length;
  
  for (var i = 0; i < count; i++) {
    const node = nodesToAlign[i];

    const row = Math.floor(i / (height / gridSize)) + 1;
    const col = Math.floor(i % ((height) / gridSize)) + 1;
    
    const fx = row * gridSize;
    const fy = col * gridSize;

    node.fx = fx;
    node.fy = fy;
  }

  fetch('https://raw.githubusercontent.com/eusim/coronavirus-simulation/master/data/country_centroids_az8.json')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(JSON.stringify(data));

    for (i = 0; i < data.features.length; i++){
      if (data.features[i].properties.region_un == 'Europe' &&
        (data.features[i].properties.type == 'Country' || true)) {
        console.log(data.features[i].properties.admin)
      }
    }
  });

  return nodes;
}
