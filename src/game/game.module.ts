import { Module } from '@nestjs/common';
import { LogParserService } from './log-parser/log-parser.service';

@Module({
  providers: [LogParserService]
})
export class GameModule { }
