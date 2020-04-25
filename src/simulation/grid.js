import { shuffle } from '../utils';

export function applyFixedNodeGrid(nodes, height = 600) {
  shuffle(nodes);

  const gridSize = 100;
  const nodesToAlign = nodes.filter(({ type }) => type === 'venue');
  const count = nodesToAlign.length;

  fetch('https://raw.githubusercontent.com/eusim/coronavirus-simulation/master/data/country_centroids_az8.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(JSON.stringify(data));

      var venue = 0;
      for (var i = 0; (i < data.features.length && venue < count); i++) {
        if (data.features[i].properties.region_un === 'Europe'
          && (data.features[i].properties.type === 'Country'
          || data.features[i].properties.type === 'Sovereign country')
          && data.features[i].properties.admin !== 'Russia') {
          const node = nodesToAlign[venue];

          node.fx = data.features[i].geometry.coordinates[0] * 14 + 300;
          node.fy = - data.features[i].geometry.coordinates[1] * 14 + 1100;

          // TODO: Kosovo, we feel your pain
          if (data.features[i].properties.iso_a2 == -99) {
            data.features[i].properties.iso_a2 = "XK";
          }
          node.venue = data.features[i].properties.iso_a2;

          venue++;
        }
      }
    });

  return nodes;
}
