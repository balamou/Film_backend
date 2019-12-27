import { expect } from 'chai';

import YAML from 'yaml';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';

describe('Virtual Tree Builder', function () {
    
    const convertToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));
    const snapshot = (key: string, data: any) => new FSEditor().writeToFile(__dirname + `/examples/${key}.yml`, convertToYaml(data));
    const readFile = (key: string) => new FSEditor().readFile(__dirname + `/examples/${key}.yml`); // used to retrieve snapshots

    describe('', () => {

        it('base test', () => {
            
        });

    });

});