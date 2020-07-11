export default class AnimateExecutor{
    constructor(combatant){

        this.combatant = combatant;
        this.scene = combatant.scene;

        this.moving = null;
        this.moveCnt = 0;

        this.attacking = null;
        this.attackCnt = 0;

        // 普攻
        if(this.combatant.core.attackMode == 'sniper'){

            this.gunSpark = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'gun-spark').setScale(1.5)
            this.gunSpark.visible = false;
            this.scene.anims.create({
                key: 'gun-sparking',
                frames: this.scene.anims.generateFrameNumbers('gun-spark', { start: 0, end: 6 }),
                frameRate: 15,
                repeat: 0
            })

            this.aim = this.scene.add.image(this.x, this.y, 'aim').setScale(0.5);
            this.aim.visible = false;

            this.attackGenerator = this.SniperAttackGenerator;

        }else{ 
            /* Default is strike */
            this.attackGenerator = this.StrikeAttackGenerator;
        }


        // 主動技
        if(this.combatant.core.activeSkillName == '治癒'){
            
            this.skillSprite = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'heal')
            this.skillSprite.visible = false;
            this.scene.anims.create({
                key: this.combatant.core.activeSkillName,
                frames: this.scene.anims.generateFrameNumbers('heal', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: 0
            })

        }else if(this.combatant.core.activeSkillName == '超級射程'){

            this.skillSprite = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'level-up')
            this.skillSprite.visible = false;
            this.scene.anims.create({
                key: this.combatant.core.activeSkillName,
                frames: this.scene.anims.generateFrameNumbers('level-up', { start: 0, end: 10 }),
                frameRate: 16,
                repeat: 0
            })

        }else if(this.combatant.core.activeSkillName == '武裝強化'){

            this.skillSprite = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'level-up')
            this.skillSprite.visible = false;
            this.scene.anims.create({
                key: this.combatant.core.activeSkillName,
                frames: this.scene.anims.generateFrameNumbers('level-up', { start: 0, end: 10 }),
                frameRate: 16,
                repeat: 0
            })

        }else if(this.combatant.core.activeSkillName == '羅馬斬'){

            this.skillSprite = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'chop')
            this.skillSprite.visible = false;
            this.scene.anims.create({
                key: this.combatant.core.activeSkillName,
                frames: this.scene.anims.generateFrameNumbers('chop', { start: 0, end: 4 }),
                frameRate: 10,
                repeat: 0
            })

        }else if(this.combatant.core.activeSkillName == '海盜砲'){

            this.skillSprite = this.scene.add.sprite(this.combatant.x, this.combatant.y, 'bombard')
            this.skillSprite.visible = false;
            this.scene.anims.create({
                key: this.combatant.core.activeSkillName,
                frames: this.scene.anims.generateFrameNumbers('bombard', { start: 0, end: 4 }),
                frameRate: 10,
                repeat: 0
            })

        }else{

            this.skillSprite = null;

        }

    }

    launchSkill(targetPosition, frames){

        // 🚧 Under construction 🚧

        if(this.skillSprite){
            this.skillSprite.x = targetPosition.x;
            this.skillSprite.y = targetPosition.y;
            this.skillSprite.visible = true;
            this.skillSprite.anims.play(this.combatant.core.activeSkillName, true);

            this.skillSprite.once('animationcomplete', ()=>{ 
                this.skillSprite.visible = false;
            });
        }
    }

    setMoving(distPosition, steps){

        const xmove = (distPosition.x - this.combatant.x)/steps;
        const ymove = (distPosition.y - this.combatant.y)/steps;

        this.moveCnt = steps;
        
        this.moving = () => {
            if(this.moveCnt > 0){
                this.combatant.x += xmove;
                this.combatant.y += ymove;
                this.moveCnt -= 1;
            }else{
                this.moving = null;
                this.moveCnt = 0;
            }
        }

    }

    setAttack(targetPosition, steps){

        const miniStep = Math.floor(steps/3);
        const xmove = (targetPosition.x - this.combatant.x)/steps;
        const ymove = (targetPosition.y - this.combatant.y)/steps;

        this.attackCnt = steps;
        this.attacking = this.attackGenerator(miniStep,xmove,ymove,targetPosition);

    }

    attackGenerator(miniStep,xmove,ymove,targetPosition){
        // virtual function
    }

    StrikeAttackGenerator(miniStep,xmove,ymove,targetPosition){

        const attacking = ()=>{
            if(this.attackCnt > 2 * miniStep){
                this.combatant.x -= 0.5 * xmove;
                this.combatant.y -= 0.5 * ymove;
                this.attackCnt -= 1;
            }else if(this.attackCnt > miniStep){
                this.combatant.x += 1.0 * xmove;
                this.combatant.y += 1.0 * ymove;
                this.attackCnt -= 1;
            }else if(this.attackCnt > 0){
                this.combatant.x -= 0.5 * xmove;
                this.combatant.y -= 0.5 * ymove;
                this.attackCnt -= 1;
            }else{
                this.attacking = null;
                this.attackCnt = 0;
            }
        }

        return attacking
    }

    SniperAttackGenerator(miniStep,xmove,ymove,targetPosition){

        const attacking = ()=>{

            // Spark animation
            if(this.attackCnt == 2 * miniStep){
                this.gunSpark.x = targetPosition.x;
                this.gunSpark.y = targetPosition.y;
                this.gunSpark.visible = true;
                this.gunSpark.anims.play('gun-sparking', true);
                
            }else if(this.attackCnt < 0){
                this.gunSpark.visible = false;
            }
    
            // Sniper animation
            if(this.attackCnt == 3 * miniStep){
                this.aim.x = this.combatant.x;
                this.aim.y = this.combatant.y;
                this.aim.visible = true;
                this.attackCnt -= 1;
            }else if(this.attackCnt > miniStep){
                this.aim.x += 1.67 * xmove;
                this.aim.y += 1.67 * ymove;
                this.attackCnt -= 1;
            }else if(this.attackCnt > 0){
                this.attackCnt -= 1;
            }else{
                this.aim.visible = false;
            }
        }

        return attacking
        
    }

    
}