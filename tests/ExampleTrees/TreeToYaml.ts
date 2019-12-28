import Tree from "../../src/parser/Tree/Tree";
import YAML from 'yaml';

/**
 * The purpose of this file is to generate YAML files from directories 
 * so that those YAML files can be used in mock stubs
 */
type SimpleTree = {
    path: string;
    name: string;
    type: string;
    extension?: string;
    children: SimpleTree[];
};

export default class TreeToYaml {

    yamlDataToTree(data: string) {
        const instanceTree = YAML.parse(data) as Tree;

        return Tree.appendMissingMethodsTo(instanceTree);
    }

    treeToYaml(tree: Tree) {
        return YAML.stringify(this.convertToSimpleTree(tree));
    }

    private convertToSimpleTree(tree: Tree): SimpleTree {
        const children = tree.children.map(node => this.convertToSimpleTree(node));

        return { path: tree.path, name: tree.name, type: tree.type, extension: tree.extension, children: children};
    }
}
