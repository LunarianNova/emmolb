import { Vector2 } from "@/types/Vector2";
import { AnimatedPlayer } from "./PlayerClass";

export class Ball {
    pos: Vector2;
    group: SVGElement;
    private isHeld: boolean = false;
    private lastTrailTime: number = 0;

    constructor(initialPos: Vector2) {
        this.pos = initialPos;

        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        background.setAttribute('cx', '0');
        background.setAttribute('cy', '0');
        background.setAttribute('r', '5');
        background.setAttribute('fill', '#FFF');
        background.setAttribute('stroke', '#000');
        background.setAttribute('stroke-width', '0.5');
        this.group.appendChild(background);

        const stitch1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        stitch1.setAttribute('d', 'M -3,-2 C -1,-3 1,-3 3,-2');
        stitch1.setAttribute('stroke', 'red');
        stitch1.setAttribute('stroke-width', '0.5');
        stitch1.setAttribute('fill', 'none');
        this.group.appendChild(stitch1);

        const stitch2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        stitch2.setAttribute('d', 'M -3,2 C -1,3 1,3 3,2');
        stitch2.setAttribute('stroke', 'red');
        stitch2.setAttribute('stroke-width', '0.5');
        stitch2.setAttribute('fill', 'none');
        this.group.appendChild(stitch2);
    }

    setPosition(pos: Vector2) {
        this.pos = pos;
    }

    async moveTo(target: Vector2, speed = 125): Promise<void> {
        const dx = target.x - this.pos.x;
        const dy = target.y - this.pos.y;
        const distance = Math.hypot(dx, dy);
        const duration = (distance / speed) * 1000;
        const startX = this.pos.x;
        const startY = this.pos.y;
        const startTime = performance.now();

        return new Promise(resolve => {
            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress;

                const newX = startX + dx * eased;
                const newY = startY + dy * eased;
                this.setPosition(new Vector2(newX, newY));

                this.group.setAttribute('transform', `translate(${newX}, ${newY})`);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.setPosition(target);
                    this.group.setAttribute('transform', `translate(${target.x}, ${target.y})`);
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async throwTo(target: Vector2, speed = 125): Promise<void> {
        this.isHeld = false;

        const dx = target.x - this.pos.x;
        const dy = target.y - this.pos.y;
        const distance = Math.hypot(dx, dy);
        const duration = (distance / speed) * 1000;
        const startX = this.pos.x;
        const startY = this.pos.y;
        const startTime = performance.now();

        let rotation = 0;

        const trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.group.parentNode?.appendChild(trailGroup);

        const createTrailCircle = (x: number, y: number) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
            trailGroup.appendChild(circle);

            const start = performance.now();
            const fadeDuration = 500;
            const fadeAnim = (now: number) => {
                const elapsed = now - start;
                if (elapsed >= fadeDuration) {
                    trailGroup.removeChild(circle);
                    return;
                }
                const progress = elapsed / fadeDuration;
                circle.setAttribute('fill', `rgba(255, 255, 255, ${0.5 * (1 - progress)})`);
                circle.setAttribute('r', (3 * (1 - progress)).toString());
                requestAnimationFrame(fadeAnim);
            };
            requestAnimationFrame(fadeAnim);
        };

        return new Promise(resolve => {
            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress;

                const newX = startX + dx * eased;
                const newY = startY + dy * eased;
                this.setPosition(new Vector2(newX, newY));

                rotation += (720 * (1 / 60)) % 360;
                this.group.setAttribute('transform', `translate(${newX}, ${newY}) rotate(${rotation})`);

                if (!this.lastTrailTime || now - this.lastTrailTime > 50) {
                    createTrailCircle(newX, newY);
                    this.lastTrailTime = now;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.setPosition(target);
                    this.group.setAttribute('transform', `translate(${target.x}, ${target.y}) rotate(0)`);
                    trailGroup.remove();
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    giveTo(player: AnimatedPlayer) {
        this.isHeld = true;
        this.setPosition(player.posVector);
    }
}