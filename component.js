// Generic Component that handles comm messages and renders components to notebook cell
export default function Component( comm, props ) {
  var module = props.content.data.module;
  var domId = props.content.data.domId;

  // Handle all messages over this comm
  var handle_msg = function( msg ) {
    var data = msg.content.data;
  };

  // Render the component to either the output cell or given domId
  var _render = function( element, msg ){ 
    var display;
    if ( domId ) {
      display = document.getElementById( domId );
    } else {
      display = _outputAreaElement( msg );
    }
    ReactDom.render( element, display );
  };


  // Create React Elements from components and props 
  var _createMarkup = function( component, cProps ){
    return React.createElement( component, cProps );
  };


  // Get the DOM Element to render to
  var _outputAreaElement = function( msg ) {
    var msg_id = msg.parent_header.msg_id;
    var cell = Jupyter.notebook.get_msg_cell( msg_id );
    return cell.react_dom.widget_subarea;
  }

  // register message callback
  comm.on_msg( handle_msg );
  return this;
};
