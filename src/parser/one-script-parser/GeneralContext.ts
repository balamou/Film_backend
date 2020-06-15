import Prompt from './prompt';
import chalk from 'chalk';

export default class GeneralContext {
    protected prompt: Prompt;
    protected log: (...data: any[]) => void;

    constructor() {
        this.prompt = new Prompt();
        this.log = console.log;
    }

    /**
     * If the error is not nil it will print the error message and show a prompt asking
     * whether to continue execution.
     * 
     * If execution is not wanted it exits using an exception.
    */
    public error(error?: string) {
        if (!error) return;

        this.log();
        this.log(chalk.red(error));
        this.log();

        this.continueOrExit("Do you want to continue? [Y/n] ");
    }

    /**
     * Logs to the console
    */
    public logg(str: string) {
        this.log(str);
    }

    /**
     * Abruptly exits the flow of execution. 
     */
    protected exit() {
        throw new Error("Stop flow execution");    
    }

    /**
     * Ask a YES/NO question. If yes, nothing happens and the flow of control continues. 
     * If no, then abrubptly exits the flow of execution via an exception.
    */
    protected continueOrExit(message: string, enableEnterAsYes: boolean = true) {
        const shouldContinue = this.prompt.yesNoQuestion(message, enableEnterAsYes);

        if (!shouldContinue) this.exit();
    }
}