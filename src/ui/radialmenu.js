/**
 * RadialMenu.js - A circular context menu for Geolantis360
 * Adapted from https://github.com/axln/radial-menu-js
 */

"use strict";

var DEFAULT_SIZE = 400;
var MIN_SECTORS = 6;

/**
 * RadialMenu constructor
 * @param {Object} params - Configuration parameters
 * @param {Element} params.parent - Parent DOM element
 * @param {number} [params.size=400] - Menu size in pixels
 * @param {boolean} [params.closeOnClick=false] - Whether to close menu after item click
 * @param {Array} params.menuItems - Menu items configuration
 * @param {Function} [params.onClick] - Callback for menu item clicks
 */
function RadialMenu(params) {
  var self = this;

  self.parent = params.parent || document.body;
  self.size = params.size || DEFAULT_SIZE;
  self.onClick = params.onClick || null;
  self.menuItems = params.menuItems || [{ id: "default", title: "Item" }];
  self.closeOnClick =
    params.closeOnClick !== undefined ? !!params.closeOnClick : false;

  self.radius = 50;
  self.innerRadius = self.radius * 0.3;
  self.sectorSpace = self.radius * 0.06;
  self.sectorCount = Math.max(self.menuItems.length, MIN_SECTORS);

  self.scale = 1;
  self.holder = null;
  self.parentMenu = [];
  self.parentItems = [];
  self.levelItems = null;

  self.createHolder();
  self.currentMenu = null;

  // Set up event handlers
  document.addEventListener("wheel", self.onMouseWheel.bind(self));
  document.addEventListener("keydown", self.onKeyDown.bind(self));
}

/**
 * Open the menu
 */
RadialMenu.prototype.open = function () {
  var self = this;
  if (!self.currentMenu) {
    self.currentMenu = self.createMenu("menu inner", self.menuItems);
    self.holder.appendChild(self.currentMenu);

    // Wait for DOM to update then apply transition
    setTimeout(function () {
      self.currentMenu.setAttribute("class", "menu");
    }, 10);
  }
};

/**
 * Close the menu
 */
RadialMenu.prototype.close = function () {
  var self = this;

  if (self.currentMenu) {
    var parentMenu;
    while ((parentMenu = self.parentMenu.pop())) {
      parentMenu.remove();
    }
    self.parentItems = [];

    self.currentMenu.setAttribute("class", "menu inner");
    setTimeout(function () {
      if (self.currentMenu) {
        self.currentMenu.remove();
        self.currentMenu = null;
      }
    }, 300); // Match transition time
  }
};

/**
 * Get parent menu
 * @returns {Element|null} Parent menu
 */
RadialMenu.prototype.getParentMenu = function () {
  var self = this;
  if (self.parentMenu.length > 0) {
    return self.parentMenu[self.parentMenu.length - 1];
  } else {
    return null;
  }
};

/**
 * Create holder element
 */
RadialMenu.prototype.createHolder = function () {
  var self = this;

  self.holder = document.createElement("div");
  self.holder.className = "menuHolder";
  self.holder.style.width = self.size + "px";
  self.holder.style.height = self.size + "px";

  self.parent.appendChild(self.holder);
};

/**
 * Update menu items
 * @param {Array} items - New menu items
 */
RadialMenu.prototype.setMenuItems = function (items) {
  var self = this;
  if (Array.isArray(items)) {
    self.menuItems = items;
    self.sectorCount = Math.max(self.menuItems.length, MIN_SECTORS);

    // If menu is open, recreate it with new items
    if (self.currentMenu) {
      self.currentMenu.remove();
      self.currentMenu = null;
      self.open();
    }
  }
};

/**
 * Show nested submenu
 * @param {Object} item - Menu item with submenu
 */
RadialMenu.prototype.showNestedMenu = function (item) {
  var self = this;
  self.parentMenu.push(self.currentMenu);
  self.parentItems.push(self.levelItems);
  self.currentMenu = self.createMenu("menu inner", item.items, true);
  self.holder.appendChild(self.currentMenu);

  // Wait for DOM to update then apply transition
  setTimeout(function () {
    self.getParentMenu().setAttribute("class", "menu outer");
    self.currentMenu.setAttribute("class", "menu");
  }, 10);
};

