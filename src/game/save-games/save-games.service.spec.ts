import { Test, TestingModule } from '@nestjs/testing';
import { SaveGamesService } from './save-games.service';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';


describe('SaveGamesService unit tests', () => {
  let service: SaveGamesService;
  let gameRepository: IGameRepository

  const mockGameRepository = {
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveGamesService,
        {
          provide: IGameRepository,
          useValue: mockGameRepository,
        },
      ],
    }).compile();

    service = module.get<SaveGamesService>(SaveGamesService);
    gameRepository = module.get<IGameRepository>(IGameRepository);
  });

  it('should not save if games array is empty', async () => {
    await service.execute([])

    expect(gameRepository.insert).toHaveBeenCalledTimes(0);
  });

  it('should save for one game', async () => {

    const games: Game[] = [{
      id: "test",
      start: new Date(),
      end: new Date(),
      players: []
    }]

    await service.execute(games)
    expect(gameRepository.insert).toHaveBeenCalledWith(games);
  });

  it('should save for many games', async () => {

    const games: Game[] = [{
      id: "test",
      start: new Date(),
      end: new Date(),
      players: []
    },
    {
      id: "test2",
      start: new Date(),
      end: new Date(),
      players: []
    }
    ]

    await service.execute(games)
    expect(gameRepository.insert).toHaveBeenCalledWith(games);
  });
});
