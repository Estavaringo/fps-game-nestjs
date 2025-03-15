import { Game } from "src/game/entities/game.entity"
import { IGameRepository } from "../game.repository"

export class MemoryRepository implements IGameRepository {
  items: Game[] = []

  async insert(games: Game[]): Promise<void> {
    for (var game of games) {
      if (this.items.findIndex(g => g.id === game.id) === -1) {
        this.items.push(...games)
      }
    }
  }

  async findAll(): Promise<Game[]> {
    return this.items
  }
}