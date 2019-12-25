import { expect } from 'chai';
import FilePurger from '../src/parser/DirManager/FilePurger';
import MockFSEditor from './stub/MockFSEditor';
import YAML from 'yaml';
import { FSEditor } from '../src/parser/Adapters/FSEditor';

describe('file purger tests', () => {
    it('node insertion', () => {
        const filePurger = new FilePurger(new MockFSEditor());

        filePurger.insertPath('a/b/c');
        filePurger.insertPath('a/b/c/d/e');
        filePurger.insertPath('m/n/q');
        filePurger.insertPath('m/p');
        filePurger.insertPath('m/p/e/f');

        // Result tree
        // *
        // - a
        //   - b
        //     - c*
        //       - d
        //         - e*
        // - m
        //   - n
        //     - q*
        //   - p*
        //     - e
        //       - f*
        const rootNode = YAML.stringify(filePurger.root);
        const expectedTree = new FSEditor().readFile(__dirname + '/expected_tree.yml');
        
        expect(rootNode).to.equal(expectedTree);
    });

    it('initialization with paths', () => {
        const paths = ['a/b/c',
            'a/b/c/d/e',
            'm/n/q',
            'm/p',
            'm/p/e/f'];
        const filePurger = new FilePurger(new MockFSEditor(), paths);

        const rootNode = YAML.stringify(filePurger.root);
        const expectedTree = new FSEditor().readFile(__dirname + '/expected_tree.yml');
        
        expect(rootNode).to.equal(expectedTree);
    });

    it('insert a path that is part of another path', () => {
        const filePurger = new FilePurger(new MockFSEditor());

        filePurger.insertPath('a/b/c');
        filePurger.insertPath('a/b/c/d/e');
        filePurger.insertPath('a/b/k');
        filePurger.insertPath('d/m/h/z/f');
        filePurger.insertPath('d/m/h');

        const rootNode = YAML.stringify(filePurger.root);
        const expectedTree = new FSEditor().readFile(__dirname + '/path_part_of_another.yml');
        
        expect(rootNode).to.equal(expectedTree);
    });
});