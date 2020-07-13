import CombatantCore from "./CombatantCore.js";
import AnimateExecutor from "./AnimateExecutor.js";
import {SkillInterface} from "./SkillInterface.js"

export default class Combatant extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, 400, 200, config.data.name).setScale(60/256);
        config.scene.add.existing(this);
        
        this.scene = config.scene;
        this.core = new CombatantCore(config.data);
        this.hp = new StatusBar(this.scene, this.core.hp, 'hp');
        this.mp = new StatusBar(this.scene, this.core.mp, 'mp');
        this.moveRange = this.core.moveRange;
        this.attackRange = this.core.attackRange;

        this.activeSkill = new SkillInterface(this.core.activeSkillName);
        this.animateExecutor = new AnimateExecutor(this);

        this.battleAction = 'idle';


    }

    set x(val){
        if(this.hp){
            this.hp.x = val-30;
            this.mp.x = val-30;
        }
        if(this.teamFlag){
            this.teamFlag.x = val;
        }
        this.x_ = val;
    }

    get x(){
        return this.x_
    }

    set y(val){
        if(this.hp){
            this.hp.y = val+29;
            this.mp.y = val+37;
            this.hp.draw()
            this.mp.draw()
        }
        if(this.teamFlag){
            this.teamFlag.y = val;
        }
        this.y_ = val;
    }
    
    get y(){
        return this.y_
    }

    setTeam(team){
        if(team == 'blue'){
            this.teamFlag = this.scene.add.image(this.x, this.y, 'flag-team-blue').setScale(95/150);
        }else if(team == 'red'){
            this.teamFlag = this.scene.add.image(this.x, this.y, 'flag-team-red').setScale(95/150);
        }else{
            console.log('Input of setTeam() is wrong!');
        }
        this.enemy = null;
    }

    cleanUp(){
        this.hp.bar.destroy();
        this.mp.bar.destroy();
        this.teamFlag.destroy();
        this.destroy();
    }
}


class StatusBar {

    constructor (scene, max ,status)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = 0;
        this.y = 0;
        this.max = max
        this.value = (status=='hp') ? max : 0;
        this.p = 57 / this.max;

        this.highColor = (status=='hp') ? 0x00ff00 : 0x5599ff;
        this.lowColor = (status=='hp') ? 0xff0000 : 0x5599ff;
        this.draw();

        scene.add.existing(this.bar);
    }

    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }
        else if(this.value > this.max)
        {
            this.value = this.max;
        }

        this.draw();

        return (this.value === 0);
    }

    draw ()
    {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 60, 8);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 57, 4);

        if (this.value < this.max*0.3)
        {
            this.bar.fillStyle(this.lowColor);
        }
        else
        {
            this.bar.fillStyle(this.highColor);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, 4);
    }

}