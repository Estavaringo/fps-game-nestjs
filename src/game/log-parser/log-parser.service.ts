import { Injectable } from '@nestjs/common';
import { Game } from '../entities/game.entity';

@Injectable()
export class LogParserService {
    execute(log: string): Game[] {
        var games: Game[] = [];
        return games;
    }
}
