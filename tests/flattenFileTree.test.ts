import { expect } from 'chai';

import { FlattenFileTree } from '../src/parser/DirManager/FlattenFileTree';
import MockDirTreeCreator from './stub/MockDirTreeCreator';
import MockFSEditor from './stub/MockFSEditor';

describe('reorginize series folders [flatten]', function () {
    const rootFolder = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

    it('well structured series folder', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('well_orginized_show');
        
        expect(flatData.moveup).to.eql([]);
        expect(flatData.purge).to.eql([]);
    });

    it('extra non-video files in series top level', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('extra_files_in_top_level');

        const purge = [ `${rootFolder}/extra_files_in_top_level/movie_description.txt`,
                        `${rootFolder}/extra_files_in_top_level/poster.jpeg` ];

        expect(flatData.moveup).to.eql([]);
        expect(flatData.purge).to.eql(purge);
    });

    it('empty folders in series top level', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('empty_folders_in_top_level');

        const purge =[ `${rootFolder}/empty_folders_in_top_level/S3`,
                        `${rootFolder}/empty_folders_in_top_level/information` ];

        expect(flatData.moveup).to.eql([]);
        expect(flatData.purge).to.eql(purge);
    });

    it('folders with no video files in series top level', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('folders_with_no_video_files_in_top_level');
        
        const purge =[ `${rootFolder}/folders_with_no_video_files_in_top_level/S3/infromation.txt`,
                        `${rootFolder}/folders_with_no_video_files_in_top_level/S3/some_picture.jpeg`,
                        `${rootFolder}/folders_with_no_video_files_in_top_level/S3` ];

        expect(flatData.moveup).to.eql([]);
        expect(flatData.purge).to.eql(purge);
    });

    it('folders and non-video files at depth 2', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('folders_and_non_video_files_at_depth_2');
        
        const purge = [`${rootFolder}/folders_and_non_video_files_at_depth_2/S1/depth_1_folder`,
                        `${rootFolder}/folders_and_non_video_files_at_depth_2/S2/depth_1_folder`];

        expect(flatData.moveup).to.eql([]);
        expect(flatData.purge).to.eql(purge);
    });

    it('video files at level 3', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('video_files_at_level_3');
        
        const moveUp = [`${rootFolder}/video_files_at_level_3/S2/nested_videos/South park [3x02].mkv`,
                        `${rootFolder}/video_files_at_level_3/S2/nested_videos/South park [3x03].mp4`];

        const purge = [`${rootFolder}/video_files_at_level_3/S2/nested_videos`];

        expect(flatData.moveup).to.eql(moveUp);
        expect(flatData.purge).to.eql(purge);
    });

    it('video files below level 2', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());
        const flatData = flattenFileTree.findMisplacedFiles('video_files_below_level_2');
        
        const moveUp = [`${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`,
                        `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`,
                        `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`,
                        `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`];

        const purge = [`${rootFolder}/video_files_below_level_2/Season 10/nested_videos`,
                        `${rootFolder}/video_files_below_level_2/Season 12/nested_videos`];

        expect(flatData.moveup, 'move up wrong').to.eql(moveUp);
        expect(flatData.purge, 'purge wrong').to.eql(purge);
    });
});
