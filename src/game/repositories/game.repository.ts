import { Game } from "../entities/game.entity";

export interface IGameRepository {
    insert(games: Game[]): Promise<void>;
    findAll(): Promise<Game[]>;
}

export const IGameRepository = Symbol("IGameRepository");