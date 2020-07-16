
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
        const instance = SkillInstaceDict['skill_' + activeSkillName];

        for (var attr in instance) {
            this[attr] = instance[attr];
        }

    }
}

const skill_治癒 = {

    skillType: SkillType.STATUS_MOVE,

    targetType: TargetType.SELF,

    targetRange: [[1]],

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        var receiver = receiverBoards[0].occupy;
        receiver.hp.decrease(-15);
    }

}

const skill_超級射程 = {

    skillType: SkillType.STATUS_MOVE,

    targetType: TargetType.SELF,

    targetRange: [[1]],

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        var receiver = receiverBoards[0].occupy;
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

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        var receiver = receiverBoards[0].occupy;
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

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        const idx = Math.floor(Math.random() * receiverBoards.length);
        var receiver = receiverBoards[idx].occupy;
        provider.hp.decrease(5);
        receiver.hp.decrease(30);
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

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        const idx = Math.floor(Math.random() * receiverBoards.length);
        var receiver = receiverBoards[idx].occupy;
        provider.mp.decrease(-5);
        receiver.hp.decrease(20);
    }

}

const skill_暴風 = {

    skillType: SkillType.PHYSICAL,

    targetType: TargetType.AOE,

    targetRange: [
        [1,1,1],
        [1,0,1],
        [1,1,1]
    ],

    effect:function(provider,receiverBoards){
        // receiver 可能為 Combatant 或 Board

        for(let i=0; i<receiverBoards.length; i++){
            var receiver = receiverBoards[i].occupy;
            if(receiver != null && provider.arenaId[0] != receiver.arenaId[0]){
                receiver.hp.decrease(20);
            }
        }

        
    }

}

const skill_祝福 = {

    skillType: SkillType.MAGIC,

    targetType: TargetType.ALLIED,

    targetRange: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,0,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1]
    ],

    effect:function(provider,receiverBoards){
        // receiver 為 Board Array

        const idx = Math.floor(Math.random() * receiverBoards.length);
        var receiver = receiverBoards[idx].occupy;
        
        receiver.core.atk += 1;
        receiver.mp.decrease(-20);

    }

}

const skill_盤根錯節 = {

    skillType: SkillType.PHYSICAL,

    targetType: TargetType.AOE,

    targetRange: [
        [1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0],
        [1,0,1,0,1,0,1],
        [0,1,0,0,0,1,0],
        [1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0],
        [1,0,1,0,1,0,1]
    ],

    effect:function(provider,receiverBoards){
        // receiver 可能為 Combatant 或 Board

        for(let i=0; i<receiverBoards.length; i++){
            var receiver = receiverBoards[i].occupy;
            if(receiver != null && provider.arenaId[0] != receiver.arenaId[0]){
                receiver.hp.decrease(15);
                provider.hp.decrease(-20);
            }
        }
        
    }

}

/* 新角色技能 */
const skill_新角色技能 = {};

// 註冊技能實例
SkillInstaceDict = {
    skill_治癒:skill_治癒,
    skill_超級射程:skill_超級射程,
    skill_武裝強化:skill_武裝強化,
    skill_羅馬斬:skill_羅馬斬,
    skill_海盜砲:skill_海盜砲,
    skill_暴風:skill_暴風,
    skill_祝福:skill_祝福,
    skill_盤根錯節:skill_盤根錯節
    /* 新角色技能  */
}

export {
    SkillInterface,
    SkillType,
    TargetType
 }
 