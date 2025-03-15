import { Injectable, OnModuleInit } from '@nestjs/common';
import { LogParserService } from '../log-parser/log-parser.service';
import { SaveGamesService } from '../save-games/save-games.service';
import { RankingService } from '../ranking/ranking.service';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Ranking } from '../entities/ranking.entity';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class CliService {
    private rl: readline.Interface;

    constructor(
        private readonly logParserService: LogParserService,
        private readonly saveGamesService: SaveGamesService,
        private readonly rankingService: RankingService,
    ) { }


    onModuleInit() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.showMenu(0);
    }

    private async showMenu(sleepTime: number) {
        await sleep(sleepTime);
        console.log('\n\nMENU:');
        console.log('1 - Upload log file');
        console.log('2 - Show rankings');
        console.log('3 - Show global ranking');
        console.log('4 - Exit');

        this.rl.question('\nEnter your choice: ', (choice) => {
            this.handleChoice(choice);
        });
    }

    private async handleChoice(choice: string) {
        switch (choice) {
            case '1':
                await this.uploadLogFile();
                break;
            case '2':
                let rankings = await this.rankingService.execute(false)
                this.displayRanking(rankings)
                this.showMenu(1500);
                break;
            case '3':
                let globalRanking = await this.rankingService.execute(true)
                this.displayRanking(globalRanking)
                this.showMenu(1500);
                break;
            case '4':
                this.rl.close();
                process.exit(0);
            default:
                console.log('\nInvalid choice. Please try again.\n');
                this.showMenu(1500);
        }
    }

    private async uploadLogFile() {
        this.rl.question('Enter the log file path: ', async (filePath) => {
            try {
                const fileContent = await fs.readFile(path.resolve(filePath), 'utf-8');
                console.log('File content read successfully.');
                const games = this.logParserService.execute(fileContent)
                await this.saveGamesService.execute(games);
                console.log('Log file processing completed.');
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.error(`Error: File not found at ${filePath}`);
                } else {
                    console.error('Error reading file:', error.message);
                }
            }
            this.showMenu(1500);
        });
    }


    private displayRanking(rankings: Ranking[]) {
        if (rankings.length == 0) {
            console.log('There is no match information to show rankings.')
            return;
        }

        for (var ranking of rankings) {
            console.log(`Game ID: ${ranking.gameID}`);
            console.table(ranking.players);
        }
    }
}
