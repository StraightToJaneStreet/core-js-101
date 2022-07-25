/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function CssCombination(left, combinator, right) {
  this.left = left;
  this.right = right;
  this.combinator = combinator;

  return this;
}

CssCombination.prototype.stringify = function stringify() {
  const leftPart = this.left.stringify();
  const rightPart = this.right.stringify();
  // console.log('LeftPart ', leftPart);
  // console.log('RightPart ', rightPart);
  return `${leftPart} ${this.combinator} ${rightPart}`;
};

class CssBuilder {
  constructor() {
    this.invalidArgument = 'Element, id and pseudo-element should not occur more then one time inside the selector';
    this.invalidOrderError = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
    this.Helement = null;
    this.Hid = null;
    this.HpseudoClasses = [];
    this.HpseudoElement = null;
    this.Hclasses = [];
    this.Hattrs = [];
  }

  hasElement() {
    return this.Helement !== null;
  }

  hasClasses() {
    return this.Hclasses.length !== 0;
  }

  hasId() {
    return this.Hid !== null;
  }

  hasPseudoElement() {
    return this.HpseudoElement !== null;
  }

  hasPseudoClasses() {
    return this.HpseudoClasses.length !== 0;
  }

  hasAttributes() {
    return this.Hattrs.length !== 0;
  }

  element(value) {
    if (this.hasElement()) {
      throw new Error(this.invalidArgument);
    }
    if (this.hasId()
        || this.hasClasses() || this.hasAttributes()
        || this.hasPseudoClasses() || this.hasPseudoElement()) {
      throw new Error(this.invalidOrderError);
    }

    this.Helement = value;
    return this;
  }

  id(value) {
    if (this.hasId()) {
      throw new Error(this.invalidArgument);
    }

    if (this.hasClasses() || this.hasAttributes()
        || this.hasPseudoClasses() || this.hasPseudoElement()) {
      throw new Error(this.invalidOrderError);
    }

    this.Hid = value;

    return this;
  }

  class(value) {
    if (this.hasAttributes() || this.hasPseudoClasses() || this.hasPseudoElement()) {
      throw new Error(this.invalidOrderError);
    }
    this.Hclasses.push(value);
    return this;
  }

  attr(value) {
    if (this.hasPseudoClasses() || this.hasPseudoElement()) {
      throw new Error(this.invalidOrderError);
    }
    this.Hattrs.push(value);
    return this;
  }

  pseudoClass(value) {
    if (this.hasPseudoElement()) {
      throw new Error(this.invalidOrderError);
    }
    this.HpseudoClasses.push(value);
    return this;
  }

  pseudoElement(value) {
    if (this.hasPseudoElement()) {
      throw new Error(this.invalidArgument);
    }
    this.HpseudoElement = value;
    return this;
  }

  stringify() {
    const elementPart = this.hasElement() ? this.Helement : '';
    const idPart = this.hasId() ? `#${this.Hid}` : '';
    const classPart = this.Hclasses.map((x) => `.${x}`).join('');
    const attrPart = this.Hattrs.map((x) => `[${x}]`).join('');
    const pseudoClassPart = this.HpseudoClasses.map((x) => `:${x}`).join('');
    const pseudoElementPart = this.hasPseudoElement() ? `::${this.HpseudoElement}` : '';
    // console.log('ElementPart:', elementPart);
    return `${elementPart}${idPart}${classPart}${attrPart}${pseudoClassPart}${pseudoElementPart}`;
  }
}

const cssSelectorBuilder = {
  element(value) {
    const instance = new CssBuilder();
    return instance.element(value);
  },

  id(value) {
    const instance = new CssBuilder();
    return instance.id(value);
  },

  class(value) {
    const instance = new CssBuilder();
    return instance.class(value);
  },

  attr(value) {
    const instance = new CssBuilder();
    return instance.attr(value);
  },

  pseudoClass(value) {
    const instance = new CssBuilder();
    return instance.pseudoClass(value);
  },

  pseudoElement(value) {
    const instance = new CssBuilder();
    return instance.pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    const combine = new CssCombination(selector1, combinator, selector2);
    // console.log(combine);
    return combine;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
