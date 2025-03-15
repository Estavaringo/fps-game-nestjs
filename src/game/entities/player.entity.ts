import { Death } from "./death.entity";
import { Frag } from "./frag.entity";

export class Player {
    name: string;
    frags: Frag[];
    deaths: Death[];
    team: string;
    constructor(name: string, team: string) {
        this.name = name;
        this.team = team;
        this.frags = [];
        this.deaths = [];
    }
}