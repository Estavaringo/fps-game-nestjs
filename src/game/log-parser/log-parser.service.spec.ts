import { Test, TestingModule } from '@nestjs/testing';
import { LogParserService } from './log-parser.service';
import { Player } from '../entities/player.entity';

describe('LogParserService Unit Tests', () => {
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
    expect(games[0].start.getTime()).toBe(new Date(2019, 3, 23, 15, 34, 22).getTime());
    expect(games[0].end?.getTime()).toBe(new Date(2019, 3, 23, 15, 39, 22).getTime());
    expect(games[0].players).toHaveLength(2);
    expect(games[0].players.find(p => p.name === "Roman")).toEqual({
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
    expect(games[0].players.find(p => p.name === "Nick")).toEqual({
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
    expect(games[0].start.getTime()).toBe(new Date(2019, 3, 23, 15, 34, 22).getTime());
    expect(games[0].end?.getTime()).toBe(new Date(2019, 3, 23, 15, 39, 22).getTime());
    expect(games[0].players).toHaveLength(2);
    expect(games[0].players.find(p => p.name === "Roman")).toEqual({
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
    expect(games[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      frags: [],
      deaths: 2,
      team: "",
    })

    expect(games[1].id).toBe("11348966");
    expect(games[1].start.getTime()).toBe(new Date(2021, 3, 23, 16, 14, 22).getTime());
    expect(games[1].end?.getTime()).toBe(new Date(2021, 3, 23, 16, 49, 22).getTime());
    expect(games[1].players).toHaveLength(2);
    expect(games[1].players.find(p => p.name === "Roman")).toEqual({
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
    expect(games[1].players.find(p => p.name === "Marcus")).toEqual({
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
    expect(games[0].start.getTime()).toBe(new Date(2019, 3, 23, 15, 34, 22).getTime());
    expect(games[0].end?.getTime()).toBe(new Date(2019, 3, 23, 15, 39, 22).getTime());
    expect(games[0].players).toHaveLength(3);
    expect(games[0].players.find(p => p.name === "Roman")).toEqual({
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
    expect(games[0].players.find(p => p.name === "Nick")).toEqual({
      name: "Nick",
      frags: [],
      deaths: 2,
      team: "B",
    })
    expect(games[0].players.find(p => p.name === "Josh")).toEqual({
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


  it('should not parse if match has more than max players', () => {
    const log = `
      28/04/2023 20:00:00 - New match 11348970 has started (25 players)
      28/04/2023 20:02:10 - Player01 killed Player02 using SMG
      28/04/2023 20:04:30 - Player03 killed Player04 using Shotgun
      28/04/2023 20:06:50 - Player05 killed Player06 using Pistol
      28/04/2023 20:09:10 - Player07 killed Player08 using Assault Rifle
      28/04/2023 20:11:30 - Player09 killed Player10 using Sniper Rifle
      28/04/2023 20:13:50 - Player11 killed Player12 using Knife
      28/04/2023 20:16:10 - Player13 killed Player14 using Grenade
      28/04/2023 20:18:30 - Player15 killed Player16 using Rocket Launcher
      28/04/2023 20:20:50 - Player17 killed Player18 using SMG
      28/04/2023 20:23:10 - Player19 killed Player20 using Shotgun
      28/04/2023 20:25:30 - <WORLD> killed Player21 by ZONE
      28/04/2023 20:27:50 - Player22 killed Player23 using Pistol
      28/04/2023 20:30:10 - Player24 killed Player25 using Assault Rifle
      28/04/2023 20:32:30 - Player01 killed Player03 using Sniper Rifle
      28/04/2023 20:34:50 - Player05 killed Player07 using Knife
      28/04/2023 20:37:10 - Player09 killed Player11 using Grenade
      28/04/2023 20:39:30 - Player13 killed Player15 using Rocket Launcher
      28/04/2023 20:41:50 - Player17 killed Player19 using SMG
      28/04/2023 20:44:10 - Player22 killed Player24 using Shotgun
      28/04/2023 20:46:30 - Player01 killed Player05 using Pistol
      28/04/2023 20:48:50 - Player09 killed Player13 using Assault Rifle
      28/04/2023 20:51:10 - Player17 killed Player22 using Sniper Rifle
      28/04/2023 20:53:30 - Player01 killed Player09 using Knife
      28/04/2023 20:55:50 - Player17 killed Player01 using Grenade
      28/04/2023 20:57:00 - Match 11348970 has ended (Player17 wins)
    `;

    const games = service.execute(log);

    expect(games).toHaveLength(0);
  });

});
