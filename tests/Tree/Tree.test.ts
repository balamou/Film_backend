import { expect } from 'chai';

import MockDirTreeCreator from '../stub/MockDirTreeCreator';
import Tree from '../../src/parser/Tree/Tree';


describe('Tree tests', function () {

    describe('Level order traversal', () => {

        it('base test', () => {
            const mockDirTree = new MockDirTreeCreator();
            const testTree = mockDirTree.treeFrom('well_orginized_show');
            const result: {path: string, level: number}[] = [];

            testTree.levelOrderTraversal((node, level) => {
                result.push({path: node.path, level: level});
            });

            const rootDir = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

            const expectedLevelOrderTraversal = [
                { path: `${rootDir}/well_orginized_show`, level: 0 },
                { path: `${rootDir}/well_orginized_show/S1`, level: 1 },
                { path: `${rootDir}/well_orginized_show/S2`, level: 1 },
                { path: `${rootDir}/well_orginized_show/S1/Ep3.mp4`, level: 2 },
                { path: `${rootDir}/well_orginized_show/S1/Episode2.mkv`, level: 2 },
                { path: `${rootDir}/well_orginized_show/S1/Episode_1.mkv`, level: 2 },
                { path: `${rootDir}/well_orginized_show/S2/Ep9.mp4`, level: 2 },
                { path: `${rootDir}/well_orginized_show/S2/Episode_4.mkv`, level: 2 },
                { path: `${rootDir}/well_orginized_show/S2/Season2_Episode2.mkv`, level: 2 }
            ];

            expect(result).to.eql(expectedLevelOrderTraversal);
        });

        it('4 levels deep', () => {
            const mockDirTree = new MockDirTreeCreator();
            const testTree = mockDirTree.treeFrom('absolute_mess');
            const result: {path: string, level: number}[] = [];

            testTree.levelOrderTraversal((node, level) => {
                result.push({path: node.path, level: level});
            });
            const rootDir = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';
           
            const expectedLevelOrderTraversal = [
                { path: `${rootDir}/absolute_mess`, level: 0 },

                { path: `${rootDir}/absolute_mess/S3`, level: 1 },
                { path: `${rootDir}/absolute_mess/Season 1`, level: 1 },
                { path: `${rootDir}/absolute_mess/Season 2`, level: 1 },
                { path: `${rootDir}/absolute_mess/Season4`, level: 1 },
                { path: `${rootDir}/absolute_mess/source.txt`, level: 1 },
                { path: `${rootDir}/absolute_mess/thumbnail.jpeg`, level: 1 },

                { path: `${rootDir}/absolute_mess/S3/Ep1.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/S3/Ep2.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/S3/Episode 3.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/S3/nested`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 1/Ep4.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 1/Ep5.mp4`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 1/Episode 3.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 1/hello`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 2/Ep1.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 2/Ep2.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 2/Episode 3.mkv`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season 2/nested`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season4/no_videos`, level: 2 },
                { path: `${rootDir}/absolute_mess/Season4/subtitles.srt.txt`, level: 2 },

                { path: `${rootDir}/absolute_mess/S3/nested/information.txt`, level: 3 },
                { path: `${rootDir}/absolute_mess/S3/nested/nested`, level: 3 },
                { path: `${rootDir}/absolute_mess/S3/nested/poster.jpeg`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 1/hello/Episod 3.txt`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 1/hello/image.jpeg`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 1/hello/subs.txt`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 2/nested/E12.mkv`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 2/nested/E13.mkv`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season 2/nested/E14.mkv`, level: 3 },
                { path: `${rootDir}/absolute_mess/Season4/no_videos/info.txt`, level: 3 },
                
                { path: `${rootDir}/absolute_mess/S3/nested/nested/E12.mkv`, level: 4 },
                { path: `${rootDir}/absolute_mess/S3/nested/nested/E13.mkv`, level: 4 },
                { path: `${rootDir}/absolute_mess/S3/nested/nested/E14.mkv`, level: 4 }
            ];

            expect(result).to.eql(expectedLevelOrderTraversal);
        });

        it('tree with one child for each node', () => {
            const node4 = new Tree('a/b/c/d/e/f.mp4', 'f.mp4', 'file', 'mp4', []);
            const node3 = new Tree('a/b/c/d/e', 'e', 'directory', undefined, [node4]);
            const node2 = new Tree('a/b/c/d', 'd', 'directory', undefined, [node3]);
            const node1 = new Tree('a/b/c', 'c', 'directory', undefined, [node2]);
            
            const traversal: {node: Tree, level: number}[] = [];

            node1.levelOrderTraversal((node, level) => {
                traversal.push({node: node, level: level});
            });

            const expectedResult = [{ node: node1, level: 0 },
                { node: node2, level: 1 },
                { node: node3, level: 2 },
                { node: node4, level: 3 }];

            expect(traversal).to.eql(expectedResult);
        });

    });

    describe('Check if tree contains a node', () => {

        it('base test', () => { 
            const node4 = new Tree('a/b/c/d/e/f.mp4', 'f.mp4', 'file', 'mp4', []);
            const node3 = new Tree('a/b/c/d/e', 'e', 'directory', undefined, [node4]);
            const node2 = new Tree('a/b/c/d', 'd', 'directory', undefined, [node3]);
            const node1 = new Tree('a/b/c', 'c', 'directory', undefined, [node2]);
            const tree = node1;

            expect(tree.contains(node => node.name === 'e')).to.be.true;
            expect(tree.contains(node => node.name === 'k')).to.be.false;
        });

        it('does not contains a file that is not a video', () => { 
            const node5 = new Tree('a/b/c/d/e/g', 'g', 'directory', undefined, []);
            const node4 = new Tree('a/b/c/d/e/f.mp4', 'f.mp4', 'file', '.mp4', []);
            const node3 = new Tree('a/b/c/d/e', 'e', 'directory', undefined, [node4, node5]);
            const node2 = new Tree('a/b/c/d', 'd', 'directory', undefined, [node3]);
            const node1 = new Tree('a/b/c', 'c', 'directory', undefined, [node2]);
            const tree = node1;

            const contains = tree.contains(node => node.isFile && !node.isVideo);
            expect(contains).to.be.false;
        });

    });

    describe('Tree hashing', () => {

        it('base test', () => {
            const node5 = new Tree('a/b/c/d/e/g', 'g', 'directory', undefined, []);
            const node4 = new Tree('a/b/c/d/e/f.mp4', 'f.mp4', 'file', '.mp4', []);
            const node3 = new Tree('a/b/c/d/e', 'e', 'directory', undefined, [node4, node5]);
            const node2 = new Tree('a/b/c/d', 'd', 'directory', undefined, [node3]);
            const node1 = new Tree('a/b/c', 'c', 'directory', undefined, [node2]);
            const tree = node1;

            const hash = tree.hash();
            expect(hash).to.equal(-712706860);
        });

        it('tree change', () => {
            const node5 = new Tree('a/b/c/d/e/g', 'g', 'directory', undefined, []);
            const node4 = new Tree('a/b/c/d/e/f.mp4', 'f.mp4', 'file', '.mp4', []);
            const node3 = new Tree('a/b/c/d/e', 'e', 'directory', undefined, [node4, node5]);
            const node2 = new Tree('a/b/c/d', 'd', 'directory', undefined, [node3]);
            const node1 = new Tree('a/b/c', 'c', 'directory', undefined, [node2]);
            let tree = node1;

            const firstHash = tree.hash();
            
            tree = new Tree('a/b/m', 'm', 'directory', undefined, [node2]);
            const secondHash = tree.hash();
            
            expect(firstHash).to.not.equal(secondHash);
        });

    });

});