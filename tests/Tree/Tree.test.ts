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

    });

});