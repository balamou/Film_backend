import { expect } from 'chai';

import YAML from 'yaml';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';
import OrginizerFactory from '../../src/parser/Orginizer/Factory';
import Orginizer from '../../src/parser/Orginizer/Orginizer';
import MockDirTreeCreator from '../stub/MockDirTreeCreator';

describe('Orginizer', function () {
    
    const convertToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));
    const rootDir = `${__dirname}/examples/`;
    const snapshot = (key: string, data: any) => new FSEditor().writeToFile(`${rootDir}/${key}.yml`, convertToYaml(data));
    const readFile = (key: string) => new FSEditor().readFile(`${rootDir}/${key}.yml`); // used to retrieve snapshots

    describe('Separate files from folders', () => {

        it('base test', () => {
            const factory = new OrginizerFactory();
            factory.createDirTreeCreator = () => new MockDirTreeCreator();

            const orginizer = new Orginizer('en', factory, /.DS_Store|purge|rejected|film.config/);

            const sep = orginizer['separateFoldersFromFiles']('absolute_mess');

            const expectedFiles = [ 'source.txt', 'thumbnail.jpeg' ];
            const expectedFolders = [ 'S3', 'Season 1', 'Season 2', 'Season4' ];

            expect(sep.files.map(x => x.name)).to.eql(expectedFiles);
            expect(sep.folders.map(x => x.name)).to.eql(expectedFolders);
        });

    });

});