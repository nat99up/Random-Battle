import {TargetType} from "./SkillInterface.js"

export default class BattleCalculator {

    constructor(team1,team2) {
        this.combatants = team1.concat(team2);

        this.logIdx = {'r0':0,'r1':1,'r2':2,'b0':3,'b1':4,'b2':5,}
        this.logging = {
            names:this.combatants.map((c)=>{ return c.core.name}),
            damages:[0,0,0,0,0,0],
            injures:[0,0,0,0,0,0]
        }
    }

    battle(atker,defer){
        
        var BaseDamage = Math.floor(atker.core.atk * (atker.core.atk/defer.core.def));
        defer.hp.decrease(BaseDamage);

        atker.mp.decrease(-2);
        defer.mp.decrease(-BaseDamage);

        this.logging.damages[this.logIdx[atker.arenaId]] += BaseDamage;
        this.logging.injures[this.logIdx[defer.arenaId]] += BaseDamage;
        
    }

    effect(provider,receiverBoards){

        provider.mp.decrease(provider.mp.max);

        var receivers = Array(receiverBoards.length);
        var uninjureds = Array(receiverBoards.length)

        // 🚧 Under construction 🚧
        for(let i=0; i<receiverBoards.length; i++){
            
            receivers[i] = receiverBoards[i].occupy;
            if(receivers[i]){
                uninjureds[i] = receiverBoards[i].occupy.hp.value;
            }else{
                uninjureds[i] = null;
            }
        }

        provider.activeSkill.effect(provider,receiverBoards);

        for(let i=0; i<receiverBoards.length; i++){

            if(receivers[i] !=null && uninjureds[i] - receivers[i].hp.value > 0){
                receivers[i].mp.decrease(Math.floor(receivers[i].mp.max*0.05));
                this.logging.damages[this.logIdx[provider.arenaId]] += uninjureds[i]-receivers[i].hp.value;
                this.logging.injures[this.logIdx[receivers[i].arenaId]] += uninjureds[i]-receivers[i].hp.value;
            }
        }
        

    }

    ApplyDamage(){
        this.combatants.forEach(combatant => {
            if(combatant.battleAction == 'attack' && combatant.enemy!=null){
                this.battle(combatant,combatant.enemy);
            }
        })
    }

    ApplySkill(){
        this.combatants.sort((x,y)=>{ 
            if(x.activeSkill.targetType == TargetType.ALLIED)return -1  
            if(y.activeSkill.targetType == TargetType.ALLIED)return 1
            return Math.random()-0.5}).forEach(combatant => {
            if(combatant.battleAction == 'skill' && combatant.skillTarget != null){
                // skillTarget ==> receiver
                
                this.effect(combatant,combatant.skillTarget);
            }
        })
    }

}
