const fs = require('fs');
const { JSDOM } = require('jsdom');
// Setup minimal DOM for Three.js FBXLoader
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;

const THREE = require('three');
global.THREE = THREE;

// Read FBXLoader
const FBXLoaderSource = fs.readFileSync('/Users/tai_hungg/coding/koudou-game/node_modules/three/examples/jsm/loaders/FBXLoader.js', 'utf8');
// It's an ES module. We can't easily require it in commonjs.
