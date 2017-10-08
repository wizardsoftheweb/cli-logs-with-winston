import {
    IJelly,
    IPeanutButter,
} from "./interfaces";

export class Toppings implements IJelly, IPeanutButter {
    public hasJelly: boolean;
    public hasPeanutButter: boolean;
}
