/**
 * Output
 * defines an output area for a code cell where react components will render themselves into
 * 
 * @param {object} cell - a notebook cell to append react component areas to.
 */
function Output( cell ) {

    this.clear = () => {
      this.subarea.innerHTML = '';      
    };

    const area = document.createElement( 'div' );
    area.classList.add( 'jupyter-react-area' );
    area.classList.add( 'widget-area' );
    this.area = area;

    const _prompt = document.createElement( 'div' );
    _prompt.classList.add( 'prompt' );
    area.appendChild( _prompt );

    const subarea = document.createElement( 'div' );
    subarea.classList.add( 'jupyter-react-subarea' );
    subarea.classList.add( 'widget-subarea' );
    area.appendChild( subarea );

    this.subarea = subarea;

    if ( cell.input ) {
      cell.input.after( area );
    }

    return this;
};


export default Output;
