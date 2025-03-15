import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogParserService } from './game/log-parser/log-parser.service';
import { SaveGamesService } from './game/save-games/save-games.service';
import { RankingService } from './game/ranking/ranking.service';


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
}
bootstrap();
