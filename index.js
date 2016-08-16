define(function() { return /******/ (function(modules) { // webpackBootstrap
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

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	if (window.require) {
	  window.require.config({
	    map: {
	      "*": {
	        "react": "https://fb.me/react-15.2.1.min.js",
	        "react-dom": "https://fb.me/react-dom-15.2.1.min.js"
	      }
	    }
	  });
	}

	var Area = __webpack_require__(1);
	var Manager = __webpack_require__(2);
	var ReactComponent = __webpack_require__(3);

	function init(Jupyter, events, comm_target, component_options) {

	  requirejs(["react", "react-dom", "services/kernels/comm"], function (React, ReactDom, Comm) {
	    window.React = React;
	    window.ReactDom = ReactDom;

	    /**
	     * handle_kernel 
	     * creates an instance of a "Manager" used to listen for new comms and create new components
	     */
	    var handle_kernel = function handle_kernel(Jupyter, kernel) {
	      if (kernel.comm_manager && kernel.component_manager === undefined) {
	        kernel.component_manager = new Manager.ComponentManager(kernel, Comm);
	      }

	      if (kernel.component_manager) {
	        var Component = ReactComponent(component_options);
	        kernel.component_manager.register(comm_target, Component);
	      }
	    };

	    /**
	     * handle_cell 
	     * add react dom area for components to render themselves into 
	     * @param {object} notebook cell
	     */
	    // TODO need to handle clear out output calls
	    var handle_cell = function handle_cell(cell) {
	      if (cell.cell_type === 'code') {
	        if (!cell.react_dom) {
	          cell.react_dom = new Area(cell);
	        } else if (cell.react_dom.clear !== undefined) {
	          cell.react_dom.clear();
	        }
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
	      if (data.cell && data.cell.react_dom) {
	        data.cell.react_dom.clear();
	      }
	    });
	  });
	};

	exports.default = {
	  Manager: Manager,
	  ReactComponent: ReactComponent,
	  Area: Area,
	  init: init
	};
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Area 
	 * defines an output area for a code cell where react components will render themselves into
	 * 
	 * @param {object} cell - a notebook cell to append react component areas to.
	 *
	 * TODO 
	 * needs to bind to clear_display calls
	 * could also just not do this, and append new divs to output subareas so that clear_output is auto handled...
	 */
	function Area(cell) {
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

	exports.default = Area;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function Manager(kernel, comm) {
	  this.kernel = kernel;
	  this.comm = comm;
	  this.components = {};

	  this.register = function (target, Component) {
	    var self = this;
	    // new targets...
	    if (!this.components[target]) {
	      this.components[target] = { Component: Component };
	      kernel.comm_manager.register_target(target, function (comm, msg) {
	        if (msg['msg_type'] === 'comm_open') {
	          self.components[target][comm.comm_id] = self.components[target].Component(comm, msg);
	        }
	      });
	    }

	    // look for comms that need to be re-created (page refresh)
	    this.kernel.comm_info(target, function (info) {
	      var comms = Object.keys(info['content']['comms']);
	      var md = Jupyter.notebook.metadata;

	      // TODO
	      // pretty nasty right here, confusing to follow
	      if (comms.length) {
	        comms.forEach(function (comm_id) {
	          if (md.react_comms && md.react_comms[comm_id]) {
	            var cell = self._get_cell(md.react_comms[comm_id]);
	            if (cell) {
	              var module = comm_id.split('.').slice(-1)[0];
	              var newComm = self._create_comm(target, comm_id);
	              var newComp = self.components[target].Component(newComm, { content: { data: { module: module } } }, cell);
	              newComp.render();
	              self.components[target][newComm.comm_id] = newComp;
	            }
	          }
	        });
	      }
	    });
	  };

	  this._get_cell = function (index) {
	    return Jupyter.notebook.get_cells()[parseInt(index)];
	  };

	  this._create_comm = function (target, comm_id) {
	    var newComm = new this.comm.Comm(target, comm_id);
	    Jupyter.notebook.kernel.comm_manager.register_comm(newComm);
	    return newComm;
	  };

	  return this;
	};

	exports.default = {
	  ComponentManager: Manager
	};
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	// Base component that handles comm messages and renders components to notebook cell

	module.exports = function Component(options) {
	  return function (comm, props, cell) {
	    var _this = this;

	    this.cell = cell;
	    this.comm = comm;
	    this.module = props.content.data.module;
	    this.domId = props.content.data.domId;

	    // Handle all messages over this comm
	    this.handleMsg = function (msg) {
	      var data = msg.content.data;
	      switch (data.method) {
	        case "update":
	          if (options.on_update) {
	            return options.on_update(_this.module, data.props, msg.content.comm_id);
	          }
	          // else re-render
	          _this.renderComponent(msg, data.props);
	          break;
	        case "display":
	          // save comm id and cell id to notebook.metadata
	          _this._saveComponent(msg);
	          break;
	      }
	    };

	    // save cell index to notebook metadata as a string
	    this._saveComponent = function (msg) {
	      var cell = this._getMsgCell(msg);
	      var md = Jupyter.notebook.metadata;
	      if (cell) {
	        if (!md.react_comms) {
	          md.react_comms = {};
	        }
	        md.react_comms[comm.comm_id] = this._getCellIndex(cell.cell_id) + '';
	      }
	      this.renderComponent(msg);
	    };

	    // create reacte element and call _render 
	    this.renderComponent = function (msg, newProps) {
	      newProps = newProps || props.content.data;
	      newProps.cell = this._getMsgCell(msg);
	      newProps.comm = comm;
	      var element = this._createMarkup(options.components[this.module], newProps);
	      this._render(element, msg);
	    };

	    // Render the component to either the output cell or given domId
	    this._render = function (element, msg) {
	      var display;
	      if (this.domId) {
	        display = document.getElementById(this.domId);
	      } else {
	        display = this._outputAreaElement(msg);
	      }
	      ReactDom.render(element, display);
	    };

	    this.render = function () {
	      var newProps = props.content.data;
	      newProps.cell = this.cell;
	      newProps.comm = comm;
	      var element = this._createMarkup(options.components[this.module], newProps);
	      this._render(element, {});
	    };

	    this._getCellIndex = function (cell_id) {
	      var idx;
	      Jupyter.notebook.get_cells().forEach(function (c, i) {
	        if (c.cell_id === cell_id) {
	          idx = i;
	        }
	      });
	      return idx;
	    };

	    // gets the components cell or 
	    this._getMsgCell = function (msg) {
	      if (this.cell) return this.cell;
	      var msg_id = msg.parent_header.msg_id;
	      this.cell = Jupyter.notebook.get_msg_cell(msg_id);
	      return this.cell;
	    };

	    // Create React Elements from components and props 
	    this._createMarkup = function (component, cProps) {
	      return React.createElement(component, cProps);
	    };

	    // Get the DOM Element to render to
	    this._outputAreaElement = function (msg) {
	      var cell = this._getMsgCell(msg);
	      return cell.react_dom.subarea;
	    };

	    // register message callback
	    this.comm.on_msg(this.handleMsg);
	    return this;
	  };
	};

/***/ }
/******/ ])});;