# jupyter-react-js

This work makes it possible to build interactive user interfaces inside Jupyter Notebooks with ReactJS. This repo contains a React component manager and a React component base class that can be extended to wrap any generic react component, and should be flexible enough to use any sort of react application pattern (like Flux or Redux).

## Inspiration 

A lot of inspiration for this repo comes from ipywidgets and its front-end javascript nbextension patterns and the way it handles communication between back-end kernels and front-end extensions. The reason this project was started was because we had a need to utilize React components in a Jupyter Notebook and inside other web apps we were building at the time. We wanted to write those components once, but use them in both places. The other motivation is that lots of people are writing, and have written, React components that are generic and can be used as building blocks to larger applications. This work attempts to make that easier to do.


### Jupyter Comms

"Comms" are the primary means by which the Python (back-end) and JS (front-end) communicate. Each component is expected to receive a comm from the back-end when its initialized and can then listen and send messages back and forth on that comm. 

## Installation

```
npm install jupyter-react-js
```

## Usage

Jupyter Notebooks are AMD based and we rely on `RequireJS` being present within the `load\_ipython\_extension` method in order to call the `init()` method on the JupyterReact. This method initializing output areas for react components, create a component manager (for binding to new comms), and ensures the ReactJS is loaded into the DOM. 

```
var JupyterReact = require('jupyter-react-js');

// an object of react components available in your project. 
var components = require('./components');

function load_ipython_extension () {
  requirejs([
      "base/js/namespace",
      "base/js/events",
  ], function( Jupyter, events, React, ReactDom ) {
      JupyterReact.init( Jupyter, events, "my.comm.target_name", { components } );
  });
}
```

## Documentation 

### Init

### Area 

### Component 
#### Messages Types

### Manager

