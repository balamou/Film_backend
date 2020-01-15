import promptSync from 'prompt-sync';

class Prompt {
    private prompt = promptSync({ sigint: true });

    ask(message: string) {
        return this.prompt(message);
    }
    
    yesNoQuestion(question: string, enableEnterAsYes: boolean = true) {
        let answer = this.prompt(question);
        answer = answer.toLowerCase();

        if (answer.length === 0 && enableEnterAsYes === true) return true;

        while (!(answer === 'y' || answer === 'n')) {
            console.log("Please answer Y (yes) or N (no)");
            answer = this.prompt(question) as string;
            answer = answer.toLowerCase();

            if (answer.length === 0 && enableEnterAsYes === true) return true;
        }

        if (answer === 'y') {
            return true;
        }

        return false;
    }

    enterNumber(message: string, validation?: (num: number) => boolean, validationMessage?: string) {
        let integer = this._parseInt(this.prompt(message));
        const isValid = validation ?? (() => true);

        while (integer === undefined || !isValid(integer)) {
            if (integer === undefined) {
                console.log('Please enter a valid integer');
            } else if (!isValid(integer) && validationMessage) {
                console.log(validationMessage);
            }

            integer = this._parseInt(this.prompt(message));
        }

        return integer;
    }

    private _parseInt(s: string) {
        let num = parseInt(s);

        if (!isNaN(num))
            return num;
    }
}

export default Prompt;