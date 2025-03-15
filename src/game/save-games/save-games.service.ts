import { Inject, Injectable } from '@nestjs/common';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';

@Injectable()
export class SaveGamesService {
    constructor(
        @Inject(IGameRepository) protected readonly gameRepository: IGameRepository,
    ) { }

    async execute(games: Game[]): Promise<void> {
        if (games.length == 0) {
            return
        }
        return await this.gameRepository.insert(games);
    }
}
