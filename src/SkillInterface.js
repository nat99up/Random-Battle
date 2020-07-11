
var SkillInstaceDict = {}; // 記得註冊到SkillInstaceDict

const SkillType = {
    NONE:0,
    STATUS_MOVE:1,
    PHYSICAL:2,
    MAGIC:3,
    GEOMANCY:4,

}

const TargetType = {
    ZERO : 0,
    SELF : 1,
    ALLIED : 2,
    ENEMY : 3,
    AOE : 4,
    BOARD : 5
}

class SkillInterface{

    constructor(activeSkillName){

        this.name = activeSkillName;
        const instance = SkillInstaceDict['skill_' +activeSkillName];

        for (var attr in instance) {
            this[attr] = instance[attr];
        }

    }
}

const skill_治癒 = {

    skillType: SkillType.STATUS_MOVE,

    targetType: TargetType.SELF,

    targetRange: [[1]],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board
        receiver.hp.decrease(-15);
    }

}

const skill_超級射程 = {

    skillType: SkillType.STATUS_MOVE,

    targetType: TargetType.SELF,

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

    skillType: SkillType.STATUS_MOVE,

    targetType: TargetType.SELF,

    targetRange: [[1]],

    effect:function(provider,receiver){
        // receiver 可能為 Combatant 或 Board

        receiver.core.atk *= 1.5;
        receiver.core.def *= 1.5;
    }

}

const skill_羅馬斬 = {

    skillType: SkillType.PHYSICAL,

    targetType: TargetType.ENEMY,

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

    skillType: SkillType.PHYSICAL,

    targetType: TargetType.ENEMY,

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

export {
    SkillInterface,
    SkillType,
    TargetType
 }
 