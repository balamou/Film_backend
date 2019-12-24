import { DirectoryTreeCreator } from '../../src/parser/Adapters/DirTreeCreator';
import Tree from "../../src/parser/Tree/Tree";
import { FSEditor } from '../../src/parser/Adapters/FSEditor';
import TreeToYaml from '../ExampleTrees/TreeToYaml';
import Path from 'path';

export default class MockDirTreeCreator implements DirectoryTreeCreator {
    
    treeFrom(path: string, exclude?: RegExp): Tree {
        const fsEditor = new FSEditor();
        const treeToYaml = new TreeToYaml();

        const filePath = Path.join(__dirname, `../ExampleTrees/generated_folders/${path}.yml`);
        const yamlData = fsEditor.readFile(filePath);
        return treeToYaml.yamlDataToTree(yamlData);
    }

}