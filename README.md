# jupyter-react-js

This work makes it possible to build interactive user interfaces inside Jupyter Notebooks with ReactJS. This repo contains a React component manager and a React component base class that can be extended to wrap any generic react component, and should be flexible enough to use any sort of react application pattern (like Flux or Redux).

## Inspiration 

A lot of inspiration for this repo comes from ipywidgets and its front-end javascript nbextension patterns and the way it handles communication between back-end kernels and front-end extensions. The reason this project was started was because we had a need to utilize React components in a Jupyter Notebook and inside other web apps we were building at the time. We wanted to write those components once, but use them in both places. The other motivation is that lots of people are writing, and have written, React components that are generic and can be used as building blocks to larger applications. This work attempts to make that easier to do.


### Jupyter Comms

"Comms" are the primary means by which the Python (back-end) and JS (front-end) communicate. Each component is expected to receive a comm from the back-end when its initialized and can then listen and send messages back and forth on that comm.

## Example 

An example implementation is hosted [here](https://github.com/timbr-io/jupyter-react-example)

## Installation

```
npm install jupyter-react-js
```

## Usage

The usage of Jupyter-React-JS is for building Jupyter Notebook Extensions which typically will require both Python and JS to be written. The structure of such extensions involves creating a python module that can be installed via pip, conda, or setuptools, and packaging a javascript based "nbextension" with that code. Below is a rough example of how a python module (using [Jupyter-React](https://github.com/timbr-io/jupyter-react)) can be used to render a javascript component built with Jupyter-React-js.

### In Python 

```python
# Create a custom module in python 

from jupyter_react import Component 

class MyThing(Component):
    module = 'a_js_module_name'

    def __init__(self, **kwargs):
        super(MyThing, self).__init__(target_name='some.custom.name', **kwargs)
        self.on_msg(self._handle_msg)

    def _handle_msg(self, msg):
        print msg   
```

The above module creates python class that extends from Jupyter-React's Component class. 

## In Javascript

When the above module is invoked in a notebook cell and "displayed" (see below) a Jupyter Comm is opened to the notebooks front-end js. If a matching comm target has been registered on the front-end a "comm_open" handler is triggered, resulting in the rendering of the corresponding component the nbextension in JS.

Jupyter Notebooks are AMD based and relies on `RequireJS` being present within the `load\_ipython\_extension` method in order to call the `init()` method exported by Jupyter-React-JS. This method initializes output areas for react components, and registers target_names for new comms, setting up a handlers that renders the correct JS component.  

```javascript
var JupyterReact = require('jupyter-react-js');

// an object of react components available in your project. 
var components = require('./components');

function load_ipython_extension () {
  requirejs([
      "base/js/namespace",
      "base/js/events",
  ], function( Jupyter, events ) {
      JupyterReact.init( Jupyter, events, "some.custom.name", { components } );
  });
}
```


## In a Notebook

```python
# In Jupyter / IPython instantiate the class and display it

from mything import MyThing
from IPython.display import display

mything = MyThing(props={})
display(mything)
```


## Component Params 

The primary entry point for all jupyter-react-js components is the `JupyterReact.init` method. This method takes 4 params: 
* JUpyter - The primary Jupyter namespace from requirejs
* events - jupyter events object
* target_name - a unique target name for creating jupyter "comms". The target helps direct comm messages via the jupyter kernel's comm_manager. 
* componentParams - an object containing optional params that will be passed to Jupyter-React-Js components. The 'components' key is required and are the actual react components renderable by the comms. Other valid params include:
    * save: whether or not the notebook should remember the component after page refreshes. Defaults to false.
    * element: a DOM element the component should render to. 
