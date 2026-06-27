/** Destructible obstacle enemies may attack when blocking the path to the objective. */
export interface AttackableObstacle {
  readonly x: number;
  takeDamage(amount: number): void;
  isDestroyed(): boolean;
}
