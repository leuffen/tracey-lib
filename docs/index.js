/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_config_tracey_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/config/tracey-config */ "./src/config/tracey-config.ts");
/* harmony import */ var _src_config_tracey_config__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_src_config_tracey_config__WEBPACK_IMPORTED_MODULE_0__);




/***/ }),

/***/ "./src/config/tracey-config.ts":
/*!*************************************!*\
  !*** ./src/config/tracey-config.ts ***!
  \*************************************/
/***/ (() => {

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
let tracey_default = {
  breakpoints: {
    // Bootstrap breakpoints
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  },
  sections_selector: "section"
};
window.tracey_config = window.tracey_config || {};
window.tracey_config = __spreadValues(__spreadValues({}, tracey_default), window.tracey_config);


/***/ }),

/***/ "./src/tracker/section-tracker.ts":
/*!****************************************!*\
  !*** ./src/tracker/section-tracker.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SectionTracker: () => (/* binding */ SectionTracker)
/* harmony export */ });
class SectionTracker {
  constructor(selector, onChangeCallback) {
    this.sections = [];
    this.sectionTimes = /* @__PURE__ */ new Map();
    this.activeSection = null;
    this.lastTimestamp = 0;
    this.sections = Array.from(document.querySelectorAll(selector));
    this.onChangeCallback = onChangeCallback;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        const data = this.sectionTimes.get(section) || {
          sectionName: section.getAttribute("data-tracey-sec-name") || `Section ${this.sections.indexOf(section) + 1}`,
          totalViewTime: 0,
          firstViewTime: 0,
          scrollCount: 0,
          clickCount: 0,
          mouseMoveCount: 0,
          positions: []
        };
        if (entry.isIntersecting) {
          const now = performance.now();
          const delta = now - this.lastTimestamp;
          data.totalViewTime += delta;
          if (data.scrollCount === 0) {
            data.firstViewTime += delta;
          }
          this.lastTimestamp = now;
          if (!this.sectionTimes.has(section)) {
            this.sectionTimes.set(section, data);
          }
          if (this.onChangeCallback) {
            this.onChangeCallback(section, data);
          }
        }
      });
    }, {
      threshold: 0.5
    });
    this.sections.forEach((section) => this.observer.observe(section));
    console.log("SectionTracker initialized with IntersectionObserver");
  }
  getSectionData() {
    return this.sectionTimes;
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./docs/index.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../index */ "./index.ts");
/* harmony import */ var _src_tracker_section_tracker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/tracker/section-tracker */ "./src/tracker/section-tracker.ts");




console.log("index.ts loaded");
(()=> {
    console.log("DOM loaded");
    const st = new _src_tracker_section_tracker__WEBPACK_IMPORTED_MODULE_1__.SectionTracker("section", 50, (section, data) => {
        console.log(`Section ${data.sectionName} has been viewed for ${data.totalViewTime}ms`, data);
    });

})();

})();

/******/ })()
;
//# sourceMappingURL=index.js.map