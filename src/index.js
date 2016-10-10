const Output = require('./output');
const Component = require('./component');

import React from 'react';
import ReactDom from 'react-dom';

export default function init( Jupyter, events, commTarget, componentParams ) {

  requirejs([ "services/kernels/comm" ], function( comm ) {
    /**
     * handle_kernel 
     * registers comm targets with the kernel comm_manager
     * when new comms are open, renders a Parent component that takes over rendering of actual components
     */
    const handle_kernel = ( Jupyter, kernel ) => {
      kernel.comm_manager.register_target( commTarget, ( comm, msg ) => {
        if ( msg[ 'msg_type' ] === 'comm_open' ) {
          const msg_id = msg.parent_header.msg_id;
          const cell = Jupyter.notebook.get_msg_cell( msg_id );
            
          if ( cell.react_output && cell.react_output[ commTarget ] ) {
            const component = React.createElement( Component,  { ...componentParams, comm, comm_msg: msg } );
            ReactDom.render( component, cell.react_output[ commTarget ].subarea );
          }
        }
      });
    };

    /**
     * handle_cell 
     * add react dom area for components to render themselves into 
     * @param {object} notebook cell
     */
    const handle_cell = ( cell ) => {
      if ( cell.cell_type === 'code' ) {
        if ( !cell.react_output ) {
          cell.react_output = {};
        }

        if ( !cell.react_output[ commTarget ] ) {
          cell.react_output[ commTarget ] = new Output( cell );
        } else if ( cell.react_output[ commTarget ].clear !== undefined ) {
          cell.react_output[ commTarget ].clear();
        }

        // override clear_output so react areas get cleared too
        cell.clear_output = () => {
          Object.getPrototypeOf ( cell ).clear_output.call( cell )
          cell.react_output[ commTarget ].clear();
        };
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
      if ( data.cell && data.cell.react_output ) {
        data.cell.react_output[ commTarget ].clear();
      }
    });
  });
};

