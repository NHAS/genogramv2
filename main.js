import './style.css'
import Graph from 'graphology';
import { PixiGraph, TextType } from './pixi-graph';
import FontFaceObserver from 'fontfaceobserver';


// d3.schemeCategory10
const colors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

window.addEventListener('DOMContentLoaded', async () => {
  const graph = new Graph();
  const { nodes, links } = await (await fetch('miserables.json')).json();
  // const { nodes, links } = await (await fetch('socfb-Caltech36.json')).json();
  nodes.forEach(node => {
    graph.addNode(node.id, node);
  });
  links.forEach(link => {
    graph.addEdge(link.source, link.target, link);
  });

  // layout
  graph.forEachNode(node => {
    graph.setNodeAttribute(node, 'x', Math.random());
    graph.setNodeAttribute(node, 'y', Math.random());
  });
  // forceAtlas2.assign(graph, { iterations: 300, settings: { ...forceAtlas2.inferSettings(graph), scalingRatio: 80 }});
  const positions = await (await fetch('miserables-positions.json')).json();
  graph.forEachNode(node => {
    const position = positions[node];
    graph.setNodeAttribute(node, 'x', position.x);
    graph.setNodeAttribute(node, 'y', position.y);
  });

  const style = {
    node: {
      size: 15,
      color: node => colors[(node.group || 0) % colors.length],
      border: {
        width: 2,
        color: '#9F73AB',
      },
      icon: {
        content: 'person',
        fontFamily: 'Material Icons',
        fontSize: 20,
        color: '#ffffff',
      },
      label: {
        content: node => node.id,
        type: TextType.BITMAP_TEXT,
        fontFamily: 'HelveticaRegular',
        fontSize: 12,
        color: '#333333',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 4,
      },
    },
    edge: {
      width: link => Math.log((link.value || 0) + 1) + 1,
      color: '#00000',
    },
  };
  const hoverStyle = {
    node: {
      border: {
        color: '#A3C7D6',
      },
      label: {
        backgroundColor: 'rgba(238, 238, 238, 1)',
      },
    },
    edge: {
      color: '#999999',
    },
  };

  const resources = [
    { name: 'HelveticaRegular', url: 'https://gist.githubusercontent.com/zakjan/b61c0a26d297edf0c09a066712680f37/raw/8cdda3c21ba3668c3dd022efac6d7f740c9f1e18/HelveticaRegular.fnt' },
  ];
  await new FontFaceObserver('Material Icons').load();


  document.addEventListener('contextmenu', function (evt) {
    evt.preventDefault();
    return false;
  }, false);

  const pixiGraph = new PixiGraph({
    container: document.getElementById('graph'),
    graph,
    style,
    hoverStyle,
    resources,
  });


  pixiGraph.on('nodeClick', (event, nodeKey) => {
    if (event.button == 2) {
      document.getElementById("nodeMenu").hidden = !document.getElementById("nodeMenu").hidden;
      document.getElementById("nodeMenu").style.top = mouseY(event) + 'px';
      document.getElementById("nodeMenu").style.left = mouseX(event) + 'px';

      console.log('nodeClick', event, nodeKey)
    }

  });
  // pixiGraph.on('nodeMousemove', (event, nodeKey) => console.log('nodeMousemove', event, nodeKey));
  // pixiGraph.on('nodeMouseover', (event, nodeKey) => console.log('nodeMouseover', event, nodeKey));
  // pixiGraph.on('nodeMouseout', (event, nodeKey) => console.log('nodeMouseout', event, nodeKey));
  // pixiGraph.on('nodeMousedown', (event, nodeKey) => console.log('nodeMousedown', event, nodeKey));
  pixiGraph.on('nodeMouseup', (event, nodeKey) => console.log('nodeMouseup', event, nodeKey));
  // pixiGraph.on('nodeRightMousedown', (event, nodeKey) => console.log('nodeRightMousedown', event, nodeKey));
  // pixiGraph.on('nodeRightMouseup', (event, nodeKey) => console.log('nodeRightMouseup', event, nodeKey));
  pixiGraph.on('edgeClick', (event, edgeKey) => console.log('edgeClick', event, edgeKey));
  // pixiGraph.on('edgeMousemove', (event, edgeKey) => console.log('edgeMousemove', event, edgeKey));
  // pixiGraph.on('edgeMouseover', (event, edgeKey) => console.log('edgeMouseover', event, edgeKey));
  // pixiGraph.on('edgeMouseout', (event, edgeKey) => console.log('edgeMouseout', event, edgeKey));
  // pixiGraph.on('edgeMousedown', (event, edgeKey) => console.log('edgeMousedown', event, edgeKey));
  pixiGraph.on('edgeMouseup', (event, edgeKey) => console.log('edgeMouseup', event, edgeKey));

  pixiGraph.viewport.on("mouseup", function (e) {
    document.getElementById("nodeMenu").hidden = true;
    document.getElementById("backgroundMenu").hidden = true;
  })

  pixiGraph.viewport.on("rightup", function (e) {
    document.getElementById("backgroundMenu").hidden = !document.getElementById("backgroundMenu").hidden;
    document.getElementById("backgroundMenu").style.top = mouseY(e.data.originalEvent) + 'px';
    document.getElementById("backgroundMenu").style.left = mouseX(e.data.originalEvent) + 'px';
  })


  const addNode = (eventPosition) => {
    for (let i = 0; i < 1000; i++) {
      const id = Math.floor(Math.random() * 10e12).toString(36);

      const worldPosition = pixiGraph.viewport.toWorld(eventPosition);

      const x = worldPosition.x;
      const y = worldPosition.y;
      const node = { id, x, y };

      graph.addNode(node.id, node);
    }
    document.getElementById("backgroundMenu").hidden = true;
  };
  document.getElementById('create-person').addEventListener('click', addNode);


  const clear = () => {
    graph.clear();
  };
  document.getElementById('clear').addEventListener('click', clear);

  const resetView = () => {
    pixiGraph.resetView();
  };
  document.getElementById('reset-view').addEventListener('click', resetView);

  let serializedGraph;
  const exportGraph = () => {
    serializedGraph = graph.export();
    console.log(serializedGraph);
  };
  document.getElementById('export').addEventListener('click', exportGraph);

  const importGraph = () => {
    graph.import(serializedGraph);
  };
  document.getElementById('import').addEventListener('click', importGraph);
});

function mouseX(evt) {
  if (evt.pageX) {
    return evt.pageX;
  } else if (evt.clientX) {
    return evt.clientX + (document.documentElement.scrollLeft ?
      document.documentElement.scrollLeft :
      document.body.scrollLeft);
  } else {
    return null;
  }
}

function mouseY(evt) {
  if (evt.pageY) {
    return evt.pageY;
  } else if (evt.clientY) {
    return evt.clientY + (document.documentElement.scrollTop ?
      document.documentElement.scrollTop :
      document.body.scrollTop);
  } else {
    return null;
  }
}