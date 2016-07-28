// TODO 
// needs to bind to clear_display calls
// add a "dispose" method that will will wipre all contents, call that on clear_display and cell delete etc.

var Area = function( cell ) {
    var area = document.createElement('div');
    area.classList.add('jupyter-react-area');
    area.classList.add('widget-area');
    area.style.display = 'none';
    this.area = area;

    var _prompt = document.createElement('div');
    _prompt.classList.add('prompt');
    area.appendChild(_prompt);

    var subarea = document.createElement('div');
    subarea.classList.add('jupyter-react-subarea');
    subarea.classList.add('widget-subarea');
    area.appendChild(subarea);

    this.subarea = subarea;

    if (cell.input) {
        cell.input.after(area);
    } else {
        throw new Error('Cell does not have an `input` element.  Is it not a CodeCell?');
    }
};

Area.prototype.clear = function(){ 
    this.subarea.innerHTML = '';
    this.subarea.style.height = '';
    this.area.style.height = '';
    this.area.style.display = 'none';
};



module.exports = Area;
