const test = require( 'tape' );
const sinon = require( 'sinon' );
const Manager = require( '../src/manager' );

const Notebook = require( './notebook' );
const notebook = new Notebook( { react_comms: { 'id.module': '0' } } );

const Kernel = {
  comm_manager: {
    register_comm: sinon.stub(),
    register_target: function( target, callback ){
      callback( {}, { 'msg_type': 'comm_open' } );
    }
  },
  comm_info: function( info, callback ) {
    callback( { content: { comms: { comm_id: 'id.module' } } });
  }
};
const Comm = { 
  Comm: sinon.stub().returns( { comm_id: 'id.module' } )
}


sinon.spy( Kernel.comm_manager, 'register_target' );

const manager = Manager.ComponentManager( Kernel, Comm );
sinon.spy( manager, '_getCell' );
sinon.spy( manager, '_createComm' );
    
const Component = function() { 
  return { render: sinon.stub() };
};

test('register', function (t) {
    manager.register( 'test', Component );
    t.ok(Kernel.comm_manager.register_target.called, 'kernel register_target was called');
    t.end();
});

test('register with open comms', function (t) {
    Kernel.comm_info = function( info, callback ) {
      callback( { content: { comms: { 'id.module': {} } } } );
    }

    const target = 'test';
    manager.register( target, Component );

    t.ok(Kernel.comm_manager.register_target.called, 'kernel register_target was called');
    t.ok(manager._getCell.called, 'getCell was called');
    t.ok(manager._createComm.called, 'create cell was called');
    t.ok( manager.components[ target ][ 'id.module' ], 'Component for existing comm is registered in manager.components' );
    
    t.end();
});
