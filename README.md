# liquidts

This originated as a typescriptification of [harttle/liquidjs][harrtle/liquidjs], itself based on [liquid-node][liquid-node]
and huge thanks are offered breaking the back of implementing liquid in javascript. As I started work, it was obvious
that it wasn't going to remain analogous with the original project, and hence making this a hard fork

The original work, of course, comes from [shopify/liquid][shopify/liquid] - and thanks to them for such a great platform
to work from.

Installation:

```bash
npm install --save liquidts
```

## Rendering

Performance with strings in Node is atrocious, so we try and avoid manipulating them wherever possible. There is a naive
implementation of a "write buffer" in this library that concatenates all writes into an array and then joins it when the
consumer reads it. This is a lot faster than working on a "state" string, but still could be better. The options object
that `.render` accepts as its third argument allows you to pass a `writer: Writeable` in to allow you to implement this
yourself.

## Render from String

Parse and Render:

```javascript
const Liquid = require('liquidts');
const engine = Liquid();

engine.parseAndRender('{{name | capitalize}}', {name: 'alice'})
    .then(output => {
        // output.read() === 'Alice'
    });
```

Caching templates:

```javascript
const tpl = engine.parse('{{name | capitalize}}');
engine.render(tpl, {name: 'alice'})
    .then(output => {
        // output.read() === 'Alice'
    });
```

## Options

The full list of options for `Liquid()` is listed as following:

* `root` is a directory or an array of directories to resolve layouts and includes, as well as the filename passed in when calling `.renderFile()`.
If an array, the files are looked up in the order they occur in the array.
Defaults to `["."]`

* `extname` is used to lookup the template file when filepath doesn't include an extension name. Defaults to `".liquid"`

* `cache` indicates whether or not to cache resolved templates. Defaults to `false`.

* `strictFilters` is used to enable strict filter existence. If set to `false`, undefined filters will be rendered as empty string. Otherwise, undefined filters will cause an exception. Defaults to `false`.

* `strictVariables` is used to enable strict variable derivation.
If set to `false`, undefined variables will be rendered as empty string.
Otherwise, undefined variables will cause an exception. Defaults to `false`.

* `trimRight` is used to strip blank characters (including ` `, `\t`, and `\r`) from the right of tags (`{% %}`) until `\n` (inclusive). Defaults to `false`.

* `trimLeft` is similiar to `trimRight`, whereas the `\n` is exclusive. Defaults to `false`.

* `greedy` is used to specify whether `trimLeft`/`trimRight` is greedy. When set to `true`, all successive blank characters including `\n` will be trimed regardless of line breaks. Defaults to `false`.

## Includes

```
// file: color.liquid
color: '{{ color }}' shape: '{{ shape }}'

// file: theme.liquid
{% assign shape = 'circle' %}
{% include 'color' %}
{% include 'color' with 'red' %}
{% include 'color', color: 'yellow', shape: 'square' %}
```

The output will be:

```
color: '' shape: 'circle'
color: 'red' shape: 'circle'
color: 'yellow' shape: 'square'
```

## Layouts

```
// file: default-layout.liquid
Header
{% block content %}My default content{% endblock %}
Footer

// file: page.liquid
{% layout "default-layout" %}
{% block content %}My page content{% endblock %}
```

The output of `page.liquid`:

```
Header
My page content
Footer
```

* It's possible to define multiple blocks.
* block name is optional when there's only one block.

## Register Filters

```javascript
// Usage: {{ name | uppper }}
engine.registerFilter('upper', function(v){
    return v.toUpperCase();
});
```

> See existing filter implementations: <https://github.com/musicglue/liquidts/blob/master/filters.js>

## Register Tags

```javascript
// Usage: {% upper name%}
engine.registerTag('upper', {
    parse: function(tagToken, remainTokens) {
        this.str = tagToken.args; // name
    },
    render: function(scope, hash) {
        var str = Liquid.evalValue(this.str, scope); // 'alice'
        return Promise.resolve(str.toUpperCase()); // 'Alice'
    }
});
```

> See existing tag implementations: <https://github.com/musicglue/liquidts/blob/master/tags/>

## Contribution Guide

1. Write a test to define the feature you want.
2. File an issue, or optionally:
3. Get your test pass and make a pull request.

[harrtle/liquidjs]: https://github.com/harrtle/liquidjs
[liquid-node]: https://github.com/sirlantis/liquid-node
[shopify/liquid]: https://shopify.github.io/liquid/
[releases]: https://github.com/musicglue/liquidts/releases
