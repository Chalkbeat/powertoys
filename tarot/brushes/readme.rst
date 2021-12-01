Brushes are defined as custom elements. If they have user-configurable inputs, these are set up inside the shadow DOM of the element, and will be available when the element is placed inside the application config form.

In addition to user-facing config, elements may have additional configuration, such as the drawable area they target, specified as attributes on the element. Coordinates in these cases should be normalized, not raw pixels, to allow for different canvas size configurations.

Your brush subclass should implement the following:

* ``getLayout(context)`` - return a ``DOMRect``, with additional properties as necessary, that represents the pixel layout coordinates for your component when rendered. This should be stateless--other components may call ``getLayout`` repeatedly in order to perform their own layout or rendering.
* ``draw(context, config)`` - render the component to the 2D rendering context. The config object may include the chosen theme name, which you can use when calling ``getThemed()`` and ``getThemedRGB()`` from ``../defs.js``.
* ``get alt()`` - if your component can be represented in the alt text for the social card, you should return a text value here to be presented in the main UI.
* ``persist()`` and ``restore(value)`` - these paired functions are used to autofill values when the template is changed. Components that want to persist across templates must have an ID, and should return the saved value for ``persist()``, which will normally be called during component disconnect. ``restore()`` will be called when the incoming component is connected, with the value that was saved from any matching ID in the outgoing template.

The Brush superclass also provides these methods:

* ``invalidate()`` - send a signal requesting re-render to the main application. You can call this repeatedly, and it'll be debounced.
* ``denormalize(canvas, [x, y])`` - Given a canvas and a pair of normalized (i.e., from 0 to 1) coordinates, returns the corresponding pixel-space coordinates.