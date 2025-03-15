import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { PlayerRanking } from '../entities/player-ranking.entity';

describe('RankingService unit tests', () => {
  let service: RankingService;
  let gameRepository: IGameRepository

  const mockGameRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: IGameRepository,
          useValue: mockGameRepository,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    gameRepository = module.get<IGameRepository>(IGameRepository);
  });

  it('should return ranking for one game wihtout awards', async () => {
    const games: Game[] = [{
      id: "123245",
      start: new Date(2025, 0, 1, 12, 0, 0),
      end: new Date(2025, 0, 1, 13, 0, 0),
      players: [
        {
          name: "Roman",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Nick",
            time: new Date(2025, 0, 1, 12, 2, 0),
            weapon: "M16",
          },
          {
            isFriendlyFire: false,
            playerKilled: "Nick",
            time: new Date(2025, 0, 1, 12, 5, 0),
            weapon: "M16",
          }],
          deaths: 1,
          team: "",
        },
        {
          name: "Nick",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Roman",
            time: new Date(2025, 0, 1, 12, 10, 0),
            weapon: "M16",
          }],
          deaths: 2,
          team: "",
        }
      ]
    }];

    (gameRepository.findAll as jest.Mock).mockResolvedValue(games);

    const rankings = await service.execute();

    expect(rankings).toHaveLength(1);
    expect(rankings[0].gameID).toBe("123245");
    expect(rankings[0].players).toContain<PlayerRanking>(
      {
        position: 1,
        player: "Roman",
        awards: [],
        killStreak: 2,
      }
    )
    expect(rankings[0].players).toContain<PlayerRanking>(
      {
        position: 2,
        player: "Nick",
        awards: [],
        killStreak: 1,
      }
    )
  });
});
