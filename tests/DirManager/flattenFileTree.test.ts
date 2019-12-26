import { expect } from 'chai';

import FlattenFileTree from '../../src/parser/DirManager/FlattenFileTree';
import MockDirTreeCreator from '../stub/MockDirTreeCreator';
import MockFSEditor from '../stub/MockFSEditor';
import FilePurger from '../../src/parser/DirManager/FilePurger';

describe('Flatten File Tree', function () {
    const rootFolder = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

    describe('Find misplaced files - Purge', () => {

        it('well structured series folder', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('well_orginized_show');
            
            expect(flatData.purge).to.eql([]);
            expect(flatData.moveup).to.eql([]);
        });

        it('extra non-video files in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('extra_files_in_top_level');

            const purge = [ `${rootFolder}/extra_files_in_top_level/movie_description.txt`,
                            `${rootFolder}/extra_files_in_top_level/poster.jpeg` ];

            expect(flatData.purge).to.eql(purge);
            expect(flatData.moveup).to.eql([]);
        });

        it('empty folders in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('empty_folders_in_top_level');

            const purge =[ `${rootFolder}/empty_folders_in_top_level/S3`,
                            `${rootFolder}/empty_folders_in_top_level/information` ];

            expect(flatData.purge).to.eql(purge);
            expect(flatData.moveup).to.eql([]);
        });

        it('folders with no video files in series top level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('folders_with_no_video_files_in_top_level');
            
            const purge =[ `${rootFolder}/folders_with_no_video_files_in_top_level/S3/infromation.txt`,
                            `${rootFolder}/folders_with_no_video_files_in_top_level/S3/some_picture.jpeg`,
                            `${rootFolder}/folders_with_no_video_files_in_top_level/S3` ];

            expect(flatData.purge).to.eql(purge);
            expect(flatData.moveup).to.eql([]);
        });

        it('folders and non-video files at depth 2', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('folders_and_non_video_files_at_depth_2');
            
            const purge = [`${rootFolder}/folders_and_non_video_files_at_depth_2/S1/depth_1_folder`,
                            `${rootFolder}/folders_and_non_video_files_at_depth_2/S2/depth_1_folder`];

            expect(flatData.purge).to.eql(purge);
            expect(flatData.moveup).to.eql([]);
        });

        it('relative path', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const flatData = flattenFileTree['findMisplacedFiles']('flatten');
            
            const purge = ["public/en/shows/game_of_thrones/source.txt",
                "public/en/shows/game_of_thrones/thumbnail.jpeg",
                "public/en/shows/game_of_thrones/S3/nested",
                "public/en/shows/game_of_thrones/Season 1/hello",
                "public/en/shows/game_of_thrones/Season 2/nested",
                "public/en/shows/game_of_thrones/Season4/no_videos",
                "public/en/shows/game_of_thrones/Season4/subtitles.srt.txt",
                "public/en/shows/game_of_thrones/Season4"];
            
            const moveup = [
                {
                    level: 3,
                    path: "public/en/shows/game_of_thrones/Season 2/nested/E12.mkv"
                },
                {
                    level: 3,
                    path: "public/en/shows/game_of_thrones/Season 2/nested/E13.mkv"
                },
                {
                    level: 3,
                    path: "public/en/shows/game_of_thrones/Season 2/nested/E14.mkv"
                },
                {
                    level: 4,
                    path: "public/en/shows/game_of_thrones/S3/nested/nested/E12.mkv"
                },
                {
                    level: 4,
                   path: "public/en/shows/game_of_thrones/S3/nested/nested/E13.mkv"
                },
                {
                    level: 4,
                    path: "public/en/shows/game_of_thrones/S3/nested/nested/E14.mkv"
                }
            ];

            expect(flatData.purge).to.eql(purge);
            expect(flatData.moveup).to.eql(moveup);
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

    describe('Remove subpaths', () => {

        it('base test', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = flattenFileTree['removeSubpaths'](path, 2);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12');
        });

        it('deeper level', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = flattenFileTree['removeSubpaths'](path, 4);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders');
        });

        it('one level up', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/a/b/c/d/video.mkv';

            const finalDir = flattenFileTree['removeSubpaths'](path, 2);

            expect(finalDir).to.equal('/a/b/c');
        });

        it('all the way up', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = '/a/b/c/d/video.mkv';

            const finalDir = flattenFileTree['removeSubpaths'](path, 5);

            expect(finalDir).to.equal('/');
        });

        it('relative path', () => {
            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
            const path = 'a/b/c/d/video.mkv';

            const finalDir = flattenFileTree['removeSubpaths'](path, 3);

            expect(finalDir).to.equal('a/b');
        });

    });

    describe('Move files to level', () => {

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
    
            flattenFileTree['moveFilesToLevel'](moveUp, 2);
    
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
    
            flattenFileTree['moveFilesToLevel'](moveUp, 3);
    
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
    
            flattenFileTree['moveFilesToLevel'](moveUp, 0);
    
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

    describe('Flatten', () => {

        it('relative paths', () => {
            const purger = new FilePurger(new MockFSEditor());
            const fsEditor = new MockFSEditor();
            let calledPurge = false;
            let calledMove = false;

            purger.purge = (purgeDirectory: string) => calledPurge = true;
                
            fsEditor.moveFileToFolder = (from: string, to: string) => calledMove = true;

            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor, purger);

            flattenFileTree.flatten('flatten');

            const purgeList = ['public/en/shows/game_of_thrones/source.txt',
            'public/en/shows/game_of_thrones/thumbnail.jpeg',
            'public/en/shows/game_of_thrones/S3/nested',
            'public/en/shows/game_of_thrones/Season 1/hello',
            'public/en/shows/game_of_thrones/Season 2/nested',
            'public/en/shows/game_of_thrones/Season4'];

            expect(calledPurge).to.be.true;
            expect(calledMove).to.be.true;

            expect(purger.purgeList).to.eql(purgeList);
        });

        it('absolute paths', () => {
            const purger = new FilePurger(new MockFSEditor());
            const fsEditor = new MockFSEditor();
            let calledPurge = false;
            let calledMove = false;

            purger.purge = (purgeDirectory: string) => calledPurge = true;
                
            fsEditor.moveFileToFolder = (from: string, to: string) => calledMove = true;

            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor, purger);
            let misplacedFiles: {
                moveup: {
                    path: string;
                    level: number;
                }[];
                purge: string[]
            } | undefined;

            // This extends the original method and avoids infinite recursion
            const originalFunction = flattenFileTree['findMisplacedFiles'].bind(flattenFileTree);
            flattenFileTree['findMisplacedFiles'] = ((pathToFolder: string) => {
                misplacedFiles = originalFunction(pathToFolder);
                return misplacedFiles;
            }).bind(flattenFileTree);
            //------

            flattenFileTree.flatten('absolute_mess');

            const expectedPurgeList = ['/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/source.txt',
                '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/thumbnail.jpeg',
                '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/S3/nested',
                '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/Season 1/hello',
                '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/Season 2/nested',
                '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/absolute_mess/Season4'];

            expect(purger.purgeList).to.eql(expectedPurgeList);
        });
    });
});
