export type PrettyName = Record<string, string>;

export interface Tag {
  name: string;
  order: number;
  prettyName: PrettyName;
  children?: Tag[];
}

type Option = { value: string; label: string };
