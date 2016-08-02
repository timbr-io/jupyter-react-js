// Base component that handles comm messages and renders components to notebook cell

module.exports = function Component( options ) {
  return function (comm, props, cell) {
    var module = props.content.data.module;
    var domId = props.content.data.domId;

    var _getCellIndex = function( cell_id ) { 
      var idx;
      Jupyter.notebook.get_cells().forEach( function( c, i){
        if ( c.cell_id === cell_id ) {
          idx = i;
        }
      });
      return idx;
    };

    // Handle all messages over this comm
    var handle_msg = msg => {
      var data = msg.content.data;
      switch (data.method) {
        case "update":
          if ( options.on_update ) {
            return options.on_update(module, data.props);
          }
          // else re-render
          render_component( msg );
          break;
        case "display":
          // save comm id and cell id to notebook.metadata
          var cell = Jupyter.notebook.get_msg_cell( msg.parent_header.msg_id );
          if ( cell ) {
            if ( !Jupyter.notebook.metadata.react_comms ) {
              Jupyter.notebook.metadata.react_comms = {}
            }
            Jupyter.notebook.metadata.react_comms[ comm.comm_id ] = _getCellIndex( cell.cell_id ) + '';
          }
          render_component( msg );
          break;
      }
    };

    var render_component = function ( msg ) {
      var newProps = props.content.data;
      newProps.cell = _getMsgCell( msg );;
      newProps.comm = comm;
      var element = _createMarkup( options.components[ module ], newProps );
      _render( element, msg );
    };

    // Render the component to either the output cell or given domId
    var _render = function ( element, msg ) {
      var display;
      if (domId) {
        display = document.getElementById( domId );
      } else {
        display = _outputAreaElement( msg );
      }
      
      var cell = _getMsgCell( msg );
      ReactDom.render( element, display );
    };

    var _getMsgCell = function( msg ) {
      if ( cell ) {
        return cell;
      }
      var msg_id = msg.parent_header.msg_id;
      return Jupyter.notebook.get_msg_cell( msg_id );
    };

    // Create React Elements from components and props 
    var _createMarkup = function (component, cProps) {
      return React.createElement(component, cProps);
    };

    // Get the DOM Element to render to
    var _outputAreaElement = function (msg) {
      var cell = _getMsgCell( msg );
      return cell.react_dom.subarea;
    };

    // register message callback
    comm.on_msg(handle_msg);
    return this;
  };
};
