import { Game } from "../entities/game.entity";

export interface IGameRepository {
    insertMany(games: Game[]): Promise<void>;
    findByID(id: string): Promise<Game | null>;
    findAll(): Promise<Game[]>;
}

export const IGameRepository = Symbol("IGameRepository");