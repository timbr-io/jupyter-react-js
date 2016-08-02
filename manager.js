function Manager( kernel ) {
  this.kernel = kernel;
  this.components = {};

  this.register = function( target, Component ) {
    var self = this;
    if ( !this.components[ target ] ) {
      this.components[ target ] = { Component: Component };
      kernel.comm_manager.register_target( target, function ( comm, msg ) {
        if ( msg[ 'msg_type' ] === 'comm_open' ) {
          self.components[ target ][ comm.comm_id ] = self.components[ target ].Component( comm, msg );
        }
      });
    }
    // look for any comms that need to be re-created (page refresh)
    this.kernel.comm_info( target, function( info ) { 
      var comms = Object.keys( info['content']['comms'] );
      if ( comms.length ) {
        comms.forEach( function( comm_id ) {
          if ( Jupyter.notebook.metadata.react_comms && Jupyter.notebook.metadata.react_comms[ comm_id ] ) {
            var cell = self._get_cell( Jupyter.notebook.metadata.react_comms[ comm_id ] );
            if ( cell ) {
              var module = comm_id.split( '.' ).slice( -1 )[ 0 ];
              var newComm = self._create_comm( cell, target, module, comm_id );
              self.components[ target ].Component( 
                newComm, 
                { content: { data: { module: module } } }, 
                cell 
              );
            }
          }
        });
      }
    })
  };

  this._get_cell = function( index ) {
    return Jupyter.notebook.get_cells()[ parseInt(index) ];
  }

  this._create_comm = function( cell, target, module, comm_id ) {
    return this.kernel.comm_manager.new_comm( 
      target,  
      { module: module, props: {} }, 
      cell.get_callbacks(),
      {},
      comm_id 
    );
  }

  return this;
};

module.exports = { 
  ComponentManager: Manager 
};
