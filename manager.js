function Manager( target, kernel, Component ) {
    //this.components = {};
    kernel.comm_manager.register_target( target, function( comm, msg ) {
      if ( msg['msg_type'] === 'comm_open' ) {
        //this.components[ comm.comm_id ] = new Component( comm, msg );
        new Component( comm, msg );
      }
    });
    return this;
};

export default Manager;
