import { DirTree } from "../../src/parser/Adapters/DirTreeCreator";
import Tree from "../../src/parser/Tree/Tree";
import YAML from 'yaml';
import { FSEditor } from "../../src/parser/Adapters/FSEditor";

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

        return Tree.instanciateFromJSON(instanceTree);
    }

    treeToYaml(tree: Tree) {
        return YAML.stringify(this.convertToSimpleTree(tree));
    }

    private convertToSimpleTree(tree: Tree): SimpleTree {
        const children = tree.children.map(node => this.convertToSimpleTree(node));

        return { path: tree.path, name: tree.name, type: tree.type, extension: tree.extension, children: children};
    }
}

function convertFoldersToYaml(inputFolder: string, outputFolder: string) {
    const dirTree = new DirTree().treeFrom(inputFolder, /.DS_Store|purge|reject/);
    const treeToYaml = new TreeToYaml();
    const fsEditor = new FSEditor();

    dirTree.children.forEach(child => {
        if (!child.isFolder) return;
        
        const yamlData = treeToYaml.treeToYaml(child);

        fsEditor.writeToFile(`${outputFolder}/${child.name}.yml`, yamlData);
    });
}

convertFoldersToYaml(`${__dirname}/example_folders`, `${__dirname}/generated_folders`);