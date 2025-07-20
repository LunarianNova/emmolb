import { CashewsPlayer } from "@/types/FreeCashews";

type Handedness = | 'R' | 'L' | 'S'

class Player {
    readonly name: string;
    position: FieldPosition;

    x: number;
    y: number;
    fill: string;
    stroke: string;

    body: SVGCircleElement;
    label: SVGTextElement;

    bats: Handedness;
    swings: Handedness

    cashewsPlayer: CashewsPlayer; // Catch all for the rest of the data if it is ever needed
    visible: boolean;

    constructor(name: string, position: FieldPosition, fill: string, stroke: string, bats: Handedness, swings: Handedness, cashewsPlayer: CashewsPlayer) {
        this.name = name;
        this.position = position;
        this.fill = fill;
        this.stroke = stroke;
        this.bats = bats;
        this.swings = swings;
        this.cashewsPlayer = cashewsPlayer;

        this.x = 0;
        this.y = 0;
        this.body = this.createBody();
        this.label = this.createLabel();
        this.visible = false;
    }

    createBody(): SVGCircleElement {}
    createLabel(): SVGTextElement {}

    
}