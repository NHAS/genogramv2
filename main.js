import './style.css'
import Graph from 'graphology';
import { PixiGraph } from './pixi-graph';



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
        fontFamily: 'HelveticaRegular',
        fontSize: 20,
        color: '#ffffff',
      },
      label: {
        content: node => node.id,
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
    { name: 'HelveticaRegular', url: 'HelveticaRegular.fnt' },
  ];

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


  let clickedNode = null;
  pixiGraph.on('nodeClick', (event, nodeKey) => {
    if (event.button == 2) {
      document.getElementById("nodeMenu").hidden = !document.getElementById("nodeMenu").hidden;
      document.getElementById("nodeMenu").style.top = mouseY(event) + 'px';
      document.getElementById("nodeMenu").style.left = mouseX(event) + 'px';
      clickedNode = nodeKey;

      console.log('nodeClick', event, nodeKey)
    }

  });
  document.getElementById('add-link').addEventListener('click', linkNode(pixiGraph, clickedNode));



  pixiGraph.on('edgeClick', (event, nodeKey) => {
    if (event.button == 2) {
      document.getElementById("linkMenu").hidden = !document.getElementById("linkMenu").hidden;
      document.getElementById("linkMenu").style.top = mouseY(event) + 'px';
      document.getElementById("linkMenu").style.left = mouseX(event) + 'px';

      console.log('edgeClick', event, nodeKey)
    }

  });

  pixiGraph.viewport.on("mouseup", function (e) {
    document.getElementById("nodeMenu").hidden = true;
    document.getElementById("backgroundMenu").hidden = true;
    document.getElementById("linkMenu").hidden = true;
  })

  pixiGraph.viewport.on("rightup", function (e) {
    document.getElementById("backgroundMenu").hidden = !document.getElementById("backgroundMenu").hidden;
    document.getElementById("backgroundMenu").style.top = mouseY(e.data.originalEvent) + 'px';
    document.getElementById("backgroundMenu").style.left = mouseX(e.data.originalEvent) + 'px';
  })


  document.getElementById('create-person').addEventListener('click', addNode(pixiGraph));

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


function addNode(pixiGraph) {

  return function (eventPosition) {

    const id = Math.floor(Math.random() * 10e12).toString(36);

    const worldPosition = pixiGraph.viewport.toWorld(eventPosition);

    const x = worldPosition.x;
    const y = worldPosition.y;
    const node = { id, x, y };

    pixiGraph.graph.addNode(node.id, node);

    document.getElementById("backgroundMenu").hidden = true;
  }
}

function linkNode(pixiGraph, nodeStart) {

  return function (eventPosition) {

    const id = Math.floor(Math.random() * 10e12).toString(36);

    const worldPosition = pixiGraph.viewport.toWorld(eventPosition);

    const x = worldPosition.x;
    const y = worldPosition.y;
    const node = { id, x, y };

    pixiGraph.graph.addNode(node.id, node);

    document.getElementById("nodeMenu").hidden = true;
  }
}

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