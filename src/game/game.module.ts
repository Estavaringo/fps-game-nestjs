import { Module } from '@nestjs/common';
import { LogParserService } from './log-parser/log-parser.service';
import { SaveGamesService } from './save-games/save-games.service';
import { IGameRepository } from './repositories/game.repository';
import { MemoryRepository } from './repositories/adapters/memory.repository';
import { RankingService } from './ranking/ranking.service';

@Module({
  providers: [
    LogParserService,
    SaveGamesService,
    {
      provide: IGameRepository,
      useClass: MemoryRepository //implementation could be changed by an environment variable
    },
    RankingService
  ]
})
export class GameModule { }
