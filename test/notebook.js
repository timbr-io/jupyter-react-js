const sinon = require( 'sinon' );

function Notebook( metadata ) {

  function Cell() {
    return {
      cell_id: '1',
      react_dom: {
        subarea: {},
        clear: sinon.stub()
      },
      output_area: sinon.stub()
    }
  }

  global.Jupyter = {
    notebook: {
      metadata,
      get_cells: sinon.stub().returns( [{ cell_id: '1' }] ),
      get_msg_cell: sinon.stub().returns( Cell() )
    }
  };

  return { Cell };

};

export default Notebook;
