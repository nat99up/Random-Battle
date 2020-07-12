export default class BattleCalculator {

    constructor(team1,team2) {
        this.combatants = team1.concat(team2);
        this.combatants.sort(() => Math.random() - 0.5);

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

    effect(provider,receiver){

        provider.mp.decrease(provider.mp.max);

        const uninjured = receiver.hp.value;

        // 🚧 Under construction 🚧 : 多個receiver尚未完成
        provider.activeSkill.effect(provider,receiver);

        if(uninjured-receiver.hp.value > 0){
            this.logging.damages[this.logIdx[provider.arenaId]] += uninjured-receiver.hp.value;
            this.logging.injures[this.logIdx[receiver.arenaId]] += uninjured-receiver.hp.value;
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
        this.combatants.forEach(combatant => {
            if(combatant.battleAction == 'skill'){

                // skillTarget ==> receiver
                this.effect(combatant,combatant.skillTarget);
            }
        })
    }

}