/**
 * Return to parent menu
 */
RadialMenu.prototype.returnToParentMenu = function () {
  var self = this;
  self.getParentMenu().setAttribute("class", "menu");
  self.currentMenu.setAttribute("class", "menu inner");

  setTimeout(function () {
    self.currentMenu.remove();
    self.currentMenu = self.parentMenu.pop();
    self.levelItems = self.parentItems.pop();
  }, 300); // Match transition time
};

/**
 * Handle menu item click
 */
RadialMenu.prototype.handleClick = function () {
  var self = this;

  var selectedIndex = self.getSelectedIndex();
  if (selectedIndex >= 0) {
    var item = self.levelItems[selectedIndex];
    if (item.items) {
      self.showNestedMenu(item);
    } else {
      if (self.onClick) {
        self.onClick(item);
        if (self.closeOnClick) {
          self.close();
        }
      }
    }
  }
};

/**
 * Handle center click (close or back)
 */
RadialMenu.prototype.handleCenterClick = function () {
  var self = this;
  if (self.parentItems.length > 0) {
    self.returnToParentMenu();
  } else {
    self.close();
  }
};

/**
 * Create center button
 * @param {Element} svg - SVG element
 * @param {string} title - Button title
 * @param {string} icon - Icon reference
 * @param {number} [size=8] - Icon size
 */
RadialMenu.prototype.createCenter = function (svg, title, icon, size) {
  var self = this;
  size = size || 8;
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "center");

  var centerCircle = self.createCircle(
    0,
    0,
    self.innerRadius - self.sectorSpace / 3
  );
  g.appendChild(centerCircle);
  if (title) {
    var text = self.createText(0, 0, title);
    g.appendChild(text);
  }

  if (icon) {
    var use = self.createUseTag(0, 0, icon);
    use.setAttribute("width", size);
    use.setAttribute("height", size);
    use.setAttribute(
      "transform",
      "translate(-" +
        RadialMenu.numberToString(size / 2) +
        ",-" +
        RadialMenu.numberToString(size / 2) +
        ")"
    );
    g.appendChild(use);
  }

  svg.appendChild(g);
};

/**
 * Calculate index offset for menu layout
 * @returns {number} Index offset
 */
RadialMenu.prototype.getIndexOffset = function () {
  var self = this;
  if (self.levelItems.length < self.sectorCount) {
    switch (self.levelItems.length) {
      case 1:
        return -2;
      case 2:
        return -2;
      case 3:
        return -2;
      default:
        return -1;
    }
  } else {
    return -1;
  }
};

/**
 * Create menu with items
 * @param {string} classValue - CSS class
 * @param {Array} levelItems - Menu items
 * @param {boolean} [nested=false] - Is this a nested menu
 * @returns {Element} SVG element
 */
RadialMenu.prototype.createMenu = function (classValue, levelItems, nested) {
  var self = this;

  self.levelItems = levelItems;
  self.sectorCount = Math.max(self.levelItems.length, MIN_SECTORS);
  self.scale = self.calcScale();

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", classValue);
  svg.setAttribute("viewBox", "-50 -50 100 100");
  svg.setAttribute("width", self.size);
  svg.setAttribute("height", self.size);

  var angleStep = 360 / self.sectorCount;
  var angleShift = angleStep / 2 + 270;
  var indexOffset = self.getIndexOffset();

  for (var i = 0; i < self.sectorCount; ++i) {
    var startAngle = angleShift + angleStep * i;
    var endAngle = angleShift + angleStep * (i + 1);

    var itemIndex = RadialMenu.resolveLoopIndex(
      self.sectorCount - i + indexOffset,
      self.sectorCount
    );
    var item;
    if (itemIndex >= 0 && itemIndex < self.levelItems.length) {
      item = self.levelItems[itemIndex];
    } else {
      item = null;
    }

    self.appendSectorPath(startAngle, endAngle, svg, item, itemIndex);
  }

  if (nested) {
    self.createCenter(svg, "", "#return", 8);
  } else {
    self.createCenter(svg, "", "#close", 7);
  }

  svg.addEventListener("mousedown", function (event) {
    var targetClass = event.target.parentNode.getAttribute("class");
    if (targetClass) {
      var className = targetClass.split(" ")[0];
      if (className === "sector") {
        var index = parseInt(
          event.target.parentNode.getAttribute("data-index")
        );
        if (!isNaN(index)) {
          self.setSelectedIndex(index);
        }
      }
    }
  });

  svg.addEventListener("click", function (event) {
    var targetClass = event.target.parentNode.getAttribute("class");
    if (targetClass) {
      var className = targetClass.split(" ")[0];
      if (className === "sector") {
        self.handleClick();
      } else if (className === "center") {
        self.handleCenterClick();
      }
    }
  });

  // Add mobile touch events
  svg.addEventListener("touchstart", function (event) {
    var touch = event.touches[0];
    var targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    var parentNode = targetElement.parentNode;

    if (parentNode && parentNode.getAttribute) {
      var targetClass = parentNode.getAttribute("class");
      if (targetClass) {
        var className = targetClass.split(" ")[0];
        if (className === "sector") {
          var index = parseInt(parentNode.getAttribute("data-index"));
          if (!isNaN(index)) {
            self.setSelectedIndex(index);
          }
        }
      }
    }

    event.preventDefault();
  });

  svg.addEventListener("touchend", function (event) {
    var touch = event.changedTouches[0];
    var targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    var parentNode = targetElement.parentNode;

    if (parentNode && parentNode.getAttribute) {
      var targetClass = parentNode.getAttribute("class");
      if (targetClass) {
        var className = targetClass.split(" ")[0];
        if (className === "sector") {
          self.handleClick();
        } else if (className === "center") {
          self.handleCenterClick();
        }
      }
    }

    event.preventDefault();
  });

  return svg;
};

/**
 * Select menu item by delta
 * @param {number} indexDelta - Index change
 */
RadialMenu.prototype.selectDelta = function (indexDelta) {
  var self = this;
  var selectedIndex = self.getSelectedIndex();
  if (selectedIndex < 0) {
    selectedIndex = 0;
  }
  selectedIndex += indexDelta;

  if (selectedIndex < 0) {
    selectedIndex = self.levelItems.length + selectedIndex;
  } else if (selectedIndex >= self.levelItems.length) {
    selectedIndex -= self.levelItems.length;
  }
  self.setSelectedIndex(selectedIndex);
};

/**
 * Handle keyboard events
 * @param {Event} event - Keyboard event
 */
RadialMenu.prototype.onKeyDown = function (event) {
  var self = this;
  if (self.currentMenu) {
    switch (event.key) {
      case "Escape":
      case "Backspace":
        self.handleCenterClick();
        event.preventDefault();
        break;
      case "Enter":
        self.handleClick();
        event.preventDefault();
        break;
      case "ArrowRight":
      case "ArrowUp":
        self.selectDelta(1);
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowDown":
        self.selectDelta(-1);
        event.preventDefault();
        break;
    }
  }
};

/**
 * Handle mouse wheel events
 * @param {Event} event - Mouse wheel event
 */
RadialMenu.prototype.onMouseWheel = function (event) {
  var self = this;
  if (self.currentMenu) {
    var delta = -event.deltaY;

    if (delta > 0) {
      self.selectDelta(1);
    } else {
      self.selectDelta(-1);
    }

    event.preventDefault();
  }
};

/**
 * Get selected node
 * @returns {Element|null} Selected node
 */
RadialMenu.prototype.getSelectedNode = function () {
  var self = this;
  if (!self.currentMenu) return null;

  var items = self.currentMenu.getElementsByClassName("selected");
  if (items.length > 0) {
    return items[0];
  } else {
    return null;
  }
};

