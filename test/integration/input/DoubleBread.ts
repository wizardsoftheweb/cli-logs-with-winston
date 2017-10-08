import { Bread } from "./Bread";

export class DoubleBread extends Bread {
    public constructor() {
        super();
        this.piecesOfBread = 2;
    }

    public isSandwich(): boolean {
        const self = this as any;
        return self.piecesOfBread >= 2 && self.hasJelly && self.hasPeanutButter;
    }
}
