import { expect } from 'chai';

import YAML from 'yaml';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';
import Tree from '../../src/parser/Tree/Tree';
import { VirtualTreeBuilder } from '../../src/parser/Orginizer/VirtualTree/VirtualTreeBuilder';
import { TitleParserAdapter } from '../../src/parser/Adapters/TitleParser';
import MockFSEditor from '../stub/MockFSEditor';
import MockDirTreeCreator from '../stub/MockDirTreeCreator';

describe('Virtual Tree Builder', function () {
    
    const convertToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));
    const rootDir = `${__dirname}/examples/`;
    const snapshot = (key: string, data: any) => new FSEditor().writeToFile(`${rootDir}/${key}.yml`, convertToYaml(data));
    const readFile = (key: string) => new FSEditor().readFile(`${rootDir}/${key}.yml`); // used to retrieve snapshots

    describe('build virtual tree from files', () => {

        it('base test', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1 = new Tree('/a/b/Season1_episode2.mkv', 'Season1_episode2.mkv', 'file', '.mkv', []);
            const file2 = new Tree('/a/b/Season1_episode3.mkv', 'Season1_episode3.mkv', 'file', '.mkv', []);
            const file3 = new Tree('/a/b/Season1_episode4.mkv', 'Season1_episode4.mkv', 'file', '.mkv', []);
            const file4 = new Tree('/a/b/Season1_episode5.mkv', 'Season1_episode5.mkv', 'file', '.mkv', []);

            const files = [file1, file2, file3, file4];
            
            virtualTreeBuilder.buildVirtualTreeFromFiles(files);

            const expectedTree = readFile('build_vtTree_from_files');

            expect(convertToYaml(virtualTreeBuilder.virtualTree)).to.be.equal(expectedTree);
        });

        it('build virtual tree from files [multiple seasons]', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1 = new Tree('/a/b/Season3_episode2.mkv', 'Season3_episode2.mkv', 'file', '.mkv', []);
            const file2 = new Tree('/a/b/Season3_episode3.mkv', 'Season3_episode3.mkv', 'file', '.mkv', []);
            const file3 = new Tree('/a/b/Season2_episode4.mkv', 'Season2_episode4.mkv', 'file', '.mkv', []);
            const file4 = new Tree('/a/b/Season1_episode5.mkv', 'Season1_episode5.mkv', 'file', '.mkv', []);
            const file5 = new Tree('/a/b/Season1_episode4.mkv', 'Season1_episode4.mkv', 'file', '.mkv', []);
            const file6 = new Tree('/a/b/Season1_episode6.mkv', 'Season1_episode6.mkv', 'file', '.mkv', []);

            const files = [file1, file2, file3, file4, file5, file6];
            
            virtualTreeBuilder.buildVirtualTreeFromFiles(files);


            const expectedTree = readFile('multiple_seasons');

            expect(convertToYaml(virtualTreeBuilder.virtualTree)).to.be.equal(expectedTree);
        });

        it('reject non parsable files', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1 = new Tree('/a/b/Season3_episode2.mkv', 'Season3_episode2.mkv', 'file', '.mkv', []);
            const file2 = new Tree('/a/b/Season3_episode3.mkv', 'Season3_episode3.mkv', 'file', '.mkv', []);
            const file3 = new Tree('/a/b/Season2_episode4.mkv', 'Season2_episode4.mkv', 'file', '.mkv', []);
            const non_parsable = new Tree('/a/b/abddfdfjdbf.mkv', 'abddfdfjdbf.mkv', 'file', '.mkv', []);
            const file5 = new Tree('/a/b/Season1_episode4.mkv', 'Season1_episode4.mkv', 'file', '.mkv', []);
            const file6 = new Tree('/a/b/Season1_episode6.mkv', 'Season1_episode6.mkv', 'file', '.mkv', []);

            const files = [file1, file2, file3, non_parsable, file5, file6];
            
            virtualTreeBuilder.buildVirtualTreeFromFiles(files);
            
            expect(virtualTreeBuilder['rejected'][0].name).to.eql('abddfdfjdbf.mkv');
            expect(virtualTreeBuilder['rejected'].length).to.eql(1);
        });

    });

    describe('build virtual tree from folders', () => {

        it('base test', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1_1 = new Tree('/a/b/Season 1/Season1_episode1.mkv', 'Season1_episode1.mkv', 'file', '.mkv', []);
            const file1_2 = new Tree('/a/b/Season 1/Season1_episode2.mkv', 'Season1_episode2.mkv', 'file', '.mkv', []);
            const file1_3 = new Tree('/a/b/Season 1/Season1_episode3.mkv', 'Season1_episode3.mkv', 'file', '.mkv', []);
            
            const file2_1 = new Tree('/a/b/Season 2/Season2_episode4.mkv', 'Season2_episode4.mkv', 'file', '.mkv', []);
            const file2_2 = new Tree('/a/b/Season 2/Season2_episode5.mkv', 'Season2_episode5.mkv', 'file', '.mkv', []);
            
            const folder1 = new Tree('/a/b/Season 1', 'Season 1', 'directory', undefined, [file1_1, file1_2, file1_3]);
            const folder2 = new Tree('/a/b/Season 2', 'Season 2', 'directory', undefined, [file2_1, file2_2]);
            
            virtualTreeBuilder.buildVirtualTreeFromFolders([folder1, folder2]);

            const expectedTree = readFile('build_vtTree_from_folders');

            expect(convertToYaml(virtualTreeBuilder.virtualTree)).to.be.equal(expectedTree);
        });

        it('intertwined seasons', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1_1 = new Tree('/a/b/Season 1/Season1_episode1.mkv', 'Season1_episode1.mkv', 'file', '.mkv', []);
            const file1_2 = new Tree('/a/b/Season 1/Season3_episode2.mkv', 'Season3_episode2.mkv', 'file', '.mkv', []);
            const file1_3 = new Tree('/a/b/Season 1/Season3_episode3.mkv', 'Season3_episode3.mkv', 'file', '.mkv', []);
            
            const file2_1 = new Tree('/a/b/Season 2/Season2_episode4.mkv', 'Season2_episode4.mkv', 'file', '.mkv', []);
            const file2_2 = new Tree('/a/b/Season 2/Season1_episode5.mkv', 'Season1_episode5.mkv', 'file', '.mkv', []);
            
            const folder1 = new Tree('/a/b/Season 1', 'Season 1', 'directory', undefined, [file1_1, file1_2, file1_3]);
            const folder2 = new Tree('/a/b/Season 2', 'Season 2', 'directory', undefined, [file2_1, file2_2]);
            
            virtualTreeBuilder.buildVirtualTreeFromFolders([folder1, folder2]);
            
            snapshot('intertwined_seasons', virtualTreeBuilder.virtualTree);

            const expectedTree = readFile('intertwined_seasons');

            expect(convertToYaml(virtualTreeBuilder.virtualTree)).to.be.equal(expectedTree);
        });

        it('intertwined seasons with episodes not having season information', () => {
            const virtualTreeBuilder = new VirtualTreeBuilder(new TitleParserAdapter(), new MockFSEditor(), new MockDirTreeCreator());
            
            const file1_1 = new Tree('/a/b/Season 1/Season1_episode1.mkv', 'Season1_episode1.mkv', 'file', '.mkv', []);
            const file1_2 = new Tree('/a/b/Season 1/Season3_episode2.mkv', 'Season3_episode2.mkv', 'file', '.mkv', []);
            const file1_3 = new Tree('/a/b/Season 1/Season3_episode3.mkv', 'Season3_episode3.mkv', 'file', '.mkv', []);
            
            const file2_1 = new Tree('/a/b/Season 2/Season2_episode4.mkv', 'Season2_episode4.mkv', 'file', '.mkv', []);
            const file2_2 = new Tree('/a/b/Season 2/Season1_episode5.mkv', 'Season1_episode5.mkv', 'file', '.mkv', []);
            const file2_3 = new Tree('/a/b/Season 2/episode3.mkv', 'episode3.mkv', 'file', '.mkv', []);
            const file2_4 = new Tree('/a/b/Season 2/episode6.mkv', 'episode6.mkv', 'file', '.mkv', []);
            const file2_5 = new Tree('/a/b/Season 2/episode8.mkv', 'episode8.mkv', 'file', '.mkv', []);
            
            const folder1 = new Tree('/a/b/Season 1', 'Season 1', 'directory', undefined, [file1_1, file1_2, file1_3]);
            const folder2 = new Tree('/a/b/Season 2', 'Season 2', 'directory', undefined, [file2_1, file2_2, file2_3, file2_4, file2_5]);
            
            virtualTreeBuilder.buildVirtualTreeFromFolders([folder1, folder2]);
            
            const expectedTree = readFile('intertwined_seasons_no_season_info_in_episode');

            expect(convertToYaml(virtualTreeBuilder.virtualTree)).to.be.equal(expectedTree);
        });

    });

});