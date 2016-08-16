// Base component that handles comm messages and renders components to notebook cell

module.exports = function Component( options ) {
  return function (comm, props, cell) {
    this.cell = cell;
    this.comm = comm;
    this.module = props.content.data.module;
    this.domId = props.content.data.domId;

    // Handle all messages over this comm
    this.handleMsg = msg => {
      var data = msg.content.data;
      switch (data.method) {
        case "update":
          if ( options.on_update ) {
            return options.on_update(this.module, data.props, msg.content.comm_id);
          }
          // else re-render
          this.renderComponent( msg, data.props );
          break;
        case "display":
          // save comm id and cell id to notebook.metadata
          this._saveComponent( msg );
          break;
      }
    };

    // save cell index to notebook metadata as a string
    this._saveComponent = function( msg ) {
      var cell = this._getMsgCell( msg );
      var md = Jupyter.notebook.metadata;
      if ( cell ) {
        if ( !md.react_comms ) {
          md.react_comms = {}
        }
        md.react_comms[ comm.comm_id ] = this._getCellIndex( cell.cell_id ) + '';
      }
      this.renderComponent( msg );
    };

    // create reacte element and call _render 
    this.renderComponent = function( msg, newProps ) {
      newProps = newProps || props.content.data;
      newProps.cell = this._getMsgCell( msg );
      newProps.comm = comm;
      var element = this._createMarkup( options.components[ this.module ], newProps );
      this._render( element, msg );
    };

    // Render the component to either the output cell or given domId
    this._render = function( element, msg ) {
      var display;
      if ( this.domId ) {
        display = document.getElementById( this.domId );
      } else {
        display = this._outputAreaElement( msg );
      }
      ReactDom.render( element, display );
    };

    this.render = function( ) {
      var newProps = props.content.data;
      newProps.cell = this.cell;
      newProps.comm = comm;
      var element = this._createMarkup( options.components[ this.module ], newProps );
      this._render( element, {} );
    }

    this._getCellIndex = function( cell_id ) {
      var idx;
      Jupyter.notebook.get_cells().forEach( function( c, i){
        if ( c.cell_id === cell_id ) {
          idx = i;
        }
      });
      return idx;
    };

    // gets the components cell or 
    this._getMsgCell =  function( msg ) {
      if ( this.cell ) return this.cell;
      var msg_id = msg.parent_header.msg_id;
      this.cell = Jupyter.notebook.get_msg_cell( msg_id );
      return this.cell;
    };

    // Create React Elements from components and props 
    this._createMarkup = function( component, cProps ) {
      return React.createElement( component, cProps );
    };

    // Get the DOM Element to render to
    this._outputAreaElement = function( msg ) {
      var cell = this._getMsgCell( msg );
      return cell.react_dom.subarea;
    };

    // register message callback
    this.comm.on_msg( this.handleMsg );
    return this;
  };
};
