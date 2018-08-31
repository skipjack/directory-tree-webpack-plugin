// Import External Dependencies
const FS = require('fs')
const DirectoryTree = require('directory-tree')

/**
 * Generate a json tree representing a directory
 * 
 * @type  {class}
 * @param {object} options - ...
 */
module.exports = class DirectoryTreePlugin {
    constructor(options) {
        let { dir, path, enhance, filter, sort } = options

        this._options = { dir, path, enhance, filter, sort }

        delete options.dir
        delete options.path
        delete options.enhance
        delete options.filter
        delete options.sort

        this._treeOptions = options
    }

    apply(compiler) {
        compiler.hooks.compile.tap('DirectoryTreeWebpackPlugin', this._buildTree.bind(this))
    }

    /**
     * Construct the tree and write out a JSON file
     * 
     */
    _buildTree() {
        let { dir, path, enhance, filter, sort } = this._options,
            tree = DirectoryTree(dir, this._treeOptions),
            shouldRestructure = !!enhance || !!filter || !!sort,
            modified = shouldRestructure ? this._restructure(tree) : tree,
            json = JSON.stringify(modified),
            current = FS.existsSync(path) ? FS.readFileSync(path, { encoding: 'utf8' }) : ''

        if (json !== current) {
            FS.writeFile(path, json, error => {
                if (error) {
                    console.error('\r\n\r\nFailure building directory tree: ', error, '\r\n\r\n')
                }
            })
        }
    }

    /**
     * Enhance the given `item` and recursively enhance children
     * 
     * @param  {object} item - The structure to enhance
     * @return {object}      - An enhanced `tree` structure
     */
    _restructure(item) {
        let { enhance, filter, sort } = this._options,
            allOptions = Object.assign(this._options, this._treeOptions)

        if ( enhance ) enhance(item, allOptions)

        if ( item.children ) {
            item.children.forEach(child => {
                this._restructure(child)
            })

            if ( filter ) item.children = item.children.filter(filter)
            if ( sort ) item.children = item.children.sort(sort)
        }

        return item
    }
}