/**
 * Get selected item index
 * @returns {number} Selected index or -1
 */
RadialMenu.prototype.getSelectedIndex = function () {
  var self = this;
  var selectedNode = self.getSelectedNode();
  if (selectedNode) {
    return parseInt(selectedNode.getAttribute("data-index"));
  } else {
    return -1;
  }
};

/**
 * Set selected item by index
 * @param {number} index - Item index
 */
RadialMenu.prototype.setSelectedIndex = function (index) {
  var self = this;
  if (index >= 0 && index < self.levelItems.length) {
    var items = self.currentMenu.querySelectorAll(
      'g[data-index="' + index + '"]'
    );
    if (items.length > 0) {
      var itemToSelect = items[0];
      var selectedNode = self.getSelectedNode();
      if (selectedNode) {
        selectedNode.setAttribute("class", "sector");
      }
      itemToSelect.setAttribute("class", "sector selected");
    }
  }
};

/**
 * Create SVG use tag
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} link - Icon reference
 * @returns {Element} SVG use element
 */
RadialMenu.prototype.createUseTag = function (x, y, link) {
  var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("x", RadialMenu.numberToString(x));
  use.setAttribute("y", RadialMenu.numberToString(y));
  use.setAttribute("width", "10");
  use.setAttribute("height", "10");
  use.setAttribute("fill", "#4682b4");
  use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", link);
  return use;
};

/**
 * Append sector path to SVG
 * @param {number} startAngleDeg - Start angle in degrees
 * @param {number} endAngleDeg - End angle in degrees
 * @param {Element} svg - SVG element
 * @param {Object} item - Menu item
 * @param {number} index - Item index
 */
RadialMenu.prototype.appendSectorPath = function (
  startAngleDeg,
  endAngleDeg,
  svg,
  item,
  index
) {
  var self = this;

  var centerPoint = self.getSectorCenter(startAngleDeg, endAngleDeg);
  var translate = {
    x: RadialMenu.numberToString((1 - self.scale) * centerPoint.x),
    y: RadialMenu.numberToString((1 - self.scale) * centerPoint.y),
  };

  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute(
    "transform",
    "translate(" +
      translate.x +
      " ," +
      translate.y +
      ") scale(" +
      self.scale +
      ")"
  );

  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", self.createSectorCmds(startAngleDeg, endAngleDeg));
  g.appendChild(path);

  if (item) {
    g.setAttribute("class", "sector");
    if (index == 0) {
      g.setAttribute("class", "sector selected");
    }
    g.setAttribute("data-id", item.id);
    g.setAttribute("data-index", index);

    if (item.title) {
      var text = self.createText(centerPoint.x, centerPoint.y, item.title);
      if (item.icon) {
        text.setAttribute("transform", "translate(0,8)");
      } else {
        text.setAttribute("transform", "translate(0,2)");
      }

      g.appendChild(text);
    }

    if (item.icon) {
      var use = self.createUseTag(centerPoint.x, centerPoint.y, item.icon);
      if (item.title) {
        use.setAttribute("transform", "translate(-5,-8)");
      } else {
        use.setAttribute("transform", "translate(-5,-5)");
      }

      g.appendChild(use);
    }
  } else {
    g.setAttribute("class", "dummy");
  }

  svg.appendChild(g);
};

/**
 * Create sector path commands
 * @param {number} startAngleDeg - Start angle in degrees
 * @param {number} endAngleDeg - End angle in degrees
 * @returns {string} SVG path commands
 */
RadialMenu.prototype.createSectorCmds = function (startAngleDeg, endAngleDeg) {
  var self = this;

  var initPoint = RadialMenu.getDegreePos(startAngleDeg, self.radius);
  var path = "M" + RadialMenu.pointToString(initPoint);

  var radiusAfterScale = self.radius * (1 / self.scale);
  path +=
    "A" +
    radiusAfterScale +
    " " +
    radiusAfterScale +
    " 0 0 0" +
    RadialMenu.pointToString(RadialMenu.getDegreePos(endAngleDeg, self.radius));
  path +=
    "L" +
    RadialMenu.pointToString(
      RadialMenu.getDegreePos(endAngleDeg, self.innerRadius)
    );

  var radiusDiff = self.radius - self.innerRadius;
  var radiusDelta = (radiusDiff - radiusDiff * self.scale) / 2;
  var innerRadius = (self.innerRadius + radiusDelta) * (1 / self.scale);
  path +=
    "A" +
    innerRadius +
    " " +
    innerRadius +
    " 0 0 1 " +
    RadialMenu.pointToString(
      RadialMenu.getDegreePos(startAngleDeg, self.innerRadius)
    );
  path += "Z";

  return path;
};

/**
 * Create text element
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} title - Text content
 * @returns {Element} SVG text element
 */
RadialMenu.prototype.createText = function (x, y, title) {
  var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("x", RadialMenu.numberToString(x));
  text.setAttribute("y", RadialMenu.numberToString(y));
  text.setAttribute("font-size", "38%");
  text.setAttribute("fill", "black");
  text.innerHTML = title;
  return text;
};

/**
 * Create circle element
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} r - Radius
 * @returns {Element} SVG circle element
 */
RadialMenu.prototype.createCircle = function (x, y, r) {
  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", RadialMenu.numberToString(x));
  circle.setAttribute("cy", RadialMenu.numberToString(y));
  circle.setAttribute("r", r);
  return circle;
};

/**
 * Calculate scale factor
 * @returns {number} Scale factor
 */
RadialMenu.prototype.calcScale = function () {
  var self = this;
  var totalSpace = self.sectorSpace * self.sectorCount;
  var circleLength = Math.PI * 2 * self.radius;
  var radiusDelta = self.radius - (circleLength - totalSpace) / (Math.PI * 2);
  return (self.radius - radiusDelta) / self.radius;
};

/**
 * Get sector center point
 * @param {number} startAngleDeg - Start angle in degrees
 * @param {number} endAngleDeg - End angle in degrees
 * @returns {Object} Point with x and y coordinates
 */
RadialMenu.prototype.getSectorCenter = function (startAngleDeg, endAngleDeg) {
  var self = this;
  return RadialMenu.getDegreePos(
    (startAngleDeg + endAngleDeg) / 2,
    self.innerRadius + (self.radius - self.innerRadius) / 2
  );
};

/**
 * Get position from angle and length
 * @param {number} angleDeg - Angle in degrees
 * @param {number} length - Distance from center
 * @returns {Object} Point with x and y coordinates
 */
RadialMenu.getDegreePos = function (angleDeg, length) {
  return {
    x: Math.sin(RadialMenu.degToRad(angleDeg)) * length,
    y: Math.cos(RadialMenu.degToRad(angleDeg)) * length,
  };
};

/**
 * Convert point to string
 * @param {Object} point - Point with x and y coordinates
 * @returns {string} String representation
 */
RadialMenu.pointToString = function (point) {
  return (
    RadialMenu.numberToString(point.x) +
    " " +
    RadialMenu.numberToString(point.y)
  );
};

/**
 * Convert number to string
 * @param {number} n - Number
 * @returns {string} String representation
 */
RadialMenu.numberToString = function (n) {
  if (Number.isInteger(n)) {
    return n.toString();
  } else if (n) {
    var r = (+n).toFixed(5);
    if (r.match(/\./)) {
      r = r.replace(/\.?0+$/, "");
    }
    return r;
  }
};

/**
 * Resolve loop index
 * @param {number} index - Index
 * @param {number} length - Length
 * @returns {number} Resolved index
 */
RadialMenu.resolveLoopIndex = function (index, length) {
  if (index < 0) {
    index = length + index;
  }
  if (index >= length) {
    index = index - length;
  }
  if (index < length) {
    return index;
  } else {
    return null;
  }
};

/**
 * Convert degrees to radians
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
RadialMenu.degToRad = function (deg) {
  return deg * (Math.PI / 180);
};
