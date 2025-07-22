import { Vector2 } from "@/types/Vector2";

type AnnouncerProps = {
    position: Vector2;
    message?: string;
}

export class Announcer {
    group: SVGElement;
    position: Vector2;
    message: string;

    // Elements
    private head: SVGElement;
    private eyes: SVGElement;
    private hat: SVGElement;
    private body: SVGElement;
    private character: SVGElement;

    private bobbingInterval?: NodeJS.Timeout;
    private blinkInterval?: NodeJS.Timeout;

    constructor(opts: AnnouncerProps) {
        this.position = opts.position;
        this.message = opts.message ?? '';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', 'Announcer');
        this.group = g;
        this.setPosition(opts.position);

        const character = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const hat = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const hatMain = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hatMain.setAttribute('x', '0');
        hatMain.setAttribute('y', '0');
        hatMain.setAttribute('width', '50');
        hatMain.setAttribute('height', '20');
        hatMain.setAttribute('fill', '#35393A');
        const hatBrim = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hatBrim.setAttribute('x', '0');
        hatBrim.setAttribute('y', '20');
        hatBrim.setAttribute('width', '70');
        hatBrim.setAttribute('height', '10');
        hatBrim.setAttribute('fill', '#000000');
        hat.appendChild(hatMain);
        hat.appendChild(hatBrim);
        this.hat = hat;

        const head = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const headSquare = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headSquare.setAttribute('x', '0');
        headSquare.setAttribute('y', '30');
        headSquare.setAttribute('width', '57');
        headSquare.setAttribute('height', '50');
        headSquare.setAttribute('fill', '#FFFFFF');
        headSquare.setAttribute('rx', '5');
        headSquare.setAttribute('ry', '5');
        const headRounded = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headRounded.setAttribute('x', '0');
        headRounded.setAttribute('y', '30');
        headRounded.setAttribute('width', '57');
        headRounded.setAttribute('height', '60');
        headRounded.setAttribute('fill', '#FFFFFF');
        headRounded.setAttribute('rx', '15');
        headRounded.setAttribute('ry', '15');
        head.appendChild(headSquare);
        head.appendChild(headRounded);
        this.head = head;

        const eyes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const eyeLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        eyeLeft.setAttribute('x', '36');
        eyeLeft.setAttribute('y', '45');
        eyeLeft.setAttribute('width', '11');
        eyeLeft.setAttribute('height', '25');
        eyeLeft.setAttribute('fill', '#000000');
        eyeLeft.setAttribute('rx', '7');
        eyeLeft.setAttribute('ry', '7');
        const eyeRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        eyeRight.setAttribute('x', '11');
        eyeRight.setAttribute('y', '45');
        eyeRight.setAttribute('width', '11');
        eyeRight.setAttribute('height', '25');
        eyeRight.setAttribute('fill', '#000000');
        eyeRight.setAttribute('rx', '7');
        eyeRight.setAttribute('ry', '7');
        eyes.appendChild(eyeLeft);
        eyes.appendChild(eyeRight);
        this.eyes = eyes;

        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '5');
        body.setAttribute('y', '90');
        body.setAttribute('width', '47');
        body.setAttribute('height', '20');
        body.setAttribute('fill', '#35393A');
        body.setAttribute('rx', '5');
        body.setAttribute('ry', '5');
        this.body = body;

        const messageBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        box.setAttribute('x', '100');
        box.setAttribute('y', '20');
        box.setAttribute('width', '360');
        box.setAttribute('height', '80');
        box.setAttribute('fill', '#163F5E');
        box.setAttribute('fillOpacity', '0.7');
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', `100.1,100 100.1,80 80,70`);
        arrow.setAttribute('fill', '#163F5E');
        arrow.setAttribute('fillOpacity', '0.7');
        messageBox.appendChild(box);
        messageBox.appendChild(arrow);

        const message = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        message.setAttribute('x', '110');
        message.setAttribute('y', '30');
        message.setAttribute('width', '340');
        message.setAttribute('height', '60');
        const div = document.createElement('div');
        div.style.fontSize = '12px';
        div.style.fontFamily = 'geist, sans-serif';
        div.style.fontWeight = 'bold';
        div.style.color = 'white';
        div.style.overflow = 'hidden';
        div.innerHTML = '';
        message.appendChild(div);
        messageBox.appendChild(message);

        this.character = character;
        character.append(this.hat, this.head, this.eyes, this.body);

        (this as any).messageDiv = div;
        g.append(this.character, messageBox);
        this.startBlinking();
    }

    setPosition(position: Vector2) {
        this.position = position

        const transform = `translate(${position.x}, ${position.y})`;

        this.group.setAttribute("transform", transform);
    }

    startBlinking() {
        const [eyeLeft, eyeRight] = Array.from(this.eyes.children) as SVGRectElement[];

        this.blinkInterval = setInterval(() => {
            eyeLeft.setAttribute("height", "2");
            eyeLeft.setAttribute("y", (parseFloat(eyeLeft.getAttribute("y")!) + 11.5).toString());
            eyeRight.setAttribute("height", "2");
            eyeRight.setAttribute("y", (parseFloat(eyeRight.getAttribute("y")!) + 11.5).toString());

            setTimeout(() => {
                eyeLeft.setAttribute("height", "25");
                eyeLeft.setAttribute("y", (parseFloat(eyeLeft.getAttribute("y")!) - 11.5).toString());
                eyeRight.setAttribute("height", "25");
                eyeRight.setAttribute("y", (parseFloat(eyeRight.getAttribute("y")!) - 11.5).toString());
            }, 150);
        }, 2500 + Math.random() * 2000);
    }


    stopBlinking() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
    }

    startBobbing() {
        let direction = 1;
        let baseOffset = 0;
        this.bobbingInterval = setInterval(() => {
            baseOffset += direction * 1.5;
            this.character.setAttribute("transform", `translate(0, ${baseOffset})`);
            direction *= -1;
        }, 120);
    }


    // CPS: Characters Per Second
    // Duration: ms the message should take to say (calculate cps)
    sayMessage({text, cps=30, duration,}: {text: string; cps?: number; duration?: number;}) {
        text = text.replace(/<[^>]*>/g, '');

        if (duration)
            cps = text.length / (duration/1000);
            if (cps < 30) cps = 30;

        const speed = 1000 / cps;
        this.message = text;
        const div = (this as any).messageDiv as HTMLDivElement;
        div.innerHTML = '';
        this.startBobbing();

        let i = 0;
        const interval = setInterval(() => {
            div.innerHTML += text[i++];
            if (i >= text.length) {
                clearInterval(interval);
                this.stopBobbing();
            }
        }, speed);
    }

    stopBobbing() {
        if (this.bobbingInterval) clearInterval(this.bobbingInterval);
        this.character.setAttribute("transform", `translate(0, 0)`);
    }
}