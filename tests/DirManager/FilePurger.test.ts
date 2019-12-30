import { expect } from 'chai';
import FilePurger from '../../src/parser/Orginizer/DirManager/FilePurger';
import MockFSEditor from '../stub/MockFSEditor';
import YAML from 'yaml';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';

describe('File purger tests', () => {
    const dirToTreeSnapshots = `${__dirname}/expected`;
    const readFile = (path: string) => new FSEditor().readFile(`${dirToTreeSnapshots}/${path}`); // used to retrieve snapshots
    const writeToFile = (path: string, data: string) => new FSEditor().writeToFile(`${dirToTreeSnapshots}/${path}`, data); // used for saving snapshots

    describe('Insertion', () => {
            
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
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('initialization_with_paths.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('initialization with paths', () => {
            const paths = ['a/b/c',
                'a/b/c/d/e',
                'm/n/q',
                'm/p',
                'm/p/e/f'];
            const filePurger = new FilePurger(new MockFSEditor(), paths);
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('initialization_with_paths.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('insert a bulk of paths', () => {
            const filePurger = new FilePurger(new MockFSEditor());
            
            filePurger.insertPath('a/b/c');
            filePurger.insertPath('a/b/c/d/e');
    
            filePurger.insertPaths(['m/n/q', 'm/p', 'm/p/e/f']);
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('initialization_with_paths.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('insert a path that is part of another path', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('a/b/c');
            filePurger.insertPath('a/b/c/d/e');
            filePurger.insertPath('a/b/k');
            filePurger.insertPath('d/m/h/z/f');
            filePurger.insertPath('d/m/h');
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('path_part_of_another.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('insert single paths', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('d');
            filePurger.insertPath('a');
            filePurger.insertPath('e');
            filePurger.insertPath('f');
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('single_paths.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('insert duplicate paths', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('d');
            filePurger.insertPath('a/b/c');
            filePurger.insertPath('e/f');
            filePurger.insertPath('a/b/c');
            filePurger.insertPath('e/f');
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('duplicate_paths.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('test inserting a path with extra slashes in path', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('/a/b/c/');
            filePurger.insertPath('/d/e//f///');
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('extra_slashes.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    
        it('tree with branches with only one child', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('/a/b');
            filePurger.insertPath('/m/n/o/q');
            filePurger.insertPath('/b/a');
            filePurger.insertPath('/c/d/e/f');
    
            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('one_child_branches.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });


        it('all absolute paths, ignores relative path', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('/a/b/c');
            filePurger.insertPath('/a/b/c/d/e');
            filePurger.insertPath('a/b/k');
            filePurger.insertPath('/d/m/h/z/f');
            filePurger.insertPath('/d/m/h');

            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('all_absolute_one_relative.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });

        it('all relative paths, ignores absolute path', () => {
            const filePurger = new FilePurger(new MockFSEditor());
    
            filePurger.insertPath('a/b/c');
            filePurger.insertPath('a/b/c/d/e');
            filePurger.insertPath('/a/b/k');
            filePurger.insertPath('d/m/h/z/f');
            filePurger.insertPath('d/m/h');

            const rootNode = YAML.stringify(filePurger['rootNode']);
            const expectedTree = readFile('all_relative_one_absolute.yml');
            
            expect(rootNode).to.equal(expectedTree);
        });
    });

    describe('Generate purge list', () => {
        
        it('creating a purge list from tree', () => {
            const paths = ['a/b',
                'a/b/d',
                'a/b/f/h',
                'a/b/g/m',
                'a/c',
                'a/e/m/o',
                'a/e/m/p',
                'a/e/h/q/n',
                'a/e/h/f/c',
                'a/e/h/h',
                'a/e/h'];
    
            const filePurger = new FilePurger(new MockFSEditor(), paths);
            const expectedPurgeList = [ 'a/b', 'a/c', 'a/e/m/o', 'a/e/m/p', 'a/e/h' ];
    
            expect(filePurger.purgeList).to.eql(expectedPurgeList);
        });
    
        it('file tree with no common nodes', () => {
            const paths = ['a/b/c',
                'm/n/o/p',
                'q/e/f',
                'c',
                'd/m'];
    
            const filePurger = new FilePurger(new MockFSEditor(), paths);
            const expectedPurgeList = ['a/b/c',
                'm/n/o/p',
                'q/e/f',
                'c',
                'd/m'];
    
            expect(filePurger.purgeList).to.eql(expectedPurgeList);
        });

        it('absolute paths generate absolute path lists', () => {
            const paths = ['/a/b',
            '/a/b/d',
            '/a/b/f/h',
            '/a/b/g/m',
            '/a/c',
            '/a/e/m/o',
            '/a/e/m/p',
            '/a/e/h/q/n',
            '/a/e/h/f/c',
            '/a/e/h/h',
            '/a/e/h'];

            const filePurger = new FilePurger(new MockFSEditor(), paths);
            const expectedPurgeList = [ '/a/b', '/a/c', '/a/e/m/o', '/a/e/m/p', '/a/e/h' ];

            expect(filePurger.purgeList).to.eql(expectedPurgeList);
        });

    });

    describe('Moving purge files', () => {
    
        it('moving purging files to a folder (making sure it calls the move method)', () => {
            const mockFSEditor = new MockFSEditor();
            const result: [string, string][] = [];
            mockFSEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
            };

            mockFSEditor.makeDirectory = (dirName: string) => {
                expect(dirName).to.equal('/purge');
            };

            const filePurger = new FilePurger(mockFSEditor);

            filePurger.insertPath('/a/b/c');
            filePurger.insertPath('/a/d');
            filePurger.insertPath('/a/b/c/e');
            filePurger.insertPath('/a/b/c/f');

            filePurger.purge('/purge');
            expect(result).to.eql([['/a/b/c', '/purge'], ['/a/d', '/purge']]);
        });

        it('no paths added does not trigger move ot makeDir', () => {
            const mockFSEditor = new MockFSEditor();
            let isMoveCalled = false;
            let isMakeDirCalled = false;

            mockFSEditor.moveFileToFolder = (from: string, to: string) => {
                isMoveCalled = true;
            };

            mockFSEditor.makeDirectory = (dirName: string) => {
                isMakeDirCalled = true;
            };

            const filePurger = new FilePurger(mockFSEditor);
            filePurger.purge('/purge');

            expect(isMoveCalled).to.be.false;
            expect(isMakeDirCalled).to.be.false;
        });

        it('empty paths after purge called', () => {
            const mockFSEditor = new MockFSEditor();

            mockFSEditor.moveFileToFolder = (from: string, to: string) => {
            };

            mockFSEditor.makeDirectory = (dirName: string) => {
            };

            const filePurger = new FilePurger(mockFSEditor);

            filePurger.insertPath('/a/b/c');
            filePurger.insertPath('/a/d');
            filePurger.insertPath('/d/b/c/e');
            filePurger.insertPath('/d/b/c/f');

            filePurger.purge('/purge');

            expect(filePurger['rootNode'].nestedPaths).to.eql([]);
            expect(filePurger['rootNode'].nestedPaths.length).to.equal(0);
        });
   
    });
});