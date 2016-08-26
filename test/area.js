const test = require( 'tape' );
const sinon = require( 'sinon' );
const Area = require( '../src/area' );

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
    const area = new Area( cell );
    
    t.ok( area.area, 'area gets created' );
    t.ok( area.subarea, 'subarea gets created' );
    t.ok( cell.input.after.called , 'cell.input.after gets called' );
    t.end();
});
