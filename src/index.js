const Output = require('./output');
const Component = require('./component');

import React from 'react';
import ReactDom from 'react-dom';

function createOutputArea( cell, target ) {
  if ( !cell.react_output ) {
    cell.react_output = {};
  }

  if ( !cell.react_output[ target ] ) {
    cell.react_output[ target ] = new Output( cell );
  }

  // override clear_output so react areas get cleared too
  cell.clear_output = () => {
    Object.getPrototypeOf ( cell ).clear_output.call( cell )
    cell.react_output[ target ].clear();
  };
}

function init( Jupyter, events, commTarget, componentParams ) {

  requirejs([ "services/kernels/comm" ], function( Comm ) {
    /**
     * handle_kernel 
     * registers comm targets with the kernel comm_manager
     * when new comms are open, renders a Parent component that takes over rendering of actual components
     */
    const handle_kernel = ( Jupyter, kernel ) => {
      // register the target comm / listens for new comms 
      kernel.comm_manager.register_target( commTarget, ( comm, msg ) => {
        if ( msg[ 'msg_type' ] === 'comm_open' ) {
          const msg_id = msg.parent_header.msg_id;
          const cell = Jupyter.notebook.get_msg_cell( msg_id );
          const component = React.createElement( Component,  { ...componentParams, comm, comm_msg: msg } );
          if ( !componentParams.element ) {
            createOutputArea( cell, commTarget );
            if ( cell.react_output && cell.react_output[ commTarget ] ) {
              ReactDom.render( component, cell.react_output[ commTarget ].subarea );
            }
          } else {
            ReactDom.render( component, componentParams.element ); 
          }
        }
      });

      // find any open comms and render components 
      kernel.comm_info( commTarget, commInfo => {
        const comms = Object.keys( commInfo[ 'content' ][ 'comms' ] );
        const md = Jupyter.notebook.metadata;

        if ( comms.length && md.react_comms ) {
          comms
            .filter( c => md.react_comms[ c.comm_id ] && c )
            .forEach( id => {
              const cell = Jupyter.notebook.get_cells()[ parseInt( md.react_comms[ id ] ) ];
              if ( cell ) {
                const module = id.split( '.' ).slice( -1 )[ 0 ];
                const newComm = new Comm.Comm( commTarget, id );
                kernel.comm_manager.register_comm( newComm );
                createOutputArea( cell, commTarget );

                const component = React.createElement( Component,  { ...componentParams, comm: newComm, comm_msg: { content: { data: { module } } } } );
                ReactDom.render( component, cell.react_output[ commTarget ].subarea );
              }
            });
        }
    })
    };

    // On new kernel session create new comm managers
    if ( Jupyter.notebook && Jupyter.notebook.kernel ) {
      handle_kernel( Jupyter, Jupyter.notebook.kernel );
    }
    events.on( 'kernel_created.Kernel kernel_created.Session', ( event, data ) => {
      handle_kernel( Jupyter, data.kernel );
    });

    events.on( 'delete.Cell', ( event, data ) => {
      if ( data.cell && data.cell.react_output ) {
        data.cell.react_output[ commTarget ].clear();
      }
    });
  });
};


export default { init };
