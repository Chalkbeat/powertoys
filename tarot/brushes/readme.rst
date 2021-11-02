Brushes are defined as custom elements. If they have user-configurable inputs, these are set up inside the shadow DOM of the element, and will be available when the element is placed inside the application config form.

When it's time to actually apply a brush, the element's ``draw()`` method will be called with the 2D canvas context as its main argument. Elements should also implement a ``getLayout()`` method that can be used by other elements where layout is dependent on them (e.g., attribution that follows a quote).

In addition to user-facing config, elements may have additional configuration, such as the drawable area they target, specified as attributes on the element. Coordinates in these cases should be normalized, not raw pixels, to allow for different canvas size configurations.