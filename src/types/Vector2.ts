export class Vector2 {
    x: number;
    y: number;

    constructor(x: number=0, y: number=0,) {
        this.x = x;
        this.y = y;
    }

    static zero(): Vector2 {return new Vector2(0, 0);}
    static one(): Vector2 {return new Vector2(1, 1);}

    static add(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x+v2.x, v1.y+v2.y);
    }
    static subtract(v1: Vector2, v2: Vector2): Vector2 {
        return new Vector2(v1.x-v2.x, v1.y-v2.y);
    }
    static multiply(v1: Vector2, s: number): Vector2 {
        return new Vector2(v1.x*s, v1.y*s);
    }
    static divide(v1: Vector2, s: number): Vector2 {
        return new Vector2(v1.x/s, v1.y/s);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    equals(v: Vector2): boolean {
        return this.x === v.x && this.y === v.y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}