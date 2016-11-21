import '../polyfills/array-from';
import '../polyfills/element-matches';
import '../polyfills/object-assign';
import '../polyfills/custom-event';
import toggleClass from '../polyfills/toggle-class';
import eventMatches from '../polyfills/event-matches';

export default class InlineLeftNav {
  /**
   * Spinner indicating loading state.
   * @implements Component
   * @param {HTMLElement} element The element working as a spinner.
   * @param {Object} options The component options.
   */
  constructor(element, options = {}) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError('DOM element should be given to initialize this widget.');
    }

    this.options = Object.assign(this.constructor.options, options);

    this.element = element;

    this.constructor.components.set(this.element, this);
    this.hookListItemsEvents();
  }

  /**
   * Instantiates spinner of the given element.
   * @param {HTMLElement} element The element.
   */
  static create(element) {
    return this.components.get(element) || new this(element);
  }

  /**
   * Instantiates spinner in the given node.
   * If the given element indicates that it's an spinner (having `data-loading` attribute), instantiates it.
   * Otherwise, instantiates spinners by searching for spinners in the given node.
   * @param {Node} target The DOM node to instantiate spinners in. Should be a document or an element.
   * @param {Object} [options] The component options.
   * @param {string} [options.selectorInit] The CSS selector to find inline left navs.
   */
  static init(target = document, options = {}) {
    const effectiveOptions = Object.assign(Object.create(this.options), options);
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
      throw new Error('DOM document or DOM element should be given to search for and initialize this widget.');
    }
    if (target.nodeType === Node.ELEMENT_NODE && target.matches(effectiveOptions.selectorInit)) {
      this.create(target, effectiveOptions);
    } else {
      [... target.querySelectorAll(effectiveOptions.selectorInit)].forEach(element => this.create(element, effectiveOptions));
    }
  }

  hookListItemsEvents() {
    const leftNavList = this.element.querySelector(this.options.selectorLeftNavList);
    leftNavList.addEventListener('click', (evt) => {
      const leftNavItem = eventMatches(evt, this.options.selectorLeftNavListItem);
      if (leftNavItem) {
        const childItem = eventMatches(evt, this.options.selectorLeftNavNestedListItem);
        const hasChildren = leftNavItem.classList.contains('left-nav-list__item--has-children');
        if (childItem) {
          this.addActiveListItem(childItem);
        } else if (hasChildren) {
          this.handleNestedListClick(leftNavItem, evt);
        } else {
          this.addActiveListItem(leftNavItem);
        }
      }
    });
    [... this.element.querySelectorAll(this.options.selectorLeftNavListItem)].forEach(item => {
      item.addEventListener('keydown', (evt) => {
        const leftNavItemWithChildren = eventMatches(evt, this.options.selectorLeftNavListItemHasChildren);
        if (leftNavItemWithChildren && evt.which === 13) {
          this.handleNestedListClick(leftNavItemWithChildren);
        }
      });
    });
  }

  addActiveListItem(item) {
    [...this.element.querySelectorAll(this.options.selectorLeftNavListItem)].forEach(currentItem => {
      if (!(item === currentItem)) {
        currentItem.classList.remove(this.options.classActiveLeftNavListItem);
      }
    });
    [...this.element.querySelectorAll(this.options.selectorLeftNavNestedListItem)].forEach(currentItem => {
      if (!(item === currentItem)) {
        currentItem.classList.remove(this.options.classActiveLeftNavListItem);
      }
    });
    item.classList.add(this.options.classActiveLeftNavListItem);
  }

  /**
   * Handles click on a list item that contains a nested list in the left navigation.
   * The nested list is expanded and the icon is rotated.
   * @param {HTMLElement} listItem The list item that was clicked.
   * @param {Event} event The event triggering this method.
   */
   handleNestedListClick(listItem, evt) {
     const isOpen = listItem.classList.contains(this.options.classExpandedLeftNavListItem);
     if (!('leftNavItemLink' in evt.target.dataset)) {
       toggleClass(listItem, this.options.classExpandedLeftNavListItem, !isOpen);
     }
     const list = listItem.querySelector(this.options.selectorLeftNavNestedList);
     const listItems = [... list.querySelectorAll(this.options.selectorLeftNavNestedListItem)];
     listItems.forEach(item => {
       if (isOpen) {
         item.querySelector(this.options.selectorLeftNavListItemLink).tabIndex = -1;
       } else {
         item.querySelector(this.options.selectorLeftNavListItemLink).tabIndex = 0;
       }
     });
   }

  release() {
    this.constructor.components.delete(this.element);
  }

  /**
   * The map associating DOM element and spinner instance.
   * @member InlineLeftNav.components
   * @type {WeakMap}
   */
  static components = new WeakMap();

  /**
   * The component options.
   * If `options` is specified in the constructor, {@linkcode InlineLeftNav.create .create()}, or {@linkcode InlineLeftNav.init .init()},
   * properties in this object are overriden for the instance being create and how {@linkcode InlineLeftNav.init .init()} works.
   * @member InlineLeftNav.options
   * @type {Object}
   * @property {string} selectorInit The CSS selector to find inline left navs.
   */
  static options = {
    selectorInit: '[data-inline-left-nav]',
    // Data Attribute selectors
    selectorLeftNavList: '[data-inline-left-nav-list]',
    selectorLeftNavNestedList: '[data-inline-left-nav-nested-list]',
    selectorLeftNavListItem: '[data-inline-left-nav-item]',
    selectorLeftNavListItemLink: '[data-inline-left-nav-item-link]',
    selectorLeftNavNestedListItem: '[data-inline-left-nav-nested-item]',
    // CSS Class Selectors
    classActiveLeftNavListItem: 'left-nav-list__item--active',
    classExpandedLeftNavListItem: 'left-nav-list__item--expanded',
  };
}