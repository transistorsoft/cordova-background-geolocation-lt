#!/usr/bin/env node

var platformDir = {
  ios: {
        icon: "{$projectName}/Resources/icons",
        screen: "{$projectName}/Resources/splash",
        nameMap: {
            "Icon.png": "Icon.png",
            "Icon@2x.png": "Icon@2x.png",
            
            "Icon-40.png": "Icon-40.png",
            "Icon-40@2x.png": "Icon-40@2x.png",
            
            "Icon-60.png":"Icon-60.png",
            "Icon-60@2x.png":"Icon-60@2x.png",

            "Icon-Small-50.png":"Icon-50.png",
            "Icon-Small-50@2x.png":"Icon-50@2x.png",

            "Icon.png":"Icon.png",
            "Icon@2x.png":"Icon@2x.png",
                        
            "Icon-72.png":"Icon-72.png",
            "Icon-72@2x.png": "Icon-72@2x.png",
            
            "Icon-76.png":"Icon-76.png",
            "Icon-76@2x.png": "Icon-76@2x.png",
            
            "Icon-Small.png": "Icon-Small.png",
            "Icon-Small@2x.png":"Icon-Small@2x.png",
            
            "screen-iphone-portrait.png": "Default~iphone.png",
            "screen-iphone-portrait@2x.png": "Default@2x~iphone.png",
            "screen-iphone-portrait-568h@2x.png": "Default-568h@2x~iphone.png",
            "Default-Portrait~ipad.png": "Default-Portrait~ipad.png",
            "Default-Portrait@2x~ipad.png": "Default-Portrait@2x~ipad.png"
        }
    },
    android: {
        icon:"res/drawable-{$density}",
        screen:"res/drawable-{$density}",
        nameMap: {
            "icon-36-ldpi.png": "icon.png",
            "icon-48-mdpi.png": "icon.png",
            "icon-72-hdpi.png": "icon.png",
            "icon-96-xhdpi.png": "icon.png",
            "screen-ldpi-portrait.png": "ic_launcher.png",
            "screen-mdpi-portrait.png": "ic_launcher.png",
            "screen-hdpi-portrait.png": "ic_launcher.png",
            "screen-xhdpi-portrait.png": "ic_launcher.png"
        }
    },
    blackberry10: {},
    wp7: {},
    wp8: {}
}

var projectName = process.env['PWD'].split('/').pop();

var fs = require ('fs');
var path = require('path');
var platform = process.env.CORDOVA_PLATFORMS;
var platformConfig = platformDir[platform];

var srcRoot = path.join(process.cwd(), 'config', 'res');
var iconSrcPath = path.join(srcRoot, 'icon', platform);
var screenSrcPath = path.join(srcRoot, 'screen', platform);

var destRoot = path.join('platforms', platform);
var iconDestPath = path.join(destRoot, platformDir[platform].icon);
var screenDestPath = path.join(destRoot, platformDir[platform].screen);

fs.readFile("./config.xml", function(err, data) {
    if (err) {
        throw err;
    }
    var m = data.toString().match(/<name>(.*)<\/name>/);
    if (!m) {
        throw "Resource Copier script could not determine proeject name";
    }
    projectName = m[1];
    console.log("- Copying icons and screen", platform);

    copyImages(iconSrcPath, iconDestPath, platformConfig.icon);
    copyImages(screenSrcPath, screenDestPath, platformConfig.screen);

});

/**
* Copy Images
*/
function copyImages(srcPath, destTpl) {

    var re = /-([a-zA-Z]+dpi)/;
    fs.readdir(srcPath, function(err, rs) {
        if (err) {
            console.log('ERROR could not find image dir at ', srcPath);
            return;
        }
        for (var n=0,len=rs.length;n<len;n++) {
            var filename = rs[n];
            if (!platformConfig.nameMap[filename]) {
                continue;
            }
            var sourcePath = path.join(srcPath, filename);
            var m = filename.match(re);
            var density;
            if (m) {
                density = m[1];
            }
            var dict = {
                projectName: projectName,
                density: density
            };
            var destRoot = destTpl.replace (/{\$([^}]+)}/, function (match, p1) {
                return dict[p1];
            });
            var sourceFile = path.join(srcPath, filename);

            var targetFile = path.join(destRoot, platformConfig.nameMap[filename]);

            console.log(filename, '->', targetFile);

            copyFile(sourceFile, targetFile, function() {

            });
        }
    });
}

/**
* copyFile
*/
function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

