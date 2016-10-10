// Base component that handles comm messages and renders components to notebook cell
import React from 'react';
import autobind from 'autobind-decorator';

@autobind
export default class Component extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      renderProps: null,
      components: props.components,
      comm: props.comm,
      comm_msg: props.comm_msg,
      save: props.save
    };
      
    this.state.comm.on_msg( this.handleMsg );
  }

  /**
   * handleMsg 
   * Handle all messages over this comm
   */
  handleMsg( msg ) {
    const { comm_msg, params, save } = this.state;
    const { method, props = {} } = msg.content.data;
    if ( method === "update" ) {
      if ( this.props.on_update ) {
        return options.on_update( comm_msg.content.data.module, props, msg.content.comm_id);
      }
      this.setState( { renderProps: props } );
    } else if ( method === "display" ) {
      if ( save ) {
        this._save( msg, () => {
          this.setState( { renderProps: props } );
        } );
      } else {
        this.setState( { renderProps: props } );
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
    const { renderProps, comm_msg, components } = this.state;
    return ( <div>{ renderProps && comm_msg && React.createElement( components[ comm_msg.content.data.module ], { ...renderProps } ) }</div> );
  };

  /**
   * _getCellIndex
   * gets the index of a cell_id in the notebook json 
   */
  /*this._getCellIndex = function( cell_id ) {
    let idx;
    Jupyter.notebook.get_cells().forEach( function( c, i){
      if ( c.cell_id === cell_id ) {
        idx = i;
      }
    });
    return idx;
  };*/

  /**
   * _getMsgCell
   * gets the components cell or 
   *
   */
  /*this._getMsgCell =  function( msg ) {
    if ( this.cell ) return this.cell;
    const msg_id = msg.parent_header.msg_id;
    this.cell = Jupyter.notebook.get_msg_cell( msg_id );
    this._overrideClearOutput();
    return this.cell;
  };*/

  /**
   * _createMarkup
   * Create React Elements from components and props 
   *
   */
  /*this._createMarkup = function( component, cProps ) {
    return react.createElement( component, cProps );
  };*/

  /**
   * _outputAreaElement
   * Get the DOM Element to render to
   *
   */
  /*this._outputAreaElement = function( msg ) {
    const cell = this._getMsgCell( msg );
    return cell.react_dom.subarea;
  };*/

};
