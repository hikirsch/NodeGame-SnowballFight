({
	//The top level directory that contains your app. If this option is used
	//then it assumed your scripts are in a subdirectory under this path.
	//This option is not required. If it is not specified, then baseUrl
	//below is the anchor point for finding things. If this option is specified,
	//then all the files from the app directory will be copied to the dir:
	//output area, and baseUrl will assume to be a relative path under
	//this directory.
	appDir: "src",

	//By default, all modules are located relative to this path. If baseUrl
	//is not explicitly set, then all modules are loaded relative to
	//the directory that holds the build file.
	baseUrl: "js/",

	//The directory path to save the output. If not specified, then
	//the path will default to be a directory called "build" as a sibling
	//to the build file. All relative paths are relative to the build file.
	dir: "src-built",

	//How to optimize all the JS files in the build output directory.
	//Right now only the following values
	//are supported (default is to not do any optimization):
	//- "closure": uses Google's Closure Compiler in simple optimization
	//mode to minify the code.
	//- "closure.keepLines": Same as closure option, but keeps line returns
	//in the minified files.
	//- "none": no minification will be done.
	optimize: "closure",

	//Allow CSS optimizations. Allowed values:
	//- "standard": @import inlining, comment removal and line returns.
	//Removing line returns may have problems in IE, depending on the type
	//of CSS.
	//- "standard.keepLines": like "standard" but keeps line returns.
	//- "none": skip CSS optimizations.
	optimizeCss: "standard",

	//If optimizeCss is in use, a list of of files to ignore for the @import
	//inlining. The value of this option should be a comma separated list
	//of CSS file names to ignore. The file names should match whatever
	//strings are used in the @import calls.
	cssImportIgnore: null,

	//Inlines the text for any text! dependencies, to avoid the separate
	//async XMLHttpRequest calls to load those dependencies.
	inlineText: true,

	//Allow "use strict"; be included in the RequireJS files.
	//Default is false because there are not many browsers that can properly
	//process and give errors on code for ES5 strict mode,
	//and there is a lot of legacy code that will not work in strict mode.
	useStrict: false,

	//Specify build pragmas. If the source files contain comments like so:
	//>>excludeStart("fooExclude", pragmas.fooExclude);
	//>>excludeEnd("fooExclude");
	//Then the comments that start with //>> are the build pragmas.
	//excludeStart/excludeEnd and includeStart/includeEnd work, and the
	//the pragmas value to the includeStart or excludeStart lines
	//is evaluated to see if the code between the Start and End pragma
	//lines should be included or excluded.
	pragmas: {
		//Indicates require will be included with jquery.
		jquery: true
	},

	//Skip processing for pragmas.
	skipPragmas: false,

	//If skipModuleInsertion is false, then files that do not use require.def
	//to define modules will get a require.def() placeholder inserted for them.
	//Also, require.pause/resume calls will be inserted.
	//Set it to true to avoid this. This is useful if you are building code that
	//does not use require() in the built project or in the JS files, but you
	//still want to use the optimization tool from RequireJS to concatenate modules
	//together.
	skipModuleInsertion: false,

	//List the modules that will be optimized. All their immediate and deep
	//dependencies will be included in the module's file when the build is
	//done. If that module or any of its dependencies includes i18n bundles,
	//only the root bundles will be included unless the locale: section is set above.
	modules: [
		//Just specifying a module name means that module will be converted into
		//a built file that contains all of its dependencies. If that module or any
		//of its dependencies includes i18n bundles, they may not be included in the
		//built file unless the locale: section is set above.
		{
			name: "main-client",

			//Should the contents of require.js be included in the optimized module.
			//Defaults to false.
			includeRequire: true,

			//For build profiles that contain more than one modules entry,
			//allow overrides for the properties that set for the whole build,
			//for example a different set of pragmas for this module.
			//The override's value is an object that can
			//contain any of the other build options in this file.
			override: { }
		}
	]
})