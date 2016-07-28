if (window.require) {
    window.require.config({
        map: {
            "*" : {
                "react": "https://fb.me/react-15.2.1.min.js",
                "react-dom": "https://fb.me/react-dom-15.2.1.min.js"
            }
        }
    });
}

var Area = require('./area');
var Manager = require('./manager');
var ReactComponent = require('./component');

var init = function( Jupyter, events, comm_target, component_options ) {

    requirejs([ "react", "react-dom" ], function( React, ReactDom ) {
        window.React = React;
        window.ReactDom = ReactDom;
    
        /**
         * handle_kernel 
         * creates an instance of a "Manager" used to listen for new comms and create new components
         */
        var handle_kernel = function(Jupyter, kernel) {
          //if ( kernel.comm_manager && !kernel.component_manager ) {
            var Component = ReactComponent( component_options );
            kernel.component_manager = new Manager( comm_target, kernel, Component );
          //}
        };

        /**
         *
         */
        // TODO need to handle clear out output calls
        var handle_cell = function(cell) {
            if (cell.cell_type==='code') {
                cell.react_dom = new Area( cell );
            }
        };

        // On new kernel session create new comm managers
        if (Jupyter.notebook && Jupyter.notebook.kernel) {
            handle_kernel(Jupyter, Jupyter.notebook.kernel);
        }
        events.on('kernel_created.Kernel kernel_created.Session', function(event, data) {
            handle_kernel(Jupyter, data.kernel);
        });

        // Create react component areas in cells
        // Each cell in the notebook will have an area 
        // that a component will render itself into
        var cells = Jupyter.notebook.get_cells();
        cells.forEach( cell => {
            handle_cell( cell );
        });

        events.on( 'create.Cell', function( event, data ) {
            handle_cell( data.cell );
        });

        events.on( 'delete.Cell', function( event, data ) {
            if ( data.cell && data.cell.widgetarea ) {
                data.cell.react_dom.remove();
            }
        });
    });

};

module.exports = {
  Manager,
  ReactComponent,
  Area,
  init
};
