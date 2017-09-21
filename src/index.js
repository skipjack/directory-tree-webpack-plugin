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
        let { dir, path, enhance } = options

        this._options = { dir, path, enhance }

        delete options.dir
        delete options.path
        delete options.enhance

        this._treeOptions = options
    }

    apply(compiler) {
        compiler.plugin('compile', this._buildTree.bind(this))
    }

    /**
     * Construct the tree and write out a JSON file
     * 
     */
    _buildTree() {
        let { dir, path, enhance } = this._options,
            tree = DirectoryTree(dir, this._treeOptions),
            modified = enhance ? this._restructure(tree) : tree,
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
        let allOptions = Object.assign(this._options, this._treeOptions)

        this._options.enhance(item, allOptions)

        if ( item.children ) {
            item.children.forEach(child => {
                this._restructure(child)
            })
        }

        return item
    }
}
