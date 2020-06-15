import GeneralContext from "./GeneralContext";
import chalk from "chalk";
import { table } from "table";
import { SearchType } from "./FetcherProtocol";

export default class MovieContext extends GeneralContext {

    public pickAnotherMovieName() {
        this.log();
        const movieName = this.prompt.ask("Please enter another movie name: ");
        
        return this.removeWhiteSpaces(movieName);
    }    

    public pathToVideo(pathToMovie: string) {
        this.log(`The path to the movie is ${chalk.bgBlue.black(pathToMovie)}`);

        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue? [Y/n] ");

        if (!shouldContinue) this.exit();
    }

    public duration(duration: number) {
        this.log();
        this.log(`Calculated movie duration is ${chalk.green(this.secondsToHms(duration))}`);
        this.log();
        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue with this duration? [Y/n] ");

        if (!shouldContinue) this.exit();
    }

    public purging(files: string[]) {
        this.log();

        if (files.length > 0 ) {
            this.log("The following files are due to be purged:");
            this.log(files);
            this.log();
            const shouldContinue = this.prompt.yesNoQuestion("Do you want to purge them? [Y/n] ");

            if (!shouldContinue) this.exit();
        } else {
            this.log("No files found to purge.");
            this.log(chalk.green("Continuing..."));
        }
    }

    public pickMovieName(movieFromFolder: string) {
        this.log();
        this.log(`The movie name extracted form the folder name is ${chalk.blue(movieFromFolder)}`);
        const shouldContinue = this.prompt.yesNoQuestion(`Do you want continue with ${chalk.blue(movieFromFolder)}? [Y/n] `);
        
        if (shouldContinue) return movieFromFolder;

        this.log();
        const movieName = this.prompt.ask("Please enter the movie name: ");
        
        return this.removeWhiteSpaces(movieName);
    }

    public movieInfo(movieInfo: any) {
        this.log();
        this.log('Movie info extracted: ');
        this.log(movieInfo);

        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue with this information? [Y/n] ");

        if (!shouldContinue) this.exit();
    }
    
    public database(data: any) {
        let config = { columns: { 0: { width: 20 }, 1: { width: 50 } } };
        const dbEntriesTable = Object.entries(data).map(([key, value]) => [key, value]);
        
        this.log();
        this.log(table(dbEntriesTable, config));
        
        const shouldContinue = this.prompt.yesNoQuestion("Do you want to commit to the database? [y/n] ", false);
        
        if (!shouldContinue) this.exit();
        
        this.log();
        this.log("Adding to the database...");
    }
    
    public dbError(error: string) {
        this.log(`----- ${chalk.red("Error adding to the database")} -----`);
        this.log(error);
        this.log(`----------------------------------------`);
    }

    public shouldSelectDifferentName(selectedMovieName: string) {
        this.log(`Unable to find data for ${chalk.red(selectedMovieName)}`);

        return this.prompt.yesNoQuestion('Do you want to enter a different name? [Y/n] ');            
    }

    public selectSearch(searchTable: string[][], from: number, to: number) {
        this.log(table(searchTable));
    
        this.log();
        const validation = (num: number) => from <= num && num <= to;

        return this.prompt.enterNumber(`Please enter a number between ${from} and ${to}: `, validation);
    }
 
    // HELPERS

    private removeWhiteSpaces(str: string) {
        return str.replace(/(\s)+/g, " ").trim();
    }

    private secondsToHms(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 3600 % 60);
    
        const hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    
        return hDisplay + mDisplay + sDisplay; 
    }
}