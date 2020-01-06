import { expect } from 'chai';

import FlattenFileTree from '../../src/parser/Orginizer/DirManager/FlattenFileTree';
import MockDirTreeCreator from '../stub/MockDirTreeCreator';
import MockFSEditor from '../stub/MockFSEditor';
import FilePurger from '../../src/parser/Orginizer/DirManager/FilePurger';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';

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
            const flatData = flattenFileTree['findMisplacedFiles']('relative_paths');
            
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

    describe('Flatten', () => {

        it('relative paths', () => {
            const purger = new FilePurger(new MockFSEditor());
            const fsEditor = new FSEditor();
            let calledPurge = false;
            let calledMove = false;

            purger.purge = (purgeDirectory: string) => calledPurge = true;
                
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                calledMove = true; 
                return undefined;
            };

            const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), fsEditor, purger);

            flattenFileTree.flatten('relative_paths');

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
            const fsEditor = new FSEditor();

            purger.purge = (purgeDirectory: string) => {};
            fsEditor.moveFileToFolder = (from: string, to: string) => undefined;

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
