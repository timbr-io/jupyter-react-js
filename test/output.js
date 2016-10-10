const test = require( 'tape' );
const sinon = require( 'sinon' );
const Output = require( '../src/output' );

global.document = { 
  createElement: sinon.stub().returns( {
    appendChild: function() {},
    classList: {
      add: function() {}
    } 
  }) 
};

const cell = {
  input: {
    after: sinon.stub()
  }
}

test('create a new area', function (t) {
    const output = new Output( cell );
    
    t.ok( output.area, 'area gets created' );
    t.ok( output.subarea, 'subarea gets created' );
    t.ok( cell.input.after.called , 'cell.input.after gets called' );
    t.end();
});
