# Directory Tree Plugin

This plugin allows you to generate a JSON representation of a directory and all
its child nodes (files and folders). It uses the fantastic [directory-tree][1]
package, which does the majority of the work.

Install the plugin via NPM:

``` bash
npm i --save-dev directory-tree-webpack-plugin
```


## Usage

This plugin is particularly useful when using [dynamic `import()`][2] statements
as you can get a mapping of all the items in the `import(...)` location. For example,
let's say we wanted to dynamically `import()` all `*.md` pages within a content 
directory:

__project__

``` diff
demo
|- package.json
|- webpack.config.js
|- /src
  |- index.js
  |- /content
    |- index.md
    |- about.md
    |- contact.md
```

__webpack.config.js__

``` js
const Path = require('path')
const DirectoryTreePlugin = require('directory-tree-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  plugins: [
    new DirectoryTreePlugin({
      dir: './src/content',
      path: './src/_content.json',
      extensions: /\.md/
    })
  ],
  module: {
    rules: [
      {
        test: /\.md/,
        use: [
          'html-loader',
          'markdown-loader'
        ]
      }
    ]
  },
  output: {
    path: Path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
```

__src/index.js__

``` js
import ContentTree from './_content.json'

ContentTree.children.forEach(page => {
  import(`./content/${item.path}.md`)
    .then(body => {
      console.log('The page object can be used to generate routes, build navigations, and more...')
      console.log(page)
      console.log('The body string can be rendered when needed...')
      console.log(body)
    })
    .catch(error => console.error('Failed to load page!'))
})
```

> Note that the example above uses promises and arrow functions. In a real app, you
> would likely polyfill these ES6+ features to ensure they work on older browsers.


## Options

The following options can be passed to the plugin:

- `dir` (string): A path to the directory that should be mapped.
- `path` (string): The path to and filename of the JSON file to create.

All the remaining options are passed to the `directory-tree` package. See that
package's [documentation][1] for a listing of all available options.

> TODO: There is also a rather opinionated recursive enhancer method that takes
> the output of `directory-tree` and enhances it with YAML frontmatter and such.
> We should probably extract the opinionated bits to an `enhance` method that is
> passed as an option.


[1]: https://github.com/mihneadb/node-directory-tree
[2]: https://webpack.js.org/api/module-methods/#import-