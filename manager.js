function Manager( kernel, comm ) {
  this.kernel = kernel;
  this.comm = comm;
  this.components = {};

  this.register = function( target, Component ) {
    var self = this;

    // new targets...
    if ( !this.components[ target ] ) {
      this.components[ target ] = { Component: Component };
      kernel.comm_manager.register_target( target, function ( comm, msg ) {
        if ( msg[ 'msg_type' ] === 'comm_open' ) {
          self.components[ target ][ comm.comm_id ] = self.components[ target ].Component( comm, msg );
        }
      });
    }

    // look for comms that need to be re-created (page refresh)
    this.kernel.comm_info( target, function( info ) { 
      var comms = Object.keys( info['content']['comms'] );
      var md = Jupyter.notebook.metadata;
      if ( comms.length ) {
        comms.forEach( function( comm_id ) {
          if ( md.react_comms && md.react_comms[ comm_id ] ) {
            var cell = self._get_cell( md.react_comms[ comm_id ] );
            if ( cell ) {
              var module = comm_id.split( '.' ).slice( -1 )[ 0 ];
              var newComm = self._create_comm( target, comm_id );
              self.components[ target ][ newComm.comm_id ] = self.components[ target ].Component( 
                newComm, 
                { content: { data: { module: module } } }, 
                cell 
              )
            }
          }
        });
      }
    })
  };

  this._get_cell = function( index ) {
    return Jupyter.notebook.get_cells()[ parseInt(index) ];
  }

  this._create_comm = function( target, comm_id ) {
    var newComm = new this.comm.Comm( target, comm_id );
    Jupyter.notebook.kernel.comm_manager.register_comm( newComm );
    return newComm;
  }

  return this;
};

module.exports = { 
  ComponentManager: Manager 
};
