import { Vector2 } from "@/types/Vector2";

class CrowdMember {
    position: Vector2;
    teamColor: string;
    group: SVGElement;
    cheer: 'Idle' | 'Light' | 'Medium' | 'Heavy'; // Idle, Hit, Score, Game specified cheer

    constructor(position: Vector2, teamColor: string, groupRef: SVGElement) {
        this.position = position;
        this.teamColor = teamColor;
        this.cheer = 'Light';

        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.group.setAttribute('cx', String(position.x));
        this.group.setAttribute('cy', String(position.y));
        this.group.setAttribute('r', '7');
        this.group.setAttribute('fill', `#${this.teamColor}`);
        this.group.setAttribute('stroke', 'black');

        groupRef.appendChild(this.group);

        this.startCheeringLoop();
    }

    private startCheeringLoop() {
        const loop = () => {
            const cheerParams = {
                'Idle':   { height: 1,     delay: [3000, 4000] },
                'Light':  { height: 2.5,     delay: [1500, 2000] },
                'Medium': { height: 4,     delay: [500, 1000] },
                'Heavy':  { height: 6,     delay: [300, 700] }
            };

            const { height, delay } = cheerParams[this.cheer];
            const delayTime = Math.random() * (delay[1] - delay[0]) + delay[0];

            if (height > 0) {
                this.animateHop(height, 300, () => {
                    setTimeout(loop, delayTime);
                });
            } else {
                setTimeout(loop, delayTime);
            }
        };

        loop();
    }

    private animateHop(offsetY: number, duration: number, callback: () => void) {
        const start = performance.now();
        const initialY = this.position.y;

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = 1 - Math.pow(2 * progress - 1, 2);

            const displacement = -offsetY * eased; // Up is negative in this application. I don't want to get into left vs. right hand arguments right now, so I won't state my opinion. I will imply it however
            const newY = initialY + displacement;
            this.group.setAttribute('cy', String(newY));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.group.setAttribute('cy', String(this.position.y));
                callback();
            }
        };

        requestAnimationFrame(animate);
    }
}

export class Crowd {
    homeColor: string;
    awayColor: string;
    group: SVGElement;
    homeMembers: CrowdMember[] = [];
    awayMembers: CrowdMember[] = [];

    constructor(homeColor: string, awayColor: string) {
        this.homeColor = homeColor;
        this.awayColor = awayColor;
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        this.createCrowd()
    }

    cheer(team: 'Home' | 'Away', intensity: 'Idle' | 'Light' | 'Medium' | 'Heavy', length?: number) {
        const members = team === 'Home' ? this.homeMembers : this.awayMembers;
        for (const member of members) {
            member.cheer = intensity;
        }
        if (length) setTimeout(() => this.cheer(team, 'Idle'), length);
    }

    createCrowd() {
        for (let x = 555; x < 960; x += 50) { // For each row of bleachers
            for (let offset=0; offset < 300; offset += 15) {
                if (Math.random() > 0.9) continue; // 10% empty
                if (470-offset < 190) break; // Y cap
                if (x+offset+(offset/15) > 950) break; // X cap

                const team = Math.random() > 0.70 ? 'Away' : 'Home'
                const color = team === 'Away' ? this.awayColor : this.homeColor
                const member = new CrowdMember(new Vector2(x+offset+(offset/15),470-offset), color, this.group);
                
                if (team === 'Away') this.awayMembers.push(member);
                else this.homeMembers.push(member);
            }
        }
        for (let x = 245; x > -160; x -= 50) { // For each row of bleachers
            for (let offset=0; offset < 300; offset += 15) {
                if (Math.random() > 0.9) continue; // 10% empty
                if (470-offset < 190) break; // Y cap
                if (x-offset-(offset/15) < -153) break; // X cap

                const team = Math.random() > 0.70 ? 'Away' : 'Home'
                const color = team === 'Away' ? this.awayColor : this.homeColor
                const member = new CrowdMember(new Vector2(x-offset-(offset/15),470-offset), color, this.group);
                
                if (team === 'Away') this.awayMembers.push(member);
                else this.homeMembers.push(member);
            }
        }
    }
}