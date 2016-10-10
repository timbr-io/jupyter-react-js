import React from 'react';
import Component from './component';

const { object, string } = React.PropTypes;

const propTypes = {
  kernel:          object.isRequired,
  comm:            object.isRequired,
  commTarget:      string.isRequired,
  componentParams: object.isRequired
};

class Manager extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      components: {}
    }
  }

  componentWillMount() {
    const { commTarget, kernel } = this.props;
    kernel.comm_manager.register_target( commTarget, ( comm, msg ) => {
      if ( msg[ 'msg_type' ] === 'comm_open' ) {
        this.setState( { components: { ...this.state.components, [ comm.comm_id ]: { comm, msg } } } );
        //self.components[ target ][ comm.comm_id ] = self.components[ target ].Component( comm, msg );
      }
    });
  }

  /*  // look for comms that need to be re-created (page refresh)
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
  };*/

  _getCell = function( index ) {
    return Jupyter.notebook.get_cells()[ parseInt(index) ];
  }

  _createComm = function( kernel, target, comm_id ) {
    const newComm = new this.comm.Comm( target, comm_id );
    kernel.comm_manager.register_comm( newComm );
    return newComm;
  }

  _buildComponents() {
    const { components } = this.state;
    return Object.keys( components ).map( commId => {
      return <Component key={ commId } { ...components[ commId ] } { ...this.props.componentParams } />
    })
  }

  render() {
    return (
      <div>{ this._buildComponents() }</div>
    );
  }
};

Manager.propTypes = propTypes;

export default Manager;
