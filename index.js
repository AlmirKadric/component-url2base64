var async = require('async');
var mime = require('mime');
var path = require('path');
var fs = require('fs');


/**
 * Array of assetPath objects. The object should contain 2 properties:
 *  - path: asset path on the filesystem
 *  - baseUrl: the http url map of the asset path above
 * @type Array(Object)
 */
var assetPaths = [];


exports.configure = function (_assetPaths) {
	assetPaths = _assetPaths;
};


function getBuilderFile(builder, file, cb) {
	var cache = builder._files[file];
	if (cache) {
		return cb(null, cache);
	}

	var stylesheet = builder.path(file);
	fs.readFile(stylesheet, 'utf8', function (error, data) {
		if (error) {
			return cb(error);
		}

		return cb(null, data);
	});
}


function recursiveReadDir(readPath, cb) {
	var assets = {};

	fs.readdir(readPath, function (error, files) {
		if (error) {
			return cb(error);
		}

		async.eachSeries(files, function (file, callback) {
			var assetFile = path.join(readPath, file);
			fs.stat(assetFile, function (error, stat) {
				if (error) {
					return callback(error);
				}

				if (!stat.isDirectory()) {
					fs.readFile(assetFile, function (error, data) {
						if (error) {
							return callback(error);
						}

						assets[assetFile] = data;
						return callback();
					});
					return;
				}

				getKnownAssets(assetFile, function (error, recursiveAssets) {
					if (error) {
						return callback(error);
					}

					for (var assetName in recursiveAssets) {
						if (!recursiveAssets.hasOwnProperty(assetName)) {
							continue;
						}
						assets[assetName] = recursiveAssets[assetName];
					}

					return callback();
				});
			});
		}, function (error) {
			if (error) {
				return cb(error);
			}

			return cb(null, assets);
		});
	});
}


function getKnownAssets(cb) {
	var knownAssets = {};

	async.each(assetPaths, function (assetPath, callback) {
		recursiveReadDir(assetPath.path, function (error, assets) {
			if (error) {
				return callback(error);
			}

			for (var filename in assets) {
				if (!assets.hasOwnProperty(filename)) {
					continue;
				}

				var relativeFilename = path.relative(assetPath.path, filename);
				var url = path.join(assetPath.url, relativeFilename);
				knownAssets[url] = assets[filename];
			}

			return callback();
		});
	}, function (error) {
		if (error) {
			return cb(error);
		}

		return cb(null, knownAssets);
	});
}


exports.hook = function (builder, options) {
	options = options || {};

	builder.hook('before styles', function (builder, callback) {
		if (!builder.config.styles) {
			return callback();
		}

		getKnownAssets(function (error, assetFiles) {
			if (error) {
				return callback(error);
			}

			async.each(builder.config.styles.slice(0), function (file, cb) {
				getBuilderFile(builder, file, function (error, fileData) {
					if (error) {
						return cb(error);
					}

					for (var assetUrl in assetFiles) {
						if (!assetFiles.hasOwnProperty(assetUrl)) {
							continue;
						}

						var mimeType = mime.lookup(path.extname(assetUrl));
						var base64String = assetFiles[assetUrl].toString('base64');

						// Replace all occurences of URL with base64 data url
						var urlRegex = new RegExp("url\\('" + assetUrl + "'\\)", 'g');
						fileData = fileData.replace(urlRegex, 'url(data:' + mimeType + ';base64,' + base64String + ')');
					}

					builder.removeFile('styles', file);
					builder.addFile('styles', file, fileData);

					return cb();
				});
			}, callback);
		});
	});
};
