define(["react","react-dom"], function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Output = __webpack_require__(3);
	var Component = __webpack_require__(4);

	function init(Jupyter, events, commTarget, componentParams) {

	  requirejs(["services/kernels/comm"], function (Comm) {
	    /**
	     * handle_kernel 
	     * registers comm targets with the kernel comm_manager
	     * when new comms are open, renders a Parent component that takes over rendering of actual components
	     */
	    var handle_kernel = function handle_kernel(Jupyter, kernel) {
	      // register the target comm / listens for new comms 
	      kernel.comm_manager.register_target(commTarget, function (comm, msg) {
	        if (msg['msg_type'] === 'comm_open') {
	          var msg_id = msg.parent_header.msg_id;
	          var cell = Jupyter.notebook.get_msg_cell(msg_id);

	          if (cell.react_output && cell.react_output[commTarget]) {
	            var component = _react2.default.createElement(Component, _extends({}, componentParams, { comm: comm, comm_msg: msg }));
	            _reactDom2.default.render(component, cell.react_output[commTarget].subarea);
	          }
	        }
	      });

	      // find any open comms and render components 
	      kernel.comm_info(commTarget, function (commInfo) {
	        var comms = Object.keys(commInfo['content']['comms']);
	        var md = Jupyter.notebook.metadata;

	        if (comms.length && md.react_comms) {
	          comms.filter(function (c) {
	            return md.react_comms[c.comm_id] && c;
	          }).forEach(function (id) {
	            var cell = Jupyter.notebook.get_cells()[parseInt(md.react_comms[id])];
	            if (cell) {
	              var module = id.split('.').slice(-1)[0];
	              var newComm = new Comm.Comm(commTarget, id);
	              kernel.comm_manager.register_comm(newComm);

	              var component = _react2.default.createElement(Component, _extends({}, componentParams, { comm: newComm, comm_msg: { content: { data: { module: module } } } }));
	              _reactDom2.default.render(component, cell.react_output[commTarget].subarea);
	            }
	          });
	        }
	      });
	    };

	    /**
	     * handle_cell 
	     * add react dom area for components to render themselves into 
	     * @param {object} notebook cell
	     */
	    var handle_cell = function handle_cell(cell) {
	      if (cell.cell_type === 'code') {
	        if (!cell.react_output) {
	          cell.react_output = {};
	        }

	        if (!cell.react_output[commTarget]) {
	          cell.react_output[commTarget] = new Output(cell);
	        } else if (cell.react_output[commTarget].clear !== undefined) {
	          cell.react_output[commTarget].clear();
	        }

	        // override clear_output so react areas get cleared too
	        cell.clear_output = function () {
	          Object.getPrototypeOf(cell).clear_output.call(cell);
	          cell.react_output[commTarget].clear();
	        };
	      }
	    };

	    // On new kernel session create new comm managers
	    if (Jupyter.notebook && Jupyter.notebook.kernel) {
	      handle_kernel(Jupyter, Jupyter.notebook.kernel);
	    }
	    events.on('kernel_created.Kernel kernel_created.Session', function (event, data) {
	      handle_kernel(Jupyter, data.kernel);
	    });

	    // Create react component areas in cells
	    // Each cell in the notebook will have an area 
	    // that a component will render itself into
	    var cells = Jupyter.notebook.get_cells();
	    cells.forEach(function (cell) {
	      handle_cell(cell);
	    });

	    events.on('create.Cell', function (event, data) {
	      handle_cell(data.cell);
	    });

	    events.on('delete.Cell', function (event, data) {
	      if (data.cell && data.cell.react_output) {
	        data.cell.react_output[commTarget].clear();
	      }
	    });
	  });
	};

	exports.default = { init: init };
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Output
	 * defines an output area for a code cell where react components will render themselves into
	 * 
	 * @param {object} cell - a notebook cell to append react component areas to.
	 */
	function Output(cell) {
	  var _this = this;

	  this.clear = function () {
	    _this.subarea.innerHTML = '';
	  };

	  var area = document.createElement('div');
	  area.classList.add('jupyter-react-area');
	  area.classList.add('widget-area');
	  this.area = area;

	  var _prompt = document.createElement('div');
	  _prompt.classList.add('prompt');
	  area.appendChild(_prompt);

	  var subarea = document.createElement('div');
	  subarea.classList.add('jupyter-react-subarea');
	  subarea.classList.add('widget-subarea');
	  area.appendChild(subarea);

	  this.subarea = subarea;

	  if (cell.input) {
	    cell.input.after(area);
	  }

	  return this;
	};

	exports.default = Output;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class; // Base component that handles comm messages and renders components to notebook cell


	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _autobindDecorator = __webpack_require__(5);

	var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _React$PropTypes = _react2.default.PropTypes;
	var bool = _React$PropTypes.bool;
	var object = _React$PropTypes.object;


	var propTypes = {
	  comm: object.isRequired,
	  comm_msg: object.isRequired,
	  components: object.isRequired,
	  save: bool
	};

	var Component = (0, _autobindDecorator2.default)(_class = function (_React$Component) {
	  _inherits(Component, _React$Component);

	  function Component(props) {
	    _classCallCheck(this, Component);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this, props));

	    _this.state = {
	      renderProps: null,
	      components: props.components,
	      comm: props.comm,
	      comm_msg: props.comm_msg,
	      save: props.save
	    };

	    _this.state.comm.on_msg(_this.handleMsg);
	    return _this;
	  }

	  /**
	   * handleMsg 
	   * Handle all messages over this comm
	   */


	  _createClass(Component, [{
	    key: 'handleMsg',
	    value: function handleMsg(msg) {
	      var _this2 = this;

	      var _state = this.state;
	      var comm_msg = _state.comm_msg;
	      var save = _state.save;
	      var _msg$content$data = msg.content.data;
	      var method = _msg$content$data.method;
	      var _msg$content$data$pro = _msg$content$data.props;
	      var props = _msg$content$data$pro === undefined ? {} : _msg$content$data$pro;

	      if (method === "update") {
	        if (this.props.on_update) {
	          return this.props.on_update(comm_msg.content.data.module, props, msg.content.comm_id);
	        }
	        this.setState({ renderProps: _extends({}, props, comm_msg.content.data) });
	      } else if (method === "display") {
	        //console.log( msg, comm_msg )
	        if (save) {
	          this._save(msg, function () {
	            _this2.setState({ renderProps: _extends({}, props, comm_msg.content.data) });
	          });
	        } else {
	          this.setState({ renderProps: _extends({}, props, comm_msg.content.data) });
	        }
	      }
	    }

	    // saves the index of the cell to the notebook metadata
	    // useful for components that want to re-render on page refresh

	  }, {
	    key: '_save',
	    value: function _save(msg, done) {
	      var cell = this._getMsgCell(msg);
	      var md = Jupyter.notebook.metadata;
	      if (cell) {
	        if (!md.react_comms) {
	          md.react_comms = {};
	        }
	        md.react_comms[comm.comm_id] = this._getCellIndex(cell.cell_id) + '';
	      }
	      done();
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _state2 = this.state;
	      var renderProps = _state2.renderProps;
	      var comm_msg = _state2.comm_msg;
	      var comm = _state2.comm;
	      var components = _state2.components;


	      return _react2.default.createElement(
	        'div',
	        null,
	        renderProps && comm_msg && _react2.default.createElement(components[comm_msg.content.data.module], _extends({ comm: comm }, renderProps))
	      );
	    }
	  }]);

	  return Component;
	}(_react2.default.Component)) || _class;

	;

	Component.propType = propTypes;

	exports.default = Component;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * @copyright 2015, Andrey Popp <8mayday@gmail.com>
	 *
	 * The decorator may be used on classes or methods
	 * ```
	 * @autobind
	 * class FullBound {}
	 *
	 * class PartBound {
	 *   @autobind
	 *   method () {}
	 * }
	 * ```
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = autobind;

	function autobind() {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  if (args.length === 1) {
	    return boundClass.apply(undefined, args);
	  } else {
	    return boundMethod.apply(undefined, args);
	  }
	}

	/**
	 * Use boundMethod to bind all methods on the target.prototype
	 */
	function boundClass(target) {
	  // (Using reflect to get all keys including symbols)
	  var keys = undefined;
	  // Use Reflect if exists
	  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
	    keys = Reflect.ownKeys(target.prototype);
	  } else {
	    keys = Object.getOwnPropertyNames(target.prototype);
	    // use symbols if support is provided
	    if (typeof Object.getOwnPropertySymbols === 'function') {
	      keys = keys.concat(Object.getOwnPropertySymbols(target.prototype));
	    }
	  }

	  keys.forEach(function (key) {
	    // Ignore special case target method
	    if (key === 'constructor') {
	      return;
	    }

	    var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

	    // Only methods need binding
	    if (typeof descriptor.value === 'function') {
	      Object.defineProperty(target.prototype, key, boundMethod(target, key, descriptor));
	    }
	  });
	  return target;
	}

	/**
	 * Return a descriptor removing the value and returning a getter
	 * The getter will return a .bind version of the function
	 * and memoize the result against a symbol on the instance
	 */
	function boundMethod(target, key, descriptor) {
	  var fn = descriptor.value;

	  if (typeof fn !== 'function') {
	    throw new Error('@autobind decorator can only be applied to methods not: ' + typeof fn);
	  }

	  // In IE11 calling Object.defineProperty has a side-effect of evaluating the
	  // getter for the property which is being replaced. This causes infinite
	  // recursion and an "Out of stack space" error.
	  var definingProperty = false;

	  return {
	    configurable: true,
	    get: function get() {
	      if (definingProperty || this === target.prototype || this.hasOwnProperty(key)) {
	        return fn;
	      }

	      var boundFn = fn.bind(this);
	      definingProperty = true;
	      Object.defineProperty(this, key, {
	        value: boundFn,
	        configurable: true,
	        writable: true
	      });
	      definingProperty = false;
	      return boundFn;
	    }
	  };
	}
	module.exports = exports['default'];


/***/ }
/******/ ])});;