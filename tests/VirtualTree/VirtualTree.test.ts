import { expect } from 'chai';

import { VirtualTree, Episode, Season } from '../../src/parser/Orginizer/VirtualTree//VirtualTree';
import Tree from '../../src/parser/Tree/Tree';
import YAML from 'yaml';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';

describe('Virtual Tree', function () {
    
    const convertToYaml = (data: any) => YAML.stringify(JSON.parse(JSON.stringify(data)));
    const snapshot = (key: string, data: any) => new FSEditor().writeToFile(__dirname + `/examples/${key}.yml`, convertToYaml(data));
    const readFile = (key: string) => new FSEditor().readFile(__dirname + `/examples/${key}.yml`); // used to retrieve snapshots

    describe('Inserting nodes', () => {

        it('inserting episodes', () => {
            const virtualTree = new VirtualTree();
            const file = new Tree('/a/b/c.mkv', 'c.mkv', 'file', '.mkv', []);

            virtualTree.addEpisode(1, new Episode(1, file));
            virtualTree.addEpisode(1, new Episode(2, file));
            virtualTree.addEpisode(1, new Episode(3, file));
            virtualTree.addEpisode(1, new Episode(4, file));

            const expectedTree = readFile('episode_insertion');

            expect(convertToYaml(virtualTree)).to.equal(expectedTree);
        });

        it('inserting episodes in different seasons', () => {
            const virtualTree = new VirtualTree();
            const file = new Tree('/a/b/c.mkv', 'c.mkv', 'file', '.mkv', []);

            virtualTree.addEpisode(1, new Episode(1, file));
            virtualTree.addEpisode(1, new Episode(2, file));
            virtualTree.addEpisode(2, new Episode(1, file));
            virtualTree.addEpisode(2, new Episode(3, file));
            virtualTree.addEpisode(3, new Episode(4, file));

            const expectedTree = readFile('different_seasons');

            expect(convertToYaml(virtualTree)).to.equal(expectedTree);
        });

        it('inserting duplicate episode throws error', () => {
            const virtualTree = new VirtualTree();
            const file = new Tree('/a/b/c.mkv', 'c.mkv', 'file', '.mkv', []);

            virtualTree.addEpisode(2, new Episode(1, file));
            virtualTree.addEpisode(2, new Episode(3, file));
            virtualTree.addEpisode(3, new Episode(4, file));
            const insert = () => virtualTree.addEpisode(2, new Episode(3, file));

            expect(insert).to.throw("Episode already added in the tree");
        });

        it('check insertion order', () => {
            const virtualTree = new VirtualTree();
            const file = new Tree('/a/b/c.mkv', 'c.mkv', 'file', '.mkv', []);

            virtualTree.addEpisode(3, new Episode(1, file));
            virtualTree.addEpisode(2, new Episode(3, file));
            virtualTree.addEpisode(2, new Episode(4, file));
            virtualTree.addEpisode(3, new Episode(4, file));
            virtualTree.addEpisode(1, new Episode(5, file));

            const expectedTree = readFile('insertion_order');

            expect(convertToYaml(virtualTree)).to.equal(expectedTree);
        });

    });

    describe('Tree traversal in sorted order', () => {

        it('base test', () => {
            const virtualTree = new VirtualTree();
            const file = new Tree('/game_of_thrones/Season2/episode_11.mkv', 'episode_11.mkv', 'file', '.mkv', []);
    
            virtualTree.addEpisode(3, new Episode(1, file));
            virtualTree.addEpisode(2, new Episode(3, file));
            virtualTree.addEpisode(2, new Episode(4, file));
            virtualTree.addEpisode(2, new Episode(1, file));
            virtualTree.addEpisode(3, new Episode(4, file));
            virtualTree.addEpisode(1, new Episode(5, file));
    
            const traversal: [number, number][] = [];
            
            virtualTree.forEach((season, episode) => {
                traversal.push([season.seasonNum, episode.episodeNum]);
            });

            const expectedTraversal = [[1, 5], [2, 1], [2, 3], [2, 4], [3, 1], [3, 4]];

            expect(traversal).to.eql(expectedTraversal);
        });
        
    });

    describe("Test 'this' keyword", () => {

        it('Arrow function vs regular functions in a class', function () {
            const abc = new ABC();
            this.hello = "lmao";

            expect(abc.test1()).to.equal("hey");
            expect(abc.test2()).to.equal("hey");
        });

    });

});

class ABC {
    hello: string = "hey";

    test1() {
        // console.log(this.hello);
        return this.hello;
    } 

    test2 = () => {
        // console.log(this.hello);
        return this.hello;
    }
}