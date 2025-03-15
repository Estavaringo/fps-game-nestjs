import { Inject, Injectable } from '@nestjs/common';
import { Ranking } from '../entities/ranking.entity';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';

@Injectable()
export class RankingService {
    constructor(
        @Inject(IGameRepository) protected readonly gameRepository: IGameRepository,
    ) { }

    async execute(): Promise<Ranking[]> {
        const games: Game[] = await this.gameRepository.findAll();
        let rankings: Ranking[] = [];

        return rankings;
    }
}
