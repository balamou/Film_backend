import { expect } from 'chai';

import { FlattenFileTree } from '../../src/parser/DirManager/FlattenFileTree';
import MockDirTreeCreator from '../stub/MockDirTreeCreator';
import MockFSEditor from '../stub/MockFSEditor';

describe('Flatten File Tree', function () {
    const rootFolder = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

    describe('Find misplaced files - Purge', () => {

        it('well structured series folder', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('well_orginized_show');
            
            expect(flatData.moveup).to.eql([]);
            expect(flatData.purge).to.eql([]);
        });

        it('extra non-video files in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('extra_files_in_top_level');

            const purge = [ `${rootFolder}/extra_files_in_top_level/movie_description.txt`,
                            `${rootFolder}/extra_files_in_top_level/poster.jpeg` ];

            expect(flatData.moveup).to.eql([]);
            expect(flatData.purge).to.eql(purge);
        });

        it('empty folders in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('empty_folders_in_top_level');

            const purge =[ `${rootFolder}/empty_folders_in_top_level/S3`,
                            `${rootFolder}/empty_folders_in_top_level/information` ];

            expect(flatData.moveup).to.eql([]);
            expect(flatData.purge).to.eql(purge);
        });

        it('folders with no video files in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('folders_with_no_video_files_in_top_level');
            
            const purge =[ `${rootFolder}/folders_with_no_video_files_in_top_level/S3/infromation.txt`,
                            `${rootFolder}/folders_with_no_video_files_in_top_level/S3/some_picture.jpeg`,
                            `${rootFolder}/folders_with_no_video_files_in_top_level/S3` ];

            expect(flatData.moveup).to.eql([]);
            expect(flatData.purge).to.eql(purge);
        });

        it('folders and non-video files at depth 2', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('folders_and_non_video_files_at_depth_2');
            
            const purge = [`${rootFolder}/folders_and_non_video_files_at_depth_2/S1/depth_1_folder`,
                            `${rootFolder}/folders_and_non_video_files_at_depth_2/S2/depth_1_folder`];

            expect(flatData.moveup).to.eql([]);
            expect(flatData.purge).to.eql(purge);
        });

    });

    describe('Find misplaced files - Move Up', () => {

        it('video files at level 3', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('video_files_at_level_3');
            
            const moveUp = [{path: `${rootFolder}/video_files_at_level_3/S2/nested_videos/South park [3x02].mkv`, level: 3},
                            {path: `${rootFolder}/video_files_at_level_3/S2/nested_videos/South park [3x03].mp4`, level: 3}];

            const purge = [`${rootFolder}/video_files_at_level_3/S2/nested_videos`];

            expect(flatData.moveup).to.eql(moveUp);
            expect(flatData.purge).to.eql(purge);
        });

        it('video files below level 2', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('video_files_below_level_2');
            
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];

            const purge = [`${rootFolder}/video_files_below_level_2/Season 10/nested_videos`,
                            `${rootFolder}/video_files_below_level_2/Season 12/nested_videos`];

            expect(flatData.moveup, 'move up wrong').to.eql(moveUp);
            expect(flatData.purge, 'purge wrong').to.eql(purge);
        });

    });

    describe('Find folder at desired level', () => {

        it('base test', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = flattenFileTree['folderAtDesiredLevel'](path, 3, 2);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12');
        });

        it('deeper level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = flattenFileTree['folderAtDesiredLevel'](path, 5, 2);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders');
        });

        it('one level up', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/a/b/c/d/video.mkv';

            const finalDir = flattenFileTree['folderAtDesiredLevel'](path, 2, 1);

            expect(finalDir).to.equal('/a/b/c');
        });

        it('all the way up', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/a/b/c/d/video.mkv';

            const finalDir = flattenFileTree['folderAtDesiredLevel'](path, 4, 0);

            expect(finalDir).to.equal('/');
        });

    });

    describe('Move Up', () => {

        it('base test', () => {
            const fsEditor = new MockFSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
            };
    
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor);
            
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            flattenFileTree['moveUp'](moveUp, 2);
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });

        it('move to level 3', () => {
            const fsEditor = new MockFSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
            };
    
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor);
            
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            flattenFileTree['moveUp'](moveUp, 3);
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });

        it('move to level 0', () => {
            const fsEditor = new MockFSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
            };
    
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor);
            
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            flattenFileTree['moveUp'](moveUp, 0);
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });


    });
});
