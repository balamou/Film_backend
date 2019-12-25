import { expect } from 'chai';

import { FlattenFileTree } from '../src/parser/DirManager/FlattenFileTree';
import MockDirTreeCreator from './stub/MockDirTreeCreator';
import MockFSEditor from './stub/MockFSEditor';

describe('reorginize series folders [flatten]', function () {
    const rootFolder = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

    it('well structured series folder [no changes required]', () => {
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

});
