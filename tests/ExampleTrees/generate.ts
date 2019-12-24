import { DirTree } from "../../src/parser/Adapters/DirTreeCreator";
import { FSEditor } from "../../src/parser/Adapters/FSEditor";
import TreeToYaml from "./TreeToYaml";

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