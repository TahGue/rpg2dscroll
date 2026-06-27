/** Gate, caravan, or shrine — anything enemies assault during defense missions. */
export interface DefenseTarget {
  readonly x: number;
  readonly y: number;
  hp: number;
  maxHp: number;
  takeDamage(amount: number): void;
}
