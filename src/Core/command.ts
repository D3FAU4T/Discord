import type { commandsInterface } from "../Typings/commands.js";

export class Command {
    constructor(commandOptions: commandsInterface) {
        Object.assign(this, commandOptions);
    }
}