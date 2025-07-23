import { Vector2 } from "@/types/Vector2";

export class AnimatedText {
    position: Vector2;
    duration: number;
    fade: boolean;
    color: string;
    size: number;
    text: string;
    group: SVGElement;
    private textLabel: SVGTextElement;
    private startTime: number;

    constructor(position: Vector2, duration: number, fade: boolean, color: string, size: number, text: string) {
        this.position = position;
        this.duration = duration;
        this.fade = fade;
        this.color = color;
        this.size = size;
        this.text = text;
        this.startTime = performance.now();

        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textLabel.textContent = this.text;
        this.textLabel.setAttribute('font-family', 'geist, sans-serif');
        this.textLabel.setAttribute('font-size', String(this.size));
        this.textLabel.setAttribute('fill', this.color);
        this.textLabel.setAttribute('font-weight', 'bold');
        this.textLabel.setAttribute('text-anchor', 'middle');
        this.group.appendChild(this.textLabel);

        this.group.setAttribute('transform', `translate(${this.position.x} ${this.position.y})`);

        const update = () => {
            const elapsed = performance.now() - this.startTime;
            if (elapsed >= this.duration) {
                this.group.remove();
                return;
            }

            if (this.fade) {
                const remaining = Math.max(0, Math.min(1, 1 - (elapsed - this.duration / 2) / (this.duration / 2)));
                this.textLabel.setAttribute('opacity', String(remaining));
            }

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }
}
