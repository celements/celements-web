import type { RouteLocationNormalized } from 'vue-router';
export class VueUserState {
  public readonly to: RouteLocationNormalized | null;
  public readonly current: RouteLocationNormalized | null;
  public constructor(args: {
    to: RouteLocationNormalized | null;
    current: RouteLocationNormalized | null;
  }) {
    this.to = args.to;
    this.current = args.current;
  }
}
