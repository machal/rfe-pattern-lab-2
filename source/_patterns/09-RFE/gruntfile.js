//'use strict';

var fs = require("fs");
var glob = require("glob");

module.exports = function (grunt) {


    grunt.initConfig({
        replace: {
            "replace": {
                src: ['../09-Testing2/*.json'],
                overwrite: true,
                replacements: [{
                    from: "\"nav-type\": \"horizontal\",",
                    to: "\"nav-type\": \"byside\",",
                }, {
                    from: "08-Testing-",
                    to: "09-Testing2-"
                }]
            }
        },
        copy: {
            main: {
                files: [
                  { expand: true, src: ['*.json'], dest: '../09-Testing2/' },
                { expand: true, src: ['*.mustache'], dest: '../09-Testing2/' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');

    //copy listitems for all pages - replace all the particular 00-xxxxx.listitems~language.json by: "_listitems~language.json"
    grunt.registerTask('distribute-listitems', 'copy listitems for all pages', function () {

        var listitemsTemplates = {};
        var listitemsNames = {};


        var files = glob.sync("src/*.json", []);
        console.log("\n\n\n ----- Load Listitems Templates ----- \n\n\n");

        for (i in files) {
            var content = fs.readFileSync(files[i], { encoding: "utf-8" });

            var pages = glob.sync("*.mustache", []);

            for (i in pages) {
                var pageName = pages[i];
                console.log("Process page:" + pageName);

                for (j in files) {
                    //
                    // Create listitems files
                    //
                    var lisitemsTemplateName = files[j]
                    var content = fs.readFileSync(lisitemsTemplateName, { encoding: "utf-8" });
                    var lang = null;

                    if (lisitemsTemplateName.indexOf("~") > -1) {
                        var lang = lisitemsTemplateName.substring(15, lisitemsTemplateName.length - 5);
                    }

                    var listitemsFileName = pageName.substring(0, pageName.length - 9) + ".listitems" + (lang ? "~" + lang : "") + ".json";
                    console.log("    Write file:", listitemsFileName);
                    fs.writeFileSync(listitemsFileName, content, { encoding: 'utf8' });

                }
            }
        }
    });

    // Replace JSON data by templates
    grunt.registerTask('replace-jsons', 'copy listitems for all pages', function () {
        console.log("\n\n\n ----- Load json configurations ----- \n\n\n");


        var configs = glob.sync("*.json", []);

        for (i in configs) {
            var configName = configs[i];


            if (configName.indexOf("listitems") == -1 && configName.indexOf("package.json") == -1) { //no _listitems, just _data
                console.log("Process file:" + configName);

                var newContent = "";
                var lastSection = null;
                fs.readFileSync(configName).toString().split(/\r?\n/).forEach(function (line) {

                    if (line.indexOf("START-GENERATED") > -1) {
                        var temp = line.substring(line.indexOf("START-GENERATED"))
                        lastSection = temp.substring(16, temp.indexOf("\""));
                        newContent += line + '\n';

                    } else if (line.indexOf("END-GENERATED") > -1) {
                        var temp = line.substring(line.indexOf("START-GENERATED"))

                        var lang = null;

                        if (configName.indexOf("~") > -1) {
                            var lang = configName.substring(configName.indexOf("~") + 1, configName.length - 5);
                        }

                        var tmplFile = "src/_" + lastSection + (lang ? "~" + lang : "") + ".tmpl";

                        console.log("    Include file section    ", tmplFile);
                        var data = fs.readFileSync(tmplFile, { encoding: 'utf8' });
                        newContent += data.trim();

                        lastSection = null;
                        newContent += '\n' + line + '\n';

                    } else if (lastSection == null) {
                        newContent += line + '\n';
                    }
                });

                fs.writeFileSync(configName, newContent, { encoding: 'utf8' });

            } //if not listitems
        }
    });

    grunt.registerTask('default', ['distribute-listitems', 'replace-jsons']);
};

