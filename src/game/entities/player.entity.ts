import { Frag } from "./frag.entity";

export class Player {
    name: string;
    frags: Frag[];
    deaths: number;
    team: string;
}