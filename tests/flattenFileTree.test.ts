import { expect } from 'chai';

import { FlattenFileTree } from '../src/parser/DirManager/FlattenFileTree';
import MockDirTreeCreator from './stub/MockDirTreeCreator';
import MockFSEditor from './stub/MockFSEditor';

describe('calculate', function () {
    it('add', () => {
        const flattenFileTree = new FlattenFileTree(new MockDirTreeCreator(), new MockFSEditor());

        // expect(result).equal(7);
    });
});
