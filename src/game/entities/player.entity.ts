import { Frag } from "./frag.entity";

export class Player {
    name: string;
    frags: Frag[];
    deaths: number;
    team?: string;
    constructor(name: string) {
        this.name = name;
        this.frags = [];
        this.deaths = 0;
    }
}