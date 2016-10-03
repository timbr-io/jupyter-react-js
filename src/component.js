// Base component that handles comm messages and renders components to notebook cell
//const react = require('react');
//const reactDom = require('react-dom');

module.exports = function Component( options ) {
  return function (comm, props, cell) {
    this.cell = cell;
    this.comm = comm;

    /**
     * handleMsg 
     * Handle all messages over this comm
     */
    this.handleMsg = msg => {
      const data = msg.content.data;
      switch (data.method) {
        case "update":
          if ( options.on_update ) {
            return options.on_update( props.content.data.module, data.props, msg.content.comm_id);
          }
          // else re-render
          this.render( msg, data.props );
          break;
        case "display":
          // save comm id and cell id to notebook.metadata
          if ( options.save ) {
            this._save( msg, () => {
              this.render( msg );
            } );
          } else {
            this.render( msg );
          }
          break;
      }
    };

    /**
     * _save
     * save cell index to notebook metadata as a string
     */
    this._save = function( msg, done ) {
      const cell = this._getMsgCell( msg );
      const md = Jupyter.notebook.metadata;
      if ( cell ) {
        if ( !md.react_comms ) {
          md.react_comms = {}
        }
        md.react_comms[ comm.comm_id ] = this._getCellIndex( cell.cell_id ) + '';
      }
      done();
    };

  
    /**
     * render
     * appends the components to the dom
     *
     */
    this.render = function( msg, _newProps ) {
      const newProps = _newProps || props.content.data;
      newProps.cell = this.cell || this._getMsgCell( msg );
      newProps.comm = comm;

      let display;
      const domId = props.content.data.domId;

      if ( domId ) {
        display = document.getElementById( domId );
      } else {
        display = this._outputAreaElement( msg || {} );
      }

      const element = this._createMarkup( options.components[  props.content.data.module ], newProps );
      this._renderToDom( element, display );
    }

    this._renderToDom = function( element, display ){
      options.reactDom.render( element, display );
    }

    /**
     * _getCellIndex
     * gets the index of a cell_id in the notebook json 
     */
    this._getCellIndex = function( cell_id ) {
      let idx;
      Jupyter.notebook.get_cells().forEach( function( c, i){
        if ( c.cell_id === cell_id ) {
          idx = i;
        }
      });
      return idx;
    };

    /**
     * _getMsgCell
     * gets the components cell or 
     *
     */
    this._getMsgCell =  function( msg ) {
      if ( this.cell ) return this.cell;
      const msg_id = msg.parent_header.msg_id;
      this.cell = Jupyter.notebook.get_msg_cell( msg_id );
      this._overrideClearOutput();
      return this.cell;
    };

    /**
     * _createMarkup
     * Create React Elements from components and props 
     *
     */
    this._createMarkup = function( component, cProps ) {
      return options.react.createElement( component, cProps );
    };

    /**
     * _outputAreaElement
     * Get the DOM Element to render to
     *
     */
    this._outputAreaElement = function( msg ) {
      const cell = this._getMsgCell( msg );
      return cell.react_dom.subarea;
    };

    /**
     * _overrideClearOutput
     * Save the original clear_output method and call react_dom.clear()
     * ensures react components are cleared out when clear_display is called
     */
    this._overrideClearOutput = function() {
      this.cell.clear_output = () => {
        Object.getPrototypeOf ( this.cell ).clear_output.call( this.cell )
        this.cell.react_dom.clear();
      };
    }

    if ( this.cell ) {
      this._overrideClearOutput();
    }
    // register message callback
    this.comm.on_msg( this.handleMsg );
    return this;
  };
};
