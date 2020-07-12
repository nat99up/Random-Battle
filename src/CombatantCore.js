export default class CombatantCore{

    constructor(data) {
        
        this.name = data.name;
        this.hp = data.hp;
        this.mp = data.mp;
        this.atk = data.atk;
        this.def = data.def;
        this.taunt = data.taunt;
        this.attackMode = data.attackMode;
        this.moveRange = data.moveRange;
        this.attackRange = data.attackRange;
        this.activeSkillName = data.activeSkillName;
    }


}