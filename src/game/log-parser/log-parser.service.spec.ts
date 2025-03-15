import { Test, TestingModule } from '@nestjs/testing';
import { LogParserService } from './log-parser.service';
import { Player } from '../entities/player.entity';

describe('LogParserService', () => {
  let service: LogParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogParserService],
    }).compile();

    service = module.get<LogParserService>(LogParserService);
  });

  it('should parse log correctly for one match', () => {
    const log = `
    23/04/2019 15:34:22 - New match 11348965 has started
    23/04/2019 15:36:04 - Roman killed Nick using M16
    23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN
    23/04/2019 15:39:22 - Match 11348965 has ended
    `;

    const games = service.execute(log);

    expect(games).toHaveLength(1);
    expect(games[0].id).toBe("11348965");
    expect(games[0].start).toBe(new Date(2019, 3, 23, 15, 34, 22));
    expect(games[0].end).toBe(new Date(2019, 3, 23, 15, 39, 22));
    expect(games[0].players).toHaveLength(2);
    expect(games[0].players).toContain<Player>({
      name: "Roman",
      frags: [{
        isFriendlyFire: false,
        playerKilled: "Nick",
        time: new Date(2019, 3, 23, 15, 36, 4),
        weapon: "M16",
      }],
      deaths: 0,
      team: "",
    })

    expect(games[0].players).toContain<Player>({
      name: "Nick",
      frags: [],
      deaths: 2,
      team: "",
    })
  });

  it('should parse log correctly for two matches', () => {
    const log = `
      23/04/2019 15:34:22 - New match 11348965 has started
      23/04/2019 15:36:04 - Roman killed Nick using M16
      23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN
      23/04/2019 15:39:22 - Match 11348965 has ended

      23/04/2021 16:14:22 - New match 11348966 has started
      23/04/2021 16:26:04 - Roman killed Marcus using AK47
      23/04/2021 16:36:33 - <WORLD> killed Marcus by DROWN
      23/04/2021 16:37:33 - <WORLD> killed Roman by DROWN
      23/04/2021 16:49:22 - Match 11348966 has ended
    `;

    const games = service.execute(log);

    expect(games).toHaveLength(2);
    expect(games[0].id).toBe("11348965");
    expect(games[0].start).toBe(new Date(2019, 3, 23, 15, 34, 22));
    expect(games[0].end).toBe(new Date(2019, 3, 23, 15, 39, 22));
    expect(games[0].players).toHaveLength(2);
    expect(games[0].players).toContain<Player>({
      name: "Roman",
      frags: [{
        isFriendlyFire: false,
        playerKilled: "Nick",
        time: new Date(2019, 3, 23, 15, 36, 4),
        weapon: "M16",
      }],
      deaths: 0,
      team: "",
    })
    expect(games[0].players).toContain<Player>({
      name: "Nick",
      frags: [],
      deaths: 2,
      team: "",
    })

    expect(games[1].id).toBe("11348966");
    expect(games[1].start).toBe(new Date(2021, 3, 23, 16, 14, 22));
    expect(games[1].end).toBe(new Date(2021, 3, 23, 16, 49, 22));
    expect(games[1].players).toHaveLength(2);
    expect(games[1].players).toContain<Player>({
      name: "Roman",
      frags: [{
        isFriendlyFire: false,
        playerKilled: "Marcus",
        time: new Date(2021, 3, 23, 16, 26, 4),
        weapon: "AK47",
      }],
      deaths: 1,
      team: "",
    })
    expect(games[1].players).toContain<Player>({
      name: "Marcus",
      frags: [],
      deaths: 2,
      team: "",
    })
  });

  it('should parse log correctly for one match with teams', () => {
    const log = `
    23/04/2019 15:34:22 - New match 11348965123 has started
    23/04/2019 15:36:04 - Roman(A) killed Nick(B) using M16
    23/04/2019 15:36:33 - <WORLD> killed Nick(B) by DROWN
    23/04/2019 15:38:19 - Roman(A) killed Josh(A) using AK47
    23/04/2019 15:39:22 - Match 11348965123 has ended
    `;

    const games = service.execute(log);

    expect(games).toHaveLength(1);
    expect(games[0].id).toBe("11348965123");
    expect(games[0].start).toBe(new Date(2019, 3, 23, 15, 34, 22));
    expect(games[0].end).toBe(new Date(2019, 3, 23, 15, 39, 22));
    expect(games[0].players).toHaveLength(2);
    expect(games[0].players).toContain<Player>({
      name: "Roman",
      frags: [{
        isFriendlyFire: false,
        playerKilled: "Nick",
        time: new Date(2019, 3, 23, 15, 36, 4),
        weapon: "M16",
      },
      {
        isFriendlyFire: true,
        playerKilled: "Josh",
        time: new Date(2019, 3, 23, 15, 38, 19),
        weapon: "AK47",
      }],
      deaths: 0,
      team: "A",
    })

    expect(games[0].players).toContain<Player>({
      name: "Nick",
      frags: [],
      deaths: 2,
      team: "B",
    })

    expect(games[0].players).toContain<Player>({
      name: "Josh",
      frags: [],
      deaths: 1,
      team: "A",
    })
  });


  it('should not parse if log is incomplete', () => {
    const log = `
    23/04/2019 15:34:22 - New match 11348965123 has started
    23/04/2019 15:36:04 - Roman killed Nick using M16
    23/04/2019 15:36:33 - <WORLD> killed Nick by DROWN
    23/04/2019 15:38:19 - Roman killed Josh using AK47
    `;

    const games = service.execute(log);

    expect(games).toHaveLength(0);
  });

});
