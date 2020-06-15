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

        const shouldContinue = this.prompt.yesNoQuestion("Do you want to continue? [Y/n] ");
        if (!shouldContinue) this.exit();
    }

    /**
     * Logs to the console
    */
    public logg(str: string) {
        this.log(str);
    }

    /**
     * Asks a yes or no question. Returns true if yes, and false if no.
     */
    public ask(question: string) {
        return this.prompt.yesNoQuestion(question);
    }

    /**
     * Abruptly exits the flow of execution. 
     */
    protected exit() {
        throw new Error("Stop flow execution");    
    }
}