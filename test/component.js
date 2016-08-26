const test = require( 'tape' );
const sinon = require( 'sinon' );
const ComponentFactory = require( '../src/component' );
const Notebook = require( './notebook' );

const metadata = {}
const notebook = new Notebook( metadata );

const options = {
  components: {
    module: {}
  }
};
    
const comm = {
  comm_id: 'id.module',
  on_msg: sinon.stub()
}

const props = {
  content: { 
    data: { 
      module: 'module'
    }
  }
}

function stubComponent( component ) {
  component._createMarkup = sinon.stub();
  component._renderToDom = sinon.stub();
}

test('create a new component and display', function (t) {
    const Component = ComponentFactory( options );
    const component = new Component( comm, props );

    stubComponent( component );

    component.handleMsg( {
      parent_header: { msg_id: '123' },
      content: {
        data: { method: 'display' }
      }
    } ); 
    t.ok( component.comm.on_msg.called, 'on msg called on init' );
    t.ok( component._createMarkup.called, 'createMarkup called' );
    t.ok( component._renderToDom.called, 'renderToDom called' );
    t.ok( Jupyter.notebook.metadata.react_comms['id.module'], 'id.module is saved in notebook metadata' )
    t.end();
});

test('create a new component and update', function (t) {
    options.on_update = sinon.stub();
    const Component = ComponentFactory( options );
    const component = new Component( comm, props );

    stubComponent( component );

    component.handleMsg( {
      parent_header: { msg_id: '123' },
      content: {
        data: { method: 'update', props: {}, comm_id: 'id.module' }
      }
    } );
    t.ok( component.comm.on_msg.called, 'on msg called on init' );
    t.ok( options.on_update.called, 'on update called' );
    t.end();
});
