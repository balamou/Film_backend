import { expect } from 'chai';

import MockFSEditor from '../stub/MockFSEditor';
import { FSEditor } from '../../src/parser/Adapters/FSEditor';

describe('FSEditor', () => {
    const rootFolder = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders';

    describe('Remove subpaths', () => {

        it('base test', () => {
            const fsEditor = new FSEditor();
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = fsEditor['removeSubpaths'](path, 2);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12');
        });

        it('deeper level', () => {
            const fsEditor = new FSEditor();
            const path = '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv';

            const finalDir = fsEditor['removeSubpaths'](path, 4);

            expect(finalDir).to.equal('/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders');
        });

        it('one level up', () => {
            const fsEditor = new FSEditor();
            const path = '/a/b/c/d/video.mkv';

            const finalDir = fsEditor['removeSubpaths'](path, 2);

            expect(finalDir).to.equal('/a/b/c');
        });

        it('all the way up', () => {
            const fsEditor = new FSEditor();
            const path = '/a/b/c/d/video.mkv';

            const finalDir = fsEditor['removeSubpaths'](path, 5);

            expect(finalDir).to.equal('/');
        });

        it('relative path', () => {
            const fsEditor = new FSEditor();
            const path = 'a/b/c/d/video.mkv';

            const finalDir = fsEditor['removeSubpaths'](path, 3);

            expect(finalDir).to.equal('a/b');
        });

    });

    describe('Move files to level', () => {

        it('base test', () => {
            const fsEditor = new FSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
                return undefined;
            };
    
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            moveUp.forEach(x => fsEditor.moveFileToLevel(x.path, x.level, 2));
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });

        it('move to level 3', () => {
            const fsEditor = new FSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
                return undefined;
            };
    
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            moveUp.forEach(x => fsEditor.moveFileToLevel(x.path, x.level, 3));
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });

        it('move to level 0', () => {
            const fsEditor = new FSEditor();
            const result: [string, string][] = [];
            
            fsEditor.moveFileToFolder = (from: string, to: string) => {
                result.push([from, to]);
                return undefined;
            };
    
            const moveUp = [{ path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv`, level: 3},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4`, level: 4},
                            { path: `${rootFolder}/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4`, level: 4}];
    
            moveUp.forEach(x => fsEditor.moveFileToLevel(x.path, x.level, 0));
    
            const expectation = [
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x02].mkv',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 10/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ],
                [
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders/video_files_below_level_2/Season 12/nested_videos/deeply nested/South park [3x03].mp4',
                  '/Users/michelbalamou/Downloads/Film_backend/tests/ExampleTrees/example_folders'
                ]
              ];
    
            expect(result).to.eql(expectation);
        });


    });

});