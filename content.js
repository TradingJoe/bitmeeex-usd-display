// culture sensitive parseFloat
// parseFloatOpts('1,000.01') --> 1000.01
// parseFloatOpts('1.000,01') --> 1000.01
function parseFloatOpts(str) {

  if (typeof str === "number") {
    return str;
  }

  var ar = str.split(/\.|,/);

  var value = '';
  for (var i in ar) {
    if (i > 0 && i == ar.length - 1) {
      value += ".";
    }
    value += ar[i];
  }
  return Number(value);
}

// the BitMEX .BXBT Index tracks the Bitcoin price every minute.
// this function is supposed to select the price from the header
function extractBXBTindexPrice() {
  const symbols = Array.from(document.querySelectorAll('.instrument .symbol'));
  const bxbtSymbol = symbols.find(x => x.innerHTML === '.BXBT');
  if (bxbtSymbol) {
    return parseFloatOpts(bxbtSymbol.nextElementSibling.innerHTML);
  }
}

// find all text nodes from element that have the given text
function findAllTextNodesWithText(el, text) {
  var n;
  const results = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while (n = walk.nextNode()) {
    if (n.nodeValue.includes(text)) {
      results.push(n);
    }
  }
  return results;
}

// uses ::before and ::after notation to show the price
// this way the orginal text stays the same so that nothing should break
function updateTextNode(node, indexPrice) {

  // removes 'Cost:' prefix
  const value = node.nodeValue.replace('Cost: ', '');

  // filters out 'Risk Limit' which shows a division char
  if (value.includes('/')) {
    return;
  }

  const amount = parseFloatOpts(value.split(' ')[0]);
  if (typeof amount === 'number'
    && !isNaN(amount)) {

    let amountInUsd = (amount * indexPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';

    node.parentElement.classList.add('showUsd');
    node.parentElement.setAttribute('data-usdAmount', amountInUsd + ' (');
  }
}

function updatePage() {
  let indexPrice = extractBXBTindexPrice();
  if (indexPrice) {
    const nodes = findAllTextNodesWithText(document.getElementById('content'), 'XBT');
    nodes.forEach(node => updateTextNode(node, indexPrice));

    // TODO, maybe
    // let calculator = document.querySelector('.calculatorOutput');
    // if (calculator) {
    //   let nodes = findAllTextNodesWithText(calculator, '');
    // }
  }
}

document.styleSheets[0].addRule('.showUsd::before', 'content: attr(data-usdAmount);font-weight: bold;');
document.styleSheets[0].addRule('.showUsd::after', 'content: ")";font-weight: bold;');


updatePage();
setInterval(updatePage, 2000);
