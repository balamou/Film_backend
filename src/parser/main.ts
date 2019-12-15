import { FSEditor } from './Adapters/FSEditor';
import { getDirTree } from './Adapters/DirTreeCreator';
import Factory from './Factory';
import Tree from './Tree';

const factory = new Factory();

export default function main() {
    const fs = new FSEditor();
    const path = './public/en/shows';

    if (fs.doesFileExist(`${path}/film.config`)) {
        // Parse file and create a json Tree

    } else {
        // orginize folder
        const tree = getDirTree(path, /.DS_Store/);
        console.log(tree);

        const folders = new Array<Tree>(); // 
        const files = new Array<Tree>(); // moves files to new folder purge

        tree.levelOrderTraversal((node, level) => {
            if (level == 1 && node.isFolder)
                folders.push(node);
            
            if (level == 1 && node.isFile) 
                files.push(node);
        });

        folders.forEach(folder => orginizeSeriesFolder(folder.path));
    }
}

function orginizeSeriesFolder(path: string) {
    const flatten = factory.createFlattenFileTree();
    flatten.flatten(path);

    // // Separate 
    // const directoryTree = new DirTree().treeFrom(pathData.fullPath, /.DS_Store|purge/);
    // if (!directoryTree) return;

    // const level4folders: Tree[] = [];
    // const level4files: Tree[] = [];

    // directoryTree.levelOrderTraversal((node, level) => {
    //     if (level == 1 && node.isFolder)
    //         level4folders.push(node);

    //     if (level == 1 && node.isFile)
    //         level4files.push(node);
    // });

    // console.log(level4folders);
    // console.log(level4files);

    // const vtBuilder = new VirtualTreeBuilder(pathData.fullPath, new TitleParserAdapter(), new FSEditor());
    // vtBuilder.buildVirtualTree(level4files);
    // vtBuilder.buildVirtualTree(level4folders);

    // console.log(vtBuilder.virtualTree);
    // vtBuilder.commit();
}


main();