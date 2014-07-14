Component URL To Base64
=======================
A component plugin to rewrite all known CSS `url('')` directives to their `url(data:type;base64,base64String)`
counterparts. Known assets are the assets which are found in the given asset paths. Check examples below for more
information.


Installation
------------
```
npm install component-url2base64
```


Example
-------
```
var url2base64 = require('component-url2base64');

url2base64.configure([{
	path: './path/to/your/asset/folder',
	url: '/url/path/representing/above/asset/folder'
}]);
builder.use(url2base64.hook);
```


License
-------
component-url2base64 is distributed under the `MIT` License.