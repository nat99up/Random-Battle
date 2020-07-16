import Combatant from "./Combatant.js";

export default class Board {

    constructor(config) {
        
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;

        this.block = config.block;
        this.occupy = null;

        this.geomancy = null;
        this.geomancyName = null;
        this.geomancyTeam = null;
        this.geomancyDuration = 0;
        this.geomancySprite = null;

    }

    setGeomancy(geomancyName,team,duraion){

        this.removeGeomancy()

        if(geomancyName == '毒素'){
            this.geomancy = this.poison;
            this.geomancyName = geomancyName;
            this.geomancyTeam = team;
            this.geomancyDuration = duraion;

            this.geomancySprite = this.scene.add.sprite(this.x, this.y, 'poison');
            this.geomancySprite.alpha = .5;
            this.geomancySprite.visible = false;

            if(this.scene.anims.exists(this.geomancyName) == false){ 
                this.scene.anims.create({
                    key: this.geomancyName,
                    frames: this.scene.anims.generateFrameNumbers('poison', { start: 0, end: 7 }),
                    frameRate: 30,
                    repeat: 0
                })
            }

        }
    }

    removeGeomancy(){
        this.geomancy = null;
        this.geomancyName = null;
        this.geomancyTeam = null;
        this.geomancyDuration = 0;
        if(this.geomancySprite) this.geomancySprite.destroy();
        this.geomancySprite = null;
    }

    runGeomancy(){
        if(this.geomancy){
            this.geomancy();
            this.geomancyDuration -= 1;
            if(this.geomancyDuration <= 0) this.removeGeomancy();
        }
    }

    perfromAnimate(){
        if(this.geomancySprite){
            this.geomancySprite.visible = true;
            this.geomancySprite.anims.play(this.geomancyName, true);

            this.geomancySprite.once('animationcomplete', ()=>{ 
                this.geomancySprite.visible = false;
            });
        }
        
    }

    poison(){ //毒素
        if(this.occupy instanceof Combatant && this.occupy.arenaId[0] != this.geomancyTeam){
            this.occupy.hp.decrease(3);
        }
    }
}