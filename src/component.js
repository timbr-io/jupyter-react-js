// Base component that handles comm messages and renders components to notebook cell
import React from 'react';
import autobind from 'autobind-decorator';

const { bool, object } = React.PropTypes;

const propTypes = {
  comm:       object.isRequired,
  comm_msg:   object.isRequired,
  components: object.isRequired,
  save:       bool
};

@autobind
class Component extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      renderProps: null
    };
      
    props.comm.on_msg( this.handleMsg );
  }

  /**
   * handleMsg 
   * Handle all messages over this comm
   */
  handleMsg( msg ) {
    const { comm_msg, save } = this.props;
    const { method, props = {} } = msg.content.data;
    if ( method === "update" ) {
      if ( this.props.on_update ) {
        return this.props.on_update( comm_msg.content.data.module, props, msg.content.comm_id);
      }
      this.setState( { renderProps: { ...props, ...comm_msg.content.data } } );
    } else if ( method === "display" ) {
      //console.log( msg, comm_msg )
      if ( save ) {
        this._save( msg, () => {
          this.setState( { renderProps: { ...props, ...comm_msg.content.data } } );
        } );
      } else {
        this.setState( { renderProps: { ...props, ...comm_msg.content.data } } );
      }
    }
  }

  // saves the index of the cell to the notebook metadata
  // useful for components that want to re-render on page refresh
  _save( msg, done ) {
    const cell = this._getMsgCell( msg );
    const md = Jupyter.notebook.metadata;
    if ( cell ) {
      if ( !md.react_comms ) {
        md.react_comms = {}
      }
      md.react_comms[ comm.comm_id ] = this._getCellIndex( cell.cell_id ) + '';
    }
    done();
  }


  render() {
    const { 
      state: { renderProps },
      props: { 
        comm_msg,
        comm,
        components 
      } 
    } = this;

    return ( 
      <div>
        { renderProps && comm_msg && React.createElement( components[ comm_msg.content.data.module ], { comm, ...renderProps } ) }
      </div>
    );
  };

};

Component.propType = propTypes;

export default Component;
