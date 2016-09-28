if (window.require) {
    window.require.config({
        map: {
            "*" : {
                "react": "https://unpkg.com/react@15.3.2/dist/react.min.js",
                "react-dom": "https://unpkg.com/react-dom@15.3.2/dist/react-dom.min.js"
            }
        }
    });
}

const Area = require('./area');
const Manager = require('./manager');
const ReactComponent = require('./component');

function init( Jupyter, events, comm_target, component_options ) {

  requirejs([ "react", "react-dom", "services/kernels/comm" ], function( React, ReactDom, Comm ) {
    window.React = React;
    window.ReactDom = ReactDom;
  
    /**
     * handle_kernel 
     * creates an instance of a "Manager" used to listen for new comms and create new components
     */
    const handle_kernel = ( Jupyter, kernel ) => {
      if ( kernel.comm_manager && kernel.component_manager === undefined ) {
        kernel.component_manager = new Manager.ComponentManager( kernel, Comm );
      } 

      if ( kernel.component_manager ) {
        const Component = ReactComponent( component_options );
        kernel.component_manager.register( comm_target, Component ) 
      }
    };

    /**
     * handle_cell 
     * add react dom area for components to render themselves into 
     * @param {object} notebook cell
     */
    // TODO need to handle clear out output calls
    const handle_cell = ( cell ) => {
      if ( cell.cell_type === 'code' ) {
        if ( !cell.react_dom ) {
          cell.react_dom = new Area( cell );
        } else if ( cell.react_dom.clear !== undefined ) {
          cell.react_dom.clear();
        }
      }
    };

    // On new kernel session create new comm managers
    if ( Jupyter.notebook && Jupyter.notebook.kernel ) {
      handle_kernel( Jupyter, Jupyter.notebook.kernel );
    }
    events.on( 'kernel_created.Kernel kernel_created.Session', ( event, data ) => {
      handle_kernel( Jupyter, data.kernel );
    });

    // Create react component areas in cells
    // Each cell in the notebook will have an area 
    // that a component will render itself into
    const cells = Jupyter.notebook.get_cells();
    cells.forEach( cell => {
      handle_cell( cell );
    });

    events.on( 'create.Cell', ( event, data ) => {
      handle_cell( data.cell );
    });

    events.on( 'delete.Cell', ( event, data ) => {
      if ( data.cell && data.cell.react_dom ) {
        data.cell.react_dom.clear();
      }
    });
  });
};

export default {
  Manager,
  ReactComponent,
  Area,
  init
};
