import { expect } from 'chai';
import '../../src/parser/Tree/Array';


describe('Array extensions', function () {

    describe('Does include', () => {

        it('compare on name attribute', () => {
            const people = [{ name: 'Elon Musk', birth: 1971 }, { name: 'Albert Einstein', birth: 1879 }, { name: 'Kurt Gödel', birth: 1906 }];

            const doesInclude = people.doesInclude({ name: 'Elon Musk', birth: 1971 }, (lhs, rhs) => lhs.name === rhs.name);

            expect(doesInclude).to.be.true;
        });

        it('compare on age attribute', () => {
            const elonMusk = { name: 'Elon Musk', birth: 1971 };
            const people = [{ name: 'Elon Musk', birth: 1980 }, { name: 'Albert Einstein', birth: 1879 }, { name: 'Kurt Gödel', birth: 1906 }];

            const doesInclude = people.doesInclude(elonMusk, (lhs, rhs) => lhs.birth === rhs.birth);

            expect(doesInclude).to.be.false;
        });

        it('empty array', () => {
            const elonMusk = { name: 'Elon Musk', birth: 1971 };
            const people: { name: string, birth: number }[] = [];

            const doesInclude = people.doesInclude(elonMusk, (lhs, rhs) => lhs.birth === rhs.birth);

            expect(doesInclude).to.be.false;
        });

    });


    describe('Intersect', () => {
        it('base test', () => {
            const first = [{ path: "a/b/c", contents: [1, 3] }, { path: "d/c", contents: [3, 4] }, { path: "d/e", contents: [1, 3] }];
            const second = [{ path: "m/f/d", contents: [1, 3] }, { path: "d/c", contents: [5, 7] }, { path: "d/e", contents: [9, 0] }];

            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );
            const result = [[{ path: "d/c", contents: [3, 4] }, 
            { path: "d/c", contents: [5, 7] }],
            [{ path: "d/e", contents: [1, 3] },
            { path: "d/e", contents: [9, 0] }]];

            expect(intersection).to.eql(result);
        });

        it('empty intersection on two different arrays', () => {
            const first = [{ path: "a/b/f", contents: [1, 3] }, { path: "d/c/m", contents: [3, 4] }, { path: "d/e/h", contents: [1, 3] }];
            const second = [{ path: "m/f/d", contents: [1, 3] }, { path: "d/c", contents: [5, 7] }, { path: "d/e", contents: [9, 0] }];

            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );
            expect(intersection).to.eql([]);
        });

        it('empty right array', () => {
            const first: {path: string, contents: number[]}[] = [];
            const second = [{ path: "m/f/d", contents: [1, 3] }, { path: "d/c", contents: [5, 7] }, { path: "d/e", contents: [9, 0] }];

            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );
            expect(intersection).to.eql([]);
        });

        it('empty left array', () => {
            const first = [{ path: "m/f/d", contents: [1, 3] }, { path: "d/c", contents: [5, 7] }, { path: "d/e", contents: [9, 0] }];
            const second: {path: string, contents: number[]}[] = [];

            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );
            expect(intersection).to.eql([]);
        });

        it('empty arrays', () => {
            const first: {path: string, contents: number[]}[] = [];
            const second: {path: string, contents: number[]}[] = [];

            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );
            expect(intersection).to.eql([]);
        });

        it('equal arrays on single attribute', () => {
            const first = [{ path: "m/f/d", contents: [1, 3] }, { path: "d/c", contents: [5, 7] }, { path: "d/e", contents: [9, 0] }];
            const second = [{ path: "m/f/d", contents: [2, 3] }, { path: "d/c", contents: [7, 9] }, { path: "d/e", contents: [0] }];
            
            const intersection = first.intersect(second, (lhs, rhs) => lhs.path === rhs.path );

            const result = [[{ path: "m/f/d", contents: [1, 3] }, { path: "m/f/d", contents: [2, 3] }],
            [{ path: "d/c", contents: [5, 7] }, { path: "d/c", contents: [7, 9] }],
            [{ path: "d/e", contents: [9, 0] }, { path: "d/e", contents: [0] }]];

            expect(intersection).to.eql(result);
        });

        it('intersect on different attributes', () => {
            const first = [{a: "south", b: "park"}, {a: "rick", b: "morty"}];
            const second = [{a: "west", b: "south"}, {a: "rick", b: "morty"}];
            
            const intersection = first.intersect(second, (lhs, rhs) => lhs.a === rhs.b );

            const result = [[{a: "south", b: "park"}, {a: "west", b: "south"}]];

            expect(intersection).to.eql(result);
        });
    });


    describe('But not in', () => {
        it('base test', () => {
            const first = ['michael', 'dwight', 'jim'];
            const second = ['dwight', 'pam', 'phylis', 'ryan'];

            const leftJoin = first.butNotIn(second, (lhs, rhs) => lhs === rhs);

            expect(leftJoin).to.eql(['michael', 'jim']);
        });

        it('empty left array', () => {
            const first: string[] = [];
            const second = ['dwight', 'pam', 'phylis', 'ryan'];

            const leftJoin = first.butNotIn(second, (lhs, rhs) => lhs === rhs);

            expect(leftJoin).to.eql([]);
        });

        it('empty right array', () => {
            const first = ['dwight', 'pam', 'phylis', 'ryan'];
            const second: string[] = [];

            const leftJoin = first.butNotIn(second, (lhs, rhs) => lhs === rhs);

            expect(leftJoin).to.eql(['dwight', 'pam', 'phylis', 'ryan']);
        });

        it('different arrays', () => {
            const first = ['dwight', 'pam', 'phylis', 'ryan'];
            const second = ['michael', 'daryl', 'toby'];

            const leftJoin = first.butNotIn(second, (lhs, rhs) => lhs === rhs);

            expect(leftJoin).to.eql(['dwight', 'pam', 'phylis', 'ryan']);
        });

        it('object arrays', () => {
            const first = [{name: 'dwight', level: 10}, {name: 'pam', level: 4}, { name: 'phylis', level: 6}, {name: 'ryan', level: 4}];
            const second = [{name: 'michael', level: 3}, {name: 'pam', level: 8}];

            const leftJoin = first.butNotIn(second, (lhs, rhs) => lhs.name === rhs.name);

            expect(leftJoin).to.eql([{ name: 'dwight', level: 10 }, { name: 'phylis', level: 6 }, { name: 'ryan', level: 4 }]);
        });
    });


    describe('Flat Map', () => {
        it('base test', () => {
            const test = ['Google', 'Shopify', 'Microsoft', 'Facebook', 'Netflix', 'Snapchat'];
            const flatMapResult = test.flatMap(s => [`(${s})`]);

            expect(flatMapResult).to.eql(['(Google)', '(Shopify)', '(Microsoft)', '(Facebook)', '(Netflix)', '(Snapchat)']);
        });

        it('duplicate elements', () => {
            const test = ['Google', 'Shopify', 'Microsoft', 'Facebook', 'Netflix', 'Snapchat'];
            const flatMapResult = test.flatMap(s => [s, s]);

            expect(flatMapResult).to.eql(['Google', 'Google', 'Shopify', 'Shopify', 'Microsoft', 'Microsoft', 'Facebook', 'Facebook', 'Netflix', 'Netflix', 'Snapchat', 'Snapchat']);
        });

        it('double nested map', () => {
            const test = ['Google', 'Shopify', 'Microsoft', 'Facebook', 'Netflix', 'Snapchat'];
            const flatMapResult = test.flatMap(s => [[s, s]]);

            expect(flatMapResult).to.eql([['Google', 'Google'], ['Shopify', 'Shopify'], ['Microsoft', 'Microsoft'], ['Facebook', 'Facebook'], ['Netflix', 'Netflix'], ['Snapchat', 'Snapchat']]);
        });
    });

});