import { Player } from "./player.entity";

export class PlayerRanking{
    position: number;
    player: Player;
    awards: string[];
    killStreak: number;
}