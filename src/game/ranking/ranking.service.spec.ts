import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { IGameRepository } from '../repositories/game.repository';
import { Game } from '../entities/game.entity';

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

  it('should return ranking for one game', async () => {
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
          },
          {
            isFriendlyFire: false,
            playerKilled: "Nick",
            time: new Date(2025, 0, 1, 12, 5, 0),
            weapon: "AK47",
          }],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 10, 0),
          }],
          team: "",
        },
        {
          name: "Nick",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Roman",
            time: new Date(2025, 0, 1, 12, 10, 0),
            weapon: "AK47",
          }],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 2, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          }],
          team: "",
        }
      ]
    }];

    (gameRepository.findAll as jest.Mock).mockResolvedValue(games);

    const rankings = await service.execute();

    expect(rankings).toHaveLength(1);
    expect(rankings[0].gameID).toBe("123245");
    expect(rankings[0].players.find(p => p.name === "Roman")).toEqual({
      name: "Roman",
      frags: 3,
      deaths: 1,
      killStreak: 3,
      preferredWeapon: "M16",
      awards: [],
    })
    expect(rankings[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      killStreak: 1,
      frags: 1,
      deaths: 3,
      preferredWeapon: "AK47",
      awards: [],
    })
  });


  it('should return ranking with immortal award', async () => {
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
          deaths: [],
          team: "",
        },
        {
          name: "Nick",
          frags: [],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 2, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          }],
          team: "",
        }
      ]
    }];

    (gameRepository.findAll as jest.Mock).mockResolvedValue(games);

    const rankings = await service.execute();

    expect(rankings).toHaveLength(1);
    expect(rankings[0].gameID).toBe("123245");
    expect(rankings[0].players.find(p => p.name === "Roman")).toEqual({
      name: "Roman",
      frags: 2,
      deaths: 0,
      killStreak: 2,
      preferredWeapon: "M16",
      awards: ["immortal"],
    })
    expect(rankings[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      killStreak: 0,
      frags: 0,
      deaths: 2,
      preferredWeapon: "",
      awards: [],
    })
  });


  it('should return ranking correctly with friendly fire', async () => {
    const games: Game[] = [{
      id: "123245",
      start: new Date(2025, 0, 1, 12, 0, 0),
      end: new Date(2025, 0, 1, 13, 0, 0),
      players: [
        {
          name: "Roman",
          frags: [{
            isFriendlyFire: true,
            playerKilled: "Nick",
            time: new Date(2025, 0, 1, 12, 2, 0),
            weapon: "M16",
          },
          {
            isFriendlyFire: true,
            playerKilled: "Nick",
            time: new Date(2025, 0, 1, 12, 5, 0),
            weapon: "M16",
          }],
          deaths: [],
          team: "",
        },
        {
          name: "Nick",
          frags: [],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 2, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          }],
          team: "",
        }
      ]
    }];

    (gameRepository.findAll as jest.Mock).mockResolvedValue(games);

    const rankings = await service.execute();

    expect(rankings).toHaveLength(1);
    expect(rankings[0].gameID).toBe("123245");
    expect(rankings[0].players.find(p => p.name === "Roman")).toEqual({
      name: "Roman",
      frags: -2,
      deaths: 0,
      killStreak: 0,
      preferredWeapon: "M16",
      awards: ["immortal"],
    })
    expect(rankings[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      killStreak: 0,
      frags: 0,
      deaths: 2,
      preferredWeapon: "",
      awards: [],
    })
  });


  it('should return global ranking correctly', async () => {
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
          deaths: [{
            time: new Date(2025, 0, 1, 12, 10, 0),
          }],
          team: "",
        },
        {
          name: "Nick",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Roman",
            time: new Date(2025, 0, 1, 12, 10, 0),
            weapon: "AK47",
          }],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 2, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          }],
          team: "",
        }
      ]
    },
    {
      id: "987654",
      start: new Date(2025, 0, 3, 13, 0, 0),
      end: new Date(2025, 0, 3, 15, 0, 0),
      players: [
        {
          name: "Roman",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Josh",
            time: new Date(2025, 0, 1, 12, 2, 0),
            weapon: "M16",
          },
          {
            isFriendlyFire: false,
            playerKilled: "Josh",
            time: new Date(2025, 0, 1, 12, 5, 0),
            weapon: "M16",
          }],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 10, 0),
          }],
          team: "",
        },
        {
          name: "Josh",
          frags: [{
            isFriendlyFire: false,
            playerKilled: "Roman",
            time: new Date(2025, 0, 1, 12, 10, 0),
            weapon: "AK47",
          }],
          deaths: [{
            time: new Date(2025, 0, 1, 12, 2, 0),
          },
          {
            time: new Date(2025, 0, 1, 12, 5, 0),
          }],
          team: "",
        }
      ]
    }
    ];

    (gameRepository.findAll as jest.Mock).mockResolvedValue(games);

    const rankings = await service.execute(true);

    expect(rankings).toHaveLength(1);
    expect(rankings[0].gameID).toBe("global");
    expect(rankings[0].players.find(p => p.name === "Roman")).toEqual({
      name: "Roman",
      frags: 4,
      deaths: 2,
      killStreak: 4,
      preferredWeapon: "M16",
      awards: [],
    })
    expect(rankings[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      killStreak: 1,
      frags: 1,
      deaths: 2,
      preferredWeapon: "AK47",
      awards: [],
    })
    expect(rankings[0].players.find(p => p.name === "Josh")).toEqual({
      name: "Josh",
      killStreak: 1,
      frags: 1,
      deaths: 2,
      preferredWeapon: "AK47",
      awards: [],
    })
  });
});
