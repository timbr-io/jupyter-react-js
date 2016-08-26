function Manager( kernel, comm ) {
  this.kernel = kernel;
  this.comm = comm;
  this.components = {};

  this.register = function( target, Component ) {
    const self = this;
    // new targets...
    if ( !this.components[ target ] ) {
      this.components[ target ] = { Component: Component };
      kernel.comm_manager.register_target( target, ( comm, msg ) => {
        if ( msg[ 'msg_type' ] === 'comm_open' ) {
          self.components[ target ][ comm.comm_id ] = self.components[ target ].Component( comm, msg );
        }
      });
    }

    // look for comms that need to be re-created (page refresh)
    this.kernel.comm_info( target, function( info ) { 
      const comms = Object.keys( info[ 'content' ][ 'comms' ] );
      const md = Jupyter.notebook.metadata;
      // TODO
      // pretty nasty right here, confusing to follow
      if ( comms.length ) {
        comms.forEach( comm_id => {
          if ( md.react_comms && md.react_comms[ comm_id ] ) {
            const cell = self._getCell( md.react_comms[ comm_id ] );
            if ( cell ) {
              const module = comm_id.split( '.' ).slice( -1 )[ 0 ];
              const newComm = self._createComm( self.kernel, target, comm_id );
              const newComp = self.components[ target ].Component( 
                newComm,
                { content: { data: { module } } },
                cell
              );
              newComp.render();
              self.components[ target ][ newComm.comm_id ] = newComp;
            }
          }
        });
      }
    })
  };

  this._getCell = function( index ) {
    return Jupyter.notebook.get_cells()[ parseInt(index) ];
  }

  this._createComm = function( kernel, target, comm_id ) {
    const newComm = new this.comm.Comm( target, comm_id );
    kernel.comm_manager.register_comm( newComm );
    return newComm;
  }

  return this;
};

export default { 
  ComponentManager: Manager 
};
