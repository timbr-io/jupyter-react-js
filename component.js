// Base component that handles comm messages and renders components to notebook cell

module.exports = function Component( options ) {
  return function (comm, props) {
    var module = props.content.data.module;
    var domId = props.content.data.domId;

    // Handle all messages over this comm
    var handle_msg = msg => {
      var data = msg.content.data;

      switch (data.method) {
        case "update":
          if ( options.on_update ) {
            return options.on_update(module, data.props);
          }
          // else re-render
          render_component(msg);
          break;
        case "display":
          render_component(msg);
          break;
      }
    };

    var render_component = function (msg) {
      var msg_id = msg.parent_header.msg_id;
      var cell = Jupyter.notebook.get_msg_cell(msg_id);
      var newProps = props.content.data;
      newProps.cell = cell;
      newProps.comm = comm;
      var element = _createMarkup( options.components[module], newProps );
      _render(element, msg);
    };

    // Render the component to either the output cell or given domId
    var _render = function (element, msg) {
      var display;
      if (domId) {
        display = document.getElementById(domId);
      } else {
        display = _outputAreaElement(msg);
      }
      
      var cell = _getMsgCell( msg );
      cell.react_dom.area.style.display = 'block';
      ReactDom.render(element, display);
    };

    var _getMsgCell = function( mid ) {
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
