import { Inject, Injectable } from '@nestjs/common';
import { Ranking } from '../entities/ranking.entity';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { PlayerRanking } from '../entities/player-ranking.entity';
import { Frag } from '../entities/frag.entity';

// immortalAward is given to a player that wins a match without dying
const immortalAward = "immortal"

@Injectable()
export class RankingService {
    constructor(
        @Inject(IGameRepository) private readonly gameRepository: IGameRepository,
    ) { }

    async execute(global: boolean = false): Promise<Ranking[]> {
        let games: Game[] = await this.gameRepository.findAll();
        let rankings: Ranking[] = [];

        if (games.length == 0) {
            return rankings;
        }

        if (global) {
            games = [this.createGlobalGame(games)];
        }

        for (const game of games) {
            const gameRanking: Ranking = {
                gameID: game.id,
                players: this.generatePlayerRanking(game)
            };

            rankings.push(gameRanking)
        }

        return rankings;
    }

    private createGlobalGame(games: Game[]): Game {
        let globalPlayers: Player[] = []
        for (const game of games) {
            for (const player of game.players) {
                let globalPlayer = globalPlayers.find(p => p.name === player.name);
                if (!globalPlayer) {
                    globalPlayer = new Player(player.name, player.team);
                    globalPlayers.push(globalPlayer)
                }

                globalPlayer.frags = globalPlayer.frags.concat(player.frags)
                globalPlayer.deaths = globalPlayer.deaths.concat(player.deaths)
            }
        }
        const globalGame: Game = { id: 'global', start: new Date(), end: new Date(), players: globalPlayers }
        return globalGame;
    }

    private generatePlayerRanking(game: Game): PlayerRanking[] {
        const playerRankings: PlayerRanking[] = [];

        for (const player of game.players) {
            const preferredWeapon = this.getPreferredWeapon(player.frags);
            const frags = this.calculateFrags(player.frags);
            const awards = this.getAwards(player);

            playerRankings.push({
                name: player.name,
                frags: frags,
                deaths: player.deaths.length,
                preferredWeapon: preferredWeapon,
                killStreak: 0, //TODO: Calculate killstreak
                awards: awards,
            });
        }

        playerRankings.sort((a, b) => {
            if (b.frags !== a.frags) {
                return b.frags - a.frags;
            } else {
                return a.deaths - b.deaths;
            }
        });

        return playerRankings;
    }

    private getPreferredWeapon(frags: Frag[]): string {
        if (frags.length == 0) {
            return "";
        }

        let weaponCounts: Record<string, number> = {};
        let maxCount = 0;
        let preferredWeapon = "";
        for (const frag of frags) {
            weaponCounts[frag.weapon] = (weaponCounts[frag.weapon] || 0) + 1;
            if (weaponCounts[frag.weapon] > maxCount) {
                maxCount = weaponCounts[frag.weapon];
                preferredWeapon = frag.weapon;
            }
        }
        return preferredWeapon;
    }

    private calculateFrags(frags: Frag[]): number {
        let fragCount = 0;

        for (const frag of frags) {
            fragCount += frag.isFriendlyFire ? -1 : 1;
        }

        return fragCount;
    }

    private getAwards(player: Player): string[] {
        let awards: string[] = [];

        if (player.deaths.length == 0) {
            awards.push(immortalAward)
        }

        return awards;
    }
}