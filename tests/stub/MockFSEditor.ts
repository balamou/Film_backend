import { FileSystemEditor } from '../../src/parser/Adapters/FSEditor';

export default class MockFSEditor implements FileSystemEditor {
    moveFileToLevel(filePath: string, level: number, desiredLevel: number): void {
        throw new Error("Method not implemented.");
    }

    makeDirectory(dirName: string): void {
        throw new Error("Method not implemented.");
    }    
    
    moveAndRename(from: string, to: string): void {
        throw new Error("Method not implemented.");
    }
    
    moveFileToFolder(from: string, to: string): void {
        throw new Error("Method not implemented.");
    }

    doesFileExist(path: string): boolean {
        throw new Error("Method not implemented.");
    }

    deleteFile(path: string): void {
        throw new Error("Method not implemented.");
    }

    readFile(path: string): string {
        throw new Error("Method not implemented.");
    }

    writeToFile(path: string, data: string): void {
        throw new Error("Method not implemented.");
    }
}