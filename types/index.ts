export interface Character {
  id: string;
  name: string;
  cls: string;
  ilvl: number;
}

export interface Raid {
  id: string;
  name: string;
  diff: string;
  gold: number;
}

export interface RaidState {
  gold: boolean;
  done: boolean;
  extra?: boolean;
}

export type Progress = {
  [charId: string]: {
    [raidId: string]: RaidState;
  };
};

export interface Raid {
  id: string;
  name: string;
  diff: string;
  gold: number;
  bound?: boolean;
  extraCost?: number;
  minIlvl?: number;
}
