Component URL Rewrite
=====================
A collection of component plugins to rewrite CSS


Supported re-writers
--------------------
* base64: will rewrite all known CSS `url('')` directives to their `url(data:type;base64,base64String)` counterparts.
Known assets are the assets which are found in the given asset paths. Check examples below for more information.


Installation
------------
```
npm install component-urlrewrite
```


base64 Example
--------------
```
var base64Rewrite = require('component-urlrewrite/base64');

base64Rewrite.configure([{
	path: './path/to/your/asset/folder',
	url: '/url/path/representing/above/asset/folder'
}]);
builder.use(base64Rewrite.hook);
```


License
-------
Component Hint is distributed under the `MIT` License.