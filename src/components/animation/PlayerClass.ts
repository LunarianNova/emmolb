import { getContrastTextColor } from "@/helpers/Colors";
import { positions } from "./Constants";
import { Vector2 } from "@/types/Vector2";

type FacingDirection = "front" | "back";
type Direction8 =  "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "None";

const eyeOffsets: Record<Direction8, {dx: number; dy: number}> = {
    N:  { dx: 0,   dy: -2 },
    NE: { dx: 1.5, dy: -1.5 },
    E:  { dx: 2,   dy: 0 },
    SE: { dx: 1.5, dy: 1.5 },
    S:  { dx: 0,   dy: 2 },
    SW: { dx: -1.5,dy: 1.5 },
    W:  { dx: -2,  dy: 0 },
    NW: { dx: -1.5,dy: -1.5 },
    None: { dx: 0, dy: 0 },
};

interface PlayerOptions {
    name: string;
    teamColor: string;
    position: keyof typeof positions;
    team: 'AWAY' | 'HOME';
    facing?: FacingDirection;
    bats: "L" | "R" | "S";
    throws: "L" | "R" | "S";
    startPos: Vector2;
    number?: number;
}

export class AnimatedPlayer {
    group: SVGGElement;
    name: string;
    team: 'AWAY' | 'HOME';
    position: keyof typeof positions;
    facing: FacingDirection;
    bats: "L" | "R" | "S";
    throws: "L" | "R" | "S";
    isMoving: boolean = false;
    posVector: Vector2;
    teamColor: string;

    // Elements
    private eyeLeft: SVGRectElement;
    private eyeRight: SVGRectElement;
    private legLeft: SVGRectElement;
    private legRight: SVGRectElement;
    private glove: SVGCircleElement;
    private hat: SVGElement;
    private label: SVGElement;
    private jerseyNumberLabel: SVGElement;
    private movingStartTime: number = 0;

    private idleIntervalIDs = {
        blink: null as number | null,
        hop: null as number | null,
    };

    constructor(opts: PlayerOptions) {
        this.name = opts.name;
        this.team = opts.team;
        this.facing = opts.facing ?? "front";
        this.throws = opts.throws;
        this.bats = opts.bats;
        this.posVector = opts.startPos;
        this.teamColor = opts.teamColor;
        this.position = opts.position;

        // Create group
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("id", this.name);
        this.group = g;
        this.setPosition(this.posVector);

        const hatMain = this.makeRect(-8, -8, 16, 6, opts.teamColor, 2);
        const brim = this.makeRect(-10, -2, 20, 2, "black");

        this.hat = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.hat.appendChild(hatMain);
        this.hat.appendChild(brim);
        this.hat.setAttribute("transform", `translate(0, -16)`);

        const head = this.makeRect(-8, -16, 16, 16, "white", 3);

        this.eyeLeft = this.makeRect(-4, -12, 2, 6, "black", 1);
        this.eyeRight = this.makeRect(2, -12, 2, 6, "black", 1);

        const body = this.makeRect(-6, 0, 12, 20, opts.teamColor, 3);

        this.legLeft = this.makeRect(-5, 20, 4, 10, "black", 2, 2);
        this.legRight = this.makeRect(1, 20, 4, 10, "black", 2, 2);

        // Glove (only shown conditionally)
        this.glove = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.glove.setAttribute("r", "5");
        this.glove.setAttribute("fill", "#a0522d"); // brownish
        this.glove.style.display = "none";
        this.glove.setAttribute("x", this.throws === "L" ? "6" : "-6");

        // Little guy's little name
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const label = document.createElementNS('http://www.w3.org/2000/svg', "text"); 
        const labelBackground = document.createElementNS('http://www.w3.org/2000/svg', "rect");
        labelBackground.setAttribute("fill", this.teamColor);
        labelBackground.setAttribute("fill-opacity", "0.5");
        labelBackground.setAttribute("rx", "4");
        labelBackground.setAttribute("ry", "4");
        label.setAttribute('font-family', 'geist, sans-serif');
        label.setAttribute("font-size", "12");
        label.setAttribute("fill", getContrastTextColor(this.teamColor));
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("x", "0");
        label.setAttribute("y", "-30");
        label.textContent = this.name;
        labelGroup.append(label, labelBackground);
        this.label = labelGroup;

        requestAnimationFrame(() => {
            const bbox = label.getBBox();
            labelBackground.setAttribute("x", (bbox.x - 4).toString());
            labelBackground.setAttribute("y", (bbox.y - 2).toString());
            labelBackground.setAttribute("width", (bbox.width + 8).toString());
            labelBackground.setAttribute("height", (bbox.height + 4).toString());

            // Move background behind text
            labelGroup.insertBefore(labelBackground, label);
        });
        
        this.jerseyNumberLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.jerseyNumberLabel.setAttribute("font-size", "12");
        this.jerseyNumberLabel.setAttribute("fill", getContrastTextColor(this.teamColor));
        this.jerseyNumberLabel.setAttribute("font-weight", "bold");
        this.jerseyNumberLabel.setAttribute("text-anchor", "middle");
        this.jerseyNumberLabel.setAttribute('visibility', 'hidden');
        this.jerseyNumberLabel.setAttribute("x", "0"); // center horizontally
        this.jerseyNumberLabel.setAttribute("y", "12"); // position roughly mid-body or wherever looks good
        this.jerseyNumberLabel.textContent = String(opts.number) !== 'undefined' ? String(opts.number) : "";

        // Append all to group
        g.append(this.hat, head, this.eyeLeft, this.eyeRight, body, this.legLeft, this.legRight, this.glove, this.label, this.jerseyNumberLabel);
        this.startIdle();
  }

    private makeRect(x: number, y: number, width: number, height: number, fill: string, rx = 0, ry = 0): SVGRectElement {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x.toString());
        rect.setAttribute("y", y.toString());
        rect.setAttribute("width", width.toString());
        rect.setAttribute("height", height.toString());
        rect.setAttribute("fill", fill);
        if (rx > 0) rect.setAttribute("rx", rx.toString());
        if (ry > 0) rect.setAttribute("ry", ry.toString());
        return rect;
    }

    setPosition(target: Vector2) {
        this.posVector = target;

        const transform = `translate(${target.x}, ${target.y})`;

        this.group.setAttribute("transform", transform);
    }

    moveGloveTo(target: Vector2) {
        const offsetX = this.throws === "R" ? -6 : 6;
        this.glove.setAttribute("cx", (target.x + offsetX).toString());
        this.glove.setAttribute("cy", target.y.toString());
        this.glove.style.display = "block";
    }

    walkTo(target: Vector2, speed: number = 100): Promise<void> {
        return new Promise(resolve => {
            if (target.y >= this.posVector.y) this.turnAround("front");
            else this.turnAround("back");

            this.startWalking();

            const startX = this.posVector.x;
            const startY = this.posVector.y;
            const dx = target.x - startX;
            const dy = target.y - startY;
            const distance = Math.hypot(dx, dy);
            const duration = distance / speed * 1000;

            const startTime = performance.now();

            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress; // Maybe ease this?

                const newX = startX + dx * eased;
                const newY = startY + dy * eased;

                this.setPosition(new Vector2(newX, newY));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.setPosition(target);
                    this.stopWalking();
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    getWalkLinePos(vector: Vector2) {
        const walkLine = new Vector2(400, 525);
        let slope = 1;
        if (this.team === 'AWAY') slope = -1;

        const destination = new Vector2(walkLine.x + (walkLine.y-vector.y)*slope, vector.y);
        return destination;
    }

    hide() {
        this.group.setAttribute('opacity', '0');
    }

    show () {
        this.group.setAttribute('opacity', '1');
    }

    async walkOff() {
        const walkspeed = 80 + Math.random() * 40;
        await this.walkTo(this.getWalkLinePos(this.posVector), walkspeed);
        if (this.team === 'AWAY') {
            await this.walkTo(this.getWalkLinePos(positions['AwayDugout']), walkspeed);
            await this.walkTo(positions['AwayDugout'], walkspeed);
        }
        else if (this.team === 'HOME') {
            await this.walkTo(this.getWalkLinePos(positions['HomeDugout']), walkspeed);
            await this.walkTo(positions['HomeDugout'], walkspeed);
        }
        this.hide();
    }

    async walkOn(overridePos?: string) {
        this.show();
        
        let destination: Vector2 = Vector2.zero();
        if (overridePos) destination = positions[overridePos];
        else {
            if (this.position !== 'Batter') destination = positions[this.position];
            else {
                if (this.bats === 'L') destination = positions['LeftHandedBatter'];
                else if (this.bats === 'R') destination = positions['RightHandedBatter'];
                else destination = Math.random() > 0.5 ? positions['LeftHandedBatter'] : positions['RightHandedBatter']; 
            }
        }

        const walkspeed = 80 + Math.random() * 40;

        if (this.team === 'AWAY') this.setPosition(positions['AwayDugout']);
        else if (this.team === 'HOME') this.setPosition(positions['HomeDugout']);

        await this.walkTo(this.getWalkLinePos(this.posVector), walkspeed);

        const linePos = this.getWalkLinePos(destination);
        if ((linePos.x < destination.x && this.team === 'HOME') || (linePos.x > destination.x && this.team === 'AWAY'))
            linePos.x = destination.x; // Don't walk past destination
        await this.walkTo(linePos, walkspeed);
        await this.walkTo(destination, walkspeed)

        // Only two players to face away
        if (this.position === 'Catcher' || this.position === 'Batter') this.turnAround("back");
    }

    hideGlove() {
        this.glove.style.display = "none";
    }

    turnAround(direction: FacingDirection) {
        this.facing = direction;
        if (this.facing === 'front') {
            this.jerseyNumberLabel.setAttribute('visibility', 'hidden');
            this.eyeLeft.setAttribute('visibility', 'visible');
            this.eyeRight.setAttribute('visibility', 'visible');
        } else {
            this.jerseyNumberLabel.setAttribute('visibility', 'visible');
            this.eyeLeft.setAttribute('visibility', 'hidden');
            this.eyeRight.setAttribute('visibility', 'hidden');
        }
    }

    lookInDirection(direction: Direction8) {
        const offset = eyeOffsets[direction];
        if (!offset) return;

        // base eye positions
        const eyeLeftBaseX = -4;
        const eyeLeftBaseY = -12;
        const eyeRightBaseX = 2;
        const eyeRightBaseY = -12;

        this.eyeLeft.setAttribute("x", (eyeLeftBaseX + offset.dx).toString());
        this.eyeLeft.setAttribute("y", (eyeLeftBaseY + offset.dy).toString());
        this.eyeRight.setAttribute("x", (eyeRightBaseX + offset.dx).toString());
        this.eyeRight.setAttribute("y", (eyeRightBaseY + offset.dy).toString());
    }

    startIdle() {
        const blink = () => {
            this.blinkEyes();
            const nextBlink = 3000 + Math.random() * 2000;
            this.idleIntervalIDs.blink = window.setTimeout(blink, nextBlink);
        };

        const hop = () => {
            this.startHopIdle();
            const nextHop = 60000 + Math.random() * 20000;
            this.idleIntervalIDs.hop = window.setTimeout(hop, nextHop);
        };

        this.idleIntervalIDs.blink = window.setTimeout(blink, 3000 + Math.random() * 2000);
        this.idleIntervalIDs.hop = window.setTimeout(hop, 10000 + Math.random() * 100000);
    }

    stopIdle() {
        if (this.idleIntervalIDs.blink !== null) {
            clearTimeout(this.idleIntervalIDs.blink);
            this.idleIntervalIDs.blink = null;
        }
        if (this.idleIntervalIDs.hop !== null) {
            clearTimeout(this.idleIntervalIDs.hop);
            this.idleIntervalIDs.hop = null;
        }
    }


    private blinkEyes() {
        const blinkDuration = 150;

        this.eyeLeft.setAttribute("y", "-9");   // center: -12 + 3
        this.eyeLeft.setAttribute("height", "1");
        this.eyeRight.setAttribute("y", "-9");
        this.eyeRight.setAttribute("height", "1");

        setTimeout(() => {
            this.eyeLeft.setAttribute("y", "-12");
            this.eyeLeft.setAttribute("height", "6");
            this.eyeRight.setAttribute("y", "-12");
            this.eyeRight.setAttribute("height", "6");
        }, blinkDuration);
    }

    testAnimations() {
        this.startHopIdle();
        setTimeout(() => {
            this.animateGloveSpin(4, 400);
        }, 10000)
    }

    startHopIdle() {
        const hopCount = 3;
        const hopHeight = 12;
        const duration = 300;
        let hop = 0;
        const doHop = () => {
            if (hop >= hopCount) return;
            if (this.isMoving) return;

            this.animateHop(hopHeight, duration, () => {
                hop++;
                doHop();
            });
        };

        doHop();
    }

    private animateHop(offsetY: number, duration: number, callback: () => void) {
        const start = performance.now();
        const initialY = this.posVector.y;

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = 1 - Math.pow(2 * progress - 1, 2);

            const displacement = -offsetY * eased; // Up is negative in this application. I don't want to get into left vs. right hand arguments right now, so I won't state my opinion. I will imply it however
            const newY = initialY + displacement;
            this.setPosition(new Vector2(this.posVector.x, newY));

            const hatY = -20 + displacement*0.2;
            this.hat.setAttribute("transform", `translate(0, ${hatY})`);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.setPosition(new Vector2(this.posVector.x, initialY));
                this.hat.setAttribute("transform", `translate(0, -16)`);
                callback();
            }
        };

        requestAnimationFrame(animate);
    }

    private animateGloveSpin(spins: number = 3, durationPerSpin: number = 500, callback?: () => void) {
        const totalDuration = spins * durationPerSpin;
        const start = performance.now();

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / totalDuration, 1);

            const rotation = 360 * spins * progress;

            this.glove.style.display = "block";

            this.glove.setAttribute("transform", `rotate(${rotation}, ${this.glove.cx.baseVal.value}, ${this.glove.cy.baseVal.value})`);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.glove.style.display = "none";
                this.glove.removeAttribute("transform");
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    }

    lookAround8Directions() {
        const directions: Direction8[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "None"];
        let i = 0;

        const step = () => {
            if (i >= directions.length) return;
            this.lookInDirection(directions[i]);
            i++;
            setTimeout(step, 500);
        };

        step();
    }

    startWalking(speed: number = 0.010) {
        if (this.isMoving) return;
        this.isMoving = true;
        this.movingStartTime = performance.now();
        
        const walkLoop = (now: number) => {
            if (!this.isMoving) return;

            const elapsed = now - this.movingStartTime;
            const swing = Math.sin(elapsed * speed) * 3;

            this.legLeft.setAttribute("transform", `translate(0, ${swing})`);
            this.legRight.setAttribute("transform", `translate(0, ${-swing})`);

            requestAnimationFrame(walkLoop);
        };

        requestAnimationFrame(walkLoop);
    }

    stopWalking() {
        this.isMoving = false;
        this.legLeft.setAttribute("transform", "translate(0, 0)");
        this.legRight.setAttribute("transform", "translate(0, 0)");
    }
}
