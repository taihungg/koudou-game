const fs = require('fs');
const buffer = fs.readFileSync('/Users/tai_hungg/coding/koudou-game/public/assets/UltimateNaturePackbyQuaternius/BirchTree_1.fbx');
// Very naive search for color properties in binary FBX
const text = buffer.toString('ascii');
const matches = text.match(/Color.*?(\d+\.\d+).*?(\d+\.\d+).*?(\d+\.\d+)/g);
if (matches) {
  console.log("Found colors:");
  console.log(matches.slice(0, 10));
} else {
  console.log("No color properties found as ASCII.");
}
