
var SkillInstaceDict = {}; // 記得註冊到SkillInstaceDict

export default class SkillInterface{

    // Skill Type
    static NONE = 0;
    static STATUS_MOVE = 1;
    static PHYSICAL = 2;
    static MAGIC = 3;
    static GEOMANCY = 4;

    // Target Type
    static NONE = 0;
    static SELF = 1;
    static ALLIED = 2;
    static ENEMY = 3;
    static AOE = 4;
    static BOARD = 5;

    constructor(activeSkillName){

        this.name = activeSkillName;
        const instance = SkillInstaceDict['skill_' +activeSkillName];

        for (var attr in instance) {
            this[attr] = instance[attr];
        }

    }
}

const skill_治癒 = {

    skillType: SkillInterface.STATUS_MOVE,

    targetType: SkillInterface.SELF,

    targetRange: [[1]],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board
        receiver.hp.decrease(-15);
    }

}

const skill_超級射程 = {

    skillType: SkillInterface.STATUS_MOVE,

    targetType: SkillInterface.SELF,

    targetRange: [[1]],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board
        
        receiver.attackRange = [
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,0,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ]
    }

}

const skill_武裝強化 = {

    skillType: SkillInterface.STATUS_MOVE,

    targetType: SkillInterface.SELF,

    targetRange: [[1]],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board

        receiver.core.atk *= 1.5;
        receiver.core.def *= 1.5;
    }

}

const skill_羅馬斬 = {

    skillType: SkillInterface.PHYSICAL,

    targetType: SkillInterface.ENEMY,

    targetRange: [
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board

        provider.hp.decrease(5);
        receiver.hp.decrease(25);
    }

}

const skill_海盜砲 = {

    skillType: SkillInterface.PHYSICAL,

    targetType: SkillInterface.ENEMY,

    targetRange: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,0,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1]
    ],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board

        provider.mp.decrease(-5);
        receiver.hp.decrease(20);
    }

}

// 註冊技能實例
SkillInstaceDict = {
    'skill_治癒':skill_治癒,
    'skill_超級射程':skill_超級射程,
    'skill_武裝強化':skill_武裝強化,
    'skill_羅馬斬':skill_羅馬斬,
    'skill_海盜砲':skill_海盜砲
}