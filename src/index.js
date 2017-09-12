// Import External Dependencies
const Path = require('path')
const FS = require('fs')
const FrontMatter = require('front-matter')
const DirectoryTree = require('directory-tree')

/**
 * Generate a json tree representing a directory
 * 
 * @type  {class}
 * @param {object} options - ...
 */
module.exports = class DirectoryTreePlugin {
    constructor(options) {
        let { dir, path } = options

        this._options = { dir, path }

        delete options.dir
        delete options.path

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
        let { dir, path } = this._options,
            tree = DirectoryTree(dir, this._treeOptions),
            modified = this._restructure(tree),
            json = JSON.stringify(modified),
            current = FS.existsSync(json) ? FS.readFileSync(path, { encoding: 'utf8' }) : ''

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
        let { dir } = this._options,
            base = Path.dirname(item.path).replace('src/content', ''),
            isDirectory = item.type === 'directory',
            fmFilePath = isDirectory ? `${item.path}/index.md` : item.path,
            frontmatter = FS.existsSync(fmFilePath) ? FrontMatter(
                FS.readFileSync(fmFilePath, { encoding: 'utf8' })
            ) : null

        item.name = Path.basename(item.path, '.md')
        item.path = `${base}/${item.name}`
        item.depth = item.path.split('/').length - 1

        // Set `attributes` based on frontmatter
        if ( frontmatter !== null ) {
            item.attributes = isDirectory ? frontmatter.attributes.directory : frontmatter.attributes

        } else item.attributes = {}

        // Include `indexPath` for index pages
        if ( item.name === 'index' ) {
            item.indexPath = base || '/'
        }

        // Recurse through children
        if ( item.children ) {
            item.children.forEach(child => {
                this._restructure(child)
            })
        }

        return item
    }
}
