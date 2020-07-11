export default class BattleCalculator {

    constructor(team1,team2) {
        this.combatants = team1.concat(team2);
        this.combatants.sort(() => Math.random() - 0.5);
    }

    battle(atker,defer){
        
        var BaseDemage = Math.floor(atker.core.atk * (atker.core.atk/defer.core.def));
        defer.hp.decrease(BaseDemage);

        atker.mp.decrease(-2);
        defer.mp.decrease(-BaseDemage);

    }

    effect(provider,receiver){

        provider.mp.decrease(provider.mp.max);

        // 🚧 Under construction 🚧 : 多個receiver尚未完成
        provider.activeSkill.effect(provider,receiver);

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
                this.effect(combatant,combatant.skillTarget);
            }
        })
    }
}
