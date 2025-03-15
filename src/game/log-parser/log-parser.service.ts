import { Injectable } from '@nestjs/common';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';

const matchStartRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - New match (\d+) has started/;
const killRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - (.+?)(?:\(\D\))? killed (.+?)(?:\(\D\))? using (.+)/;
const worldKillRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - <WORLD> killed (.+?)(?:\(\D\))? by .+/;
const matchEndRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}) - Match (\d+) has ended/;
const teamRegex = /\((\D)\)(?:.+\((\D)\))?/;
const maxPlayers = 20;

@Injectable()
export class LogParserService {
    execute(logs: string): Game[] {
        const lines = logs.split('\n').map(line => line.trim()).filter(line => line !== '');
        const games: Game[] = [];
        let currentGame: Game | null = null;

        for (const line of lines) {
            const matchStartMatch = line.match(matchStartRegex);
            if (matchStartMatch) {
                if (currentGame) {
                    // Game already started and log is invalid
                    continue;
                }
                currentGame = {
                    id: matchStartMatch[2],
                    start: this.parseDateTime(matchStartMatch[1]),
                    players: [],
                };
                continue;
            }

            const killMatch = line.match(killRegex);
            if (killMatch) {
                if (!currentGame) {
                    continue;
                }
                const time = this.parseDateTime(killMatch[1]);
                const killerName = killMatch[2];
                const victimName = killMatch[3];
                const weapon = killMatch[4];
                let killerTeam = ""
                let victimTeam = ""

                const teamMatch = line.match(teamRegex)
                if (teamMatch) {
                    killerTeam = teamMatch[1]
                    victimTeam = teamMatch[2]
                }

                let killer = currentGame.players.find(p => p.name === killerName);
                if (!killer) {
                    killer = new Player(killerName, killerTeam);
                    currentGame.players.push(killer);
                }
                killer.frags.push({
                    playerKilled: victimName,
                    weapon,
                    time,
                    isFriendlyFire: (killerTeam != "" && killerTeam == victimTeam),
                });

                let victim = currentGame.players.find(p => p.name === victimName);
                if (!victim) {
                    victim = new Player(victimName, victimTeam);
                    currentGame.players.push(victim);
                }
                victim.deaths.push({
                    time: time,
                });

                continue;
            }

            const worldKillMatch = line.match(worldKillRegex);
            if (worldKillMatch) {
                if (!currentGame) {
                    continue;
                }
                const time = this.parseDateTime(worldKillMatch[1]);
                const victimName = worldKillMatch[2];
                let victimTeam = ""

                const teamMatch = line.match(teamRegex)
                if (teamMatch) {
                    victimTeam = teamMatch[1]
                }

                let victim = currentGame.players.find(p => p.name === victimName);
                if (!victim) {
                    victim = new Player(victimName, victimTeam);
                    currentGame.players.push(victim);
                }
                victim.deaths.push({
                    time: time,
                });
                continue;
            }

            const matchEndMatch = line.match(matchEndRegex);
            if (matchEndMatch) {
                if (!currentGame) {
                    continue;
                }
                currentGame.end = this.parseDateTime(matchEndMatch[1]);

                // Games with more than max players are discarded
                if (currentGame.players.length <= maxPlayers) {
                    games.push(currentGame);
                }
                currentGame = null;
            }
        }

        return games;
    }

    private parseDateTime(dateTimeString: string): Date {
        const parts = dateTimeString.split(/[\/\s:]+/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);

        return new Date(year, month, day, hours, minutes, seconds);
    }
}
