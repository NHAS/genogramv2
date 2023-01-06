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

  nodes.forEach(node => {
    node.name = node.id
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
      name: node => { node.name },
      size: 15,
      gender: node => node.gender,
      color: node => colors[(node.group || 0) % colors.length],
      border: {
        width: 2,
        color: '#9F73AB',
      },
      label: {
        content: node => node.name,
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


  let leftClickedNode = null, linkTo = null;
  pixiGraph.on('nodeClick', (event, nodeKey) => {
    if (event.button == 2) {
      document.getElementById("nodeMenu").hidden = !document.getElementById("nodeMenu").hidden;
      document.getElementById("nodeMenu").style.top = mouseY(event) + 'px';
      document.getElementById("nodeMenu").style.left = mouseX(event) + 'px';
      leftClickedNode = nodeKey;

      console.log('nodeClick', leftClickedNode)
    }

  });

  addMenuClickHandlers("nodeMenu", {
    "add-link": function () {
      if (linkTo == null) {
        linkTo = leftClickedNode

        return
      }

      graph.addEdge(leftClickedNode, linkTo)
      linkTo = null;
    },

    'set-gender-male': function () {
      graph.setNodeAttribute(leftClickedNode, "gender", "male")
    },

    'set-gender-female': function () {
      graph.setNodeAttribute(leftClickedNode, "gender", "female")
    },

    'set-gender-other': function () {
      graph.setNodeAttribute(leftClickedNode, "gender", "unknown")
    },

    'add-parents': function () {

      let x = graph.getNodeAttribute(leftClickedNode, "x")
      let y = graph.getNodeAttribute(leftClickedNode, "y")


      let maleId = addNode(pixiGraph, "UNNAMED", "female", x - 50, y - 50, false)
      let femaleId = addNode(pixiGraph, "UNNAMED", "male", x + 50, y - 50, false)

      pixiGraph.graph.addEdge(maleId, femaleId)

      pixiGraph.graph.addEdge(maleId, leftClickedNode)
      pixiGraph.graph.addEdge(femaleId, leftClickedNode)

    },

    'add-child': function () {

      let x = graph.getNodeAttribute(leftClickedNode, "x")
      let y = graph.getNodeAttribute(leftClickedNode, "y")

      let newPersonId = addNode(pixiGraph, "UNNAMED", "unknown", x, y + 100, false)

      pixiGraph.graph.addEdge(leftClickedNode, newPersonId)
    },

    'delete-person-single': function () {
      graph.dropNode(leftClickedNode);
    }
  })



  let leftClickedEdge = null;
  pixiGraph.on('edgeClick', (event, edgeKey) => {
    if (event.button == 2) {
      document.getElementById("linkMenu").hidden = !document.getElementById("linkMenu").hidden;
      document.getElementById("linkMenu").style.top = mouseY(event) + 'px';
      document.getElementById("linkMenu").style.left = mouseX(event) + 'px';
      leftClickedEdge = edgeKey;

      console.log('edgeClick', event, edgeKey)
    }

  });

  const dropEdge = () => {

    graph.dropEdge(leftClickedEdge);
    document.getElementById("linkMenu").hidden = true;

  };

  document.getElementById('delete-link').addEventListener('click', dropEdge);

  pixiGraph.viewport.on("mouseup", function (e) {
    document.getElementById("nodeMenu").hidden = true;
    document.getElementById("backgroundMenu").hidden = true;
    document.getElementById("linkMenu").hidden = true;
  })

  pixiGraph.viewport.on("rightup", function (e) {
    document.getElementById("backgroundMenu").hidden = !document.getElementById("backgroundMenu").hidden;
    document.getElementById("backgroundMenu").style.top = mouseY(e.data.originalEvent) + 'px';
    document.getElementById("backgroundMenu").style.left = mouseX(e.data.originalEvent) + 'px';
    document.getElementById("linkMenu").hidden = true;
    document.getElementById("nodeMenu").hidden = true;
  })

  addMenuClickHandlers("backgroundMenu", {
    'create-person-female': function (event) {
      addNode(pixiGraph, "UNNAMED", "female", event.x, event.y)
    },
    'create-person-male': function (event) {
      addNode(pixiGraph, "UNNAMED", "male", event.x, event.y)

    },
    'create-parents': function (event) {

      let maleId = addNode(pixiGraph, "UNNAMED", "male", event.x, event.y)
      let femaleId = addNode(pixiGraph, "UNNAMED", "female", event.x + 100, event.y)

      pixiGraph.graph.addEdge(maleId, femaleId)
    }

  })

  const clear = () => {
    graph.clear();
  };
  document.getElementById('clear').addEventListener('click', clear);

  const resetView = () => {
    pixiGraph.resetView();
  };
  document.getElementById('reset-view').addEventListener('click', resetView);

  document.getElementById('export').addEventListener('click', function () {
    let serializedGraph = graph.export();
    download(JSON.stringify(serializedGraph), "genogram.json", "application/json")
  });

  document.getElementById('import').addEventListener('click', function () {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {

      // getting a hold of the file reference
      var file = e.target.files[0];

      // setting up the reader
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      // here we tell the reader what to do when it's done reading...
      reader.onload = readerEvent => {
        var content = JSON.parse(readerEvent.target.result); // this is the content!
        graph.import(content);
      }

    }

    input.click();
  });

});

function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function addNode(pixiGraph, name, gender, x1, y1, normalise = true) {

  const id = Math.floor(Math.random() * 10e12).toString(36);

  if (normalise) {
    const worldPosition = pixiGraph.viewport.toWorld({ x: x1, y: y1 });

    x1 = worldPosition.x;
    y1 = worldPosition.y;
  }
  const node = { id, x: x1, y: y1, gender, name };

  pixiGraph.graph.addNode(node.id, node);

  return id
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

function addClickHandler(element, menuName, func) {
  document.getElementById(element).addEventListener('click', function () {
    func()
    document.getElementById(menuName).hidden = true;
  });
}

function addMenuClickHandlers(menuName, menuElementToFunc) {
  for (let e in menuElementToFunc) {
    document.getElementById(e).addEventListener('click', function (event) {
      menuElementToFunc[e](event)
      document.getElementById(menuName).hidden = true;
    });
  }
}