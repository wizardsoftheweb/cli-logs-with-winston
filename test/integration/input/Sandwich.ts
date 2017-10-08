import { DoubleBread } from "./DoubleBread";
import {
    IJelly,
    IPeanutButter,
} from "./interfaces";

export class Sandwich extends DoubleBread implements IJelly, IPeanutButter {
    public hasJelly: boolean;
    public hasPeanutButter: boolean;

    public constructor() {
        super();
        this.hasJelly = true;
        this.hasPeanutButter = true;
    }
}
