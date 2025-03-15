import { Player } from "./player.entity";

export class Game {
    id: string;
    start: Date;
    end?: Date;
    players: Player[];
}