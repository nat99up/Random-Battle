import Combatant from "./Combatant.js";
import Arena from "./Arena.js"
import BattleCalculator from "./BattleCalculator.js"
import {getDatabaseContent,getTeamData,membersToTeamArray,setTeamData,pickOpponent,uploadGameResult} from "./Cloudbase.js"

var RegisterList = [
    '原型機0號',
    '原型機1號',
    '原型機2號',
    '角鬥士',
    '海盜船長',
    '怪鳥比莉',
    '幸運仙子',
    '枯木大王',
    '宗師血鬼'
    /* 新角色 */
]

//var LOCAL_TEAM_ID = localStorage.getItem('LOCAL_TEAM_ID') ? localStorage.getItem('LOCAL_TEAM_ID') : 'Guest';
var LOCAL_TEAM_ID = 'Guest'
var LOCAL_TEAM = [];
var INIFINITY_MODE = false;


const lobby = {
    key: 'lobby',
    preload: function(){

        this.load.image('logo','./assets/Logo.png');
        this.load.image('sword','./assets/sword.png');
        this.load.image('leaderboard','./assets/leaderboard.png');
        this.load.image('dice','./assets/dice.png');
        this.load.image('introduce','./assets/introduce.png');
        this.load.image('team-setting','./assets/team-setting.png');

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png');
        this.load.image('海盜船長','./assets/characters/Captain.png');
        this.load.image('怪鳥比莉','./assets/characters/Billy.png');
        this.load.image('幸運仙子','./assets/characters/Fairy.png');
        this.load.image('枯木大王','./assets/characters/Dead_Wood.png');
        this.load.image('宗師血鬼','./assets/characters/Vampire.png');
        /* 新角色 */

        // 場地、隊伍
        this.load.image('block', 'assets/300x300.png');
        this.load.image('flag-team-blue','./assets/150x150-blue.png');
    },

    create: function(){

        this.logo = this.add.image(640, 100, 'logo').setScale(0.5);
        this.sword = this.add.image(400, 450, 'sword').setScale(0.5);
        this.leaderboard = this.add.image(520, 450, 'leaderboard').setScale(0.5);
        this.dice = this.add.image(640, 450, 'dice').setScale(0.5);
        this.introduce = this.add.image(760, 450, 'introduce').setScale(0.5);
        this.team_setting = this.add.image(880, 450, 'team-setting').setScale(0.5);

        var blocks = this.add.group({ key: 'block', repeat: RegisterList.length-1, setScale: { x: 1/3, y: 1/3 } });
        
        Phaser.Actions.GridAlign(blocks.getChildren(), {
            width: 5,
            cellWidth: 100,
            cellHeight: 100,
            x: 640-300,
            y: 120
        });

        this.roleList = new Array(RegisterList.length).fill(null);

        for(let i=0; i<RegisterList.length; i++){

            let name = RegisterList[i];
            let block  = blocks.getChildren()[i];
            this.roleList[i] = this.add.image(block.x, block.y, name).setScale(60/256);
            this.roleList[i].box = this.add.image(block.x, block.y, 'flag-team-blue').setScale(2/3);

            this.roleList[i].box.visible = LOCAL_TEAM.includes(i);

            block.setInteractive({useHandCursor: true})
            block.on('pointerdown', () => {
                this.roleList[i].box.visible = ! this.roleList[i].box.visible;
                var index = LOCAL_TEAM.indexOf(i)
                if(index > -1){
                    LOCAL_TEAM.splice(index,1);
                }else{
                    LOCAL_TEAM.push(i);
                }
            })
        }

        // 隊伍認證相關
        // 隊伍名稱顯示
        this.teamIDText = this.make.text({
            x: 1100,
            y: 500,
            text: 'Team ID : ' + LOCAL_TEAM_ID,
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 16px Arial',
                fill: 'white',
            }
        });

        // Team id setting
        this.team_setting.setInteractive({useHandCursor: true})
        this.team_setting.on('pointerdown',()=>{
            
            LOCAL_TEAM_ID = prompt("請輸入隊伍ID:", "Guest");
        
            if(LOCAL_TEAM_ID == null || LOCAL_TEAM_ID[0] == '_'){
                alert('未輸入或含有非法字元(_)');
                LOCAL_TEAM_ID = "Guest";
                return ;
            }else if(LOCAL_TEAM_ID == 'infinity'){
                alert('開啟無限隨機模式');
                LOCAL_TEAM_ID = "Guest";
                INIFINITY_MODE = true
                return ;
            }

            this.teamIDText.text = 'Team ID : ' + LOCAL_TEAM_ID;
            const teamData = getTeamData(LOCAL_TEAM_ID)

            if(teamData){
                LOCAL_TEAM = membersToTeamArray(teamData.members)
                console.log(LOCAL_TEAM_ID,'is exist',LOCAL_TEAM);

                for(let i=0; i<RegisterList.length; i++){
                    this.roleList[i].box.visible = LOCAL_TEAM.includes(i);
                }
                localStorage.setItem("LOCAL_TEAM_ID", LOCAL_TEAM_ID);
            }else{
                LOCAL_TEAM = [];
                console.log(LOCAL_TEAM_ID,'is not exist');
            }
        })


        // Hand pick
        this.sword.setInteractive({useHandCursor: true})
        this.sword.on('pointerdown',()=>{

            let a = getDatabaseContent();
            if( a == false){
                alert('Connecting....')
                return ;
            }
            if(LOCAL_TEAM.length == 3){ 
                setTeamData(LOCAL_TEAM_ID,LOCAL_TEAM);
                this.scene.start('gameStart',{
                    "blueTeamId":LOCAL_TEAM_ID,
                    "blueTeam":LOCAL_TEAM
                });
            }else{
                alert('Please selected 3 Combatants');
            }
        })

        // Leaderboard page
        this.leaderboard.setInteractive({useHandCursor: true})
        this.leaderboard.on('pointerdown',()=>{
            let a = getDatabaseContent();
            if( a == false){
                alert('Connecting....')
                return ;
            }
            this.scene.start('leaderboard',{
                databaseContent:a,
            });

        })

        // Ramdom pick
        this.dice.setInteractive({useHandCursor: true})
        this.dice.on('pointerdown',()=>{
            let a = getDatabaseContent();
            if( a == false){
                alert('Connecting....')
                return ;
            }
            const blueTeamData = pickOpponent('Guest');
            this.scene.start('gameStart',{
                "blueTeamId":blueTeamData.id,
                "blueTeam":blueTeamData.array
            });
        })

        // Introduce
        this.introduce.setInteractive({useHandCursor: true})
        this.introduce.on('pointerdown',()=>{
            this.scene.start('introduce');

        })

        this.frameCnt = 0;
    },
    update: function(){

        this.frameCnt += 1;

        if(INIFINITY_MODE && this.frameCnt >= 60){
            let a = getDatabaseContent();
            if( a == false){
                return ;
            }
            const blueTeamData = pickOpponent('Guest');
            this.scene.start('gameStart',{
                "blueTeamId":blueTeamData.id,
                "blueTeam":blueTeamData.array
            });
        }
    }
}

/*===========================================================================================*/

const introduce = {
    key: 'introduce',
    preload: function(){

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png');
        this.load.image('海盜船長','./assets/characters/Captain.png');
        this.load.image('怪鳥比莉','./assets/characters/Billy.png');
        this.load.image('幸運仙子','./assets/characters/Fairy.png');
        this.load.image('枯木大王','./assets/characters/Dead_Wood.png');
        this.load.image('宗師血鬼','./assets/characters/Vampire.png');
        /* 新角色 */

        // 角色介紹
        this.load.image('原型機0號intro','./assets/characters/intro/Prototype_0_intro.png');
        this.load.image('原型機1號intro','./assets/characters/intro/Prototype_1_intro.png');
        this.load.image('原型機2號intro','./assets/characters/intro/Prototype_2_intro.png');
        this.load.image('角鬥士intro','./assets/characters/intro/Gladiator_intro.png');
        this.load.image('海盜船長intro','./assets/characters/intro/Captain_intro.png');
        this.load.image('怪鳥比莉intro','./assets/characters/intro/Billy_intro.png');
        this.load.image('幸運仙子intro','./assets/characters/intro/Fairy_intro.png');
        this.load.image('枯木大王intro','./assets/characters/intro/Dead_Wood_intro.png')
        this.load.image('宗師血鬼intro','./assets/characters/intro/Vampire_intro.png')
        /* 新角色 */

        this.load.image('block', 'assets/300x300.png');
        this.load.image('flag-team-blue','./assets/150x150-blue.png');
        this.load.image('back','assets/back.png');
    },

    create: function(){

        this.back = this.add.image(350, 480, 'back').setScale(0.4);
        this.back.setInteractive({useHandCursor: true})
        this.back.on('pointerdown',()=>{
            this.scene.start('lobby');
        })

        this.background = this.add.rectangle(640, 260, 480, 360, 0xffffff);
        this.background.visible = false;

        var blocks = this.add.group({ key: 'block', repeat: RegisterList.length-1, setScale: { x: 1/6, y: 1/6 } });
        
        Phaser.Actions.GridAlign(blocks.getChildren(), {
            width: 8,
            cellWidth: 50,
            cellHeight: 50,
            x: 640-300,
            y: 350
        });

        this.roleList = new Array(RegisterList.length).fill(null);

        for(let i=0; i<RegisterList.length; i++){

            let name = RegisterList[i];
            let block  = blocks.getChildren()[i];
            this.roleList[i] = this.add.image(block.x, block.y, name).setScale(30/256);
            this.roleList[i].box = this.add.image(block.x, block.y, 'flag-team-blue').setScale(1/3);
            this.roleList[i].box.visible = false;

            this.roleList[i].intro = this.add.image(640, 260, name+'intro').setScale(1/4); 
            this.roleList[i].intro.visible = false;
            block.setInteractive({useHandCursor: true})
            block.on('pointerdown', () => {

                if(this.roleList[i].box.visible){
                    this.background.visible = false;
                    this.roleList[i].box.visible = false;
                    this.roleList[i].intro.visible = false;
                }else{
                    for(let j=0; j<RegisterList.length; j++){
                        this.roleList[j].box.visible = false;
                        this.roleList[j].intro.visible = false;
                    }
                    this.background.visible = true;
                    this.roleList[i].box.visible = true;
                    this.roleList[i].intro.visible = true;
                }
                
            })
        }

       
    },

}


/*===========================================================================================*/


const gameStart = {
    key: 'gameStart',
    preload: function(){
        // 載入資源
        this.load.json('combatant_data', './assets/datas/prototype-series.json');

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png');
        this.load.image('海盜船長','./assets/characters/Captain.png');
        this.load.image('怪鳥比莉','./assets/characters/Billy.png');
        this.load.image('幸運仙子','./assets/characters/Fairy.png');
        this.load.image('枯木大王','./assets/characters/Dead_Wood.png');
        this.load.image('宗師血鬼','./assets/characters/Vampire.png');
        /* 新角色 */

        // 場地、隊伍
        this.load.image('block', 'assets/300x300.png');
        this.load.image('flag-team-blue','./assets/150x150-blue.png');
        this.load.image('flag-team-red','./assets/150x150-red.png');

        // 攻擊
        this.load.image('aim','./assets/aim.png');
        this.load.spritesheet('gun-spark', './assets/skill/pipo-btleffect135.png', {frameWidth: 120, frameHeight: 120});
        
        // 技能動畫
        this.load.spritesheet('heal', './assets/skill/pipo-btleffect016.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('level-up', './assets/skill/pipo-btleffect019.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('level-down', './assets/skill/pipo-btleffect020.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('chop', './assets/skill/pipo-btleffect001.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('bombard', './assets/skill/pipo-btleffect003.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('storm', './assets/skill/pipo-btleffect039.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('blessing', './assets/skill/pipo-btleffect007.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('root', './assets/skill/pipo-btleffect118i.png', {frameWidth: 120, frameHeight: 120});
        this.load.spritesheet('dark', './assets/skill/pipo-btleffect175_192.png', {frameWidth: 196, frameHeight: 196});
        /* 新角色技能*/

        // 地形動畫
        this.load.spritesheet('poison', './assets/skill/pipo-btleffect014.png', {frameWidth: 120, frameHeight: 120});

    },
    init: function(data){

        this.blueTeamId = data.blueTeamId;
        this.blueTeamArray = data.blueTeam;

        const redTeamData = pickOpponent(data.blueTeamId);

        this.redTeamId = redTeamData.id;
        this.redTeamArray = redTeamData.array;

    }
    ,
    create: function(){

        this.FIND_DIST_FRAME = 0;
        this.FIND_ENEMY_FRAME = 30;
        this.DAMAGE_CALCULATE_FRAME = 45;
        this.END_FRAME = 60;

        this.moveQueue = Array();
        this.frameCnt = -60;
        this.roundCnt = 0;

        // 資源載入完成，加入遊戲物件及相關設定
        this.Arena = new Arena({scene:this, top:20, left:640-250, rows:4, cols:4, cellSize:100, key:'block'})
        let jsonDatas = this.cache.json.get('combatant_data');

        // 建立戰鬥員及隊伍
        this.teamRed = new Array();
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.redTeamArray[0]]}));
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.redTeamArray[1]]}));
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.redTeamArray[2]]}));

        this.teamBlue = new Array();
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.blueTeamArray[0]]}));
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.blueTeamArray[1]]}));
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.blueTeamArray[2]]}));
        
        
        // 加入戰隊
        this.Arena.addTeams(this.teamRed,this.teamBlue);
        this.Calculator = new BattleCalculator(this.teamRed,this.teamBlue);

        // 計分表
        this.timerboard = this.make.text({
            x: 350,
            y: 150,
            text: 'Round 0',
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 25px Arial',
                fill: 'white',
                wordWrap: { width: 300 }
            }
        });

        this.redTeamText = this.make.text({
            x: 350,
            y: 250,
            text: this.redTeamId,
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 25px Arial',
                fill: 'red',
                align: 'center',
                wordWrap: { width: 300 }
            }
        });

        this.verseText = this.make.text({
            x: 350,
            y: 300,
            text: 'V.S.',
            origin: { x: 1.0, y: 1.0 },
            align: 'center',
            style: {
                font: 'bold 20px Arial',
                fill: 'white',
                wordWrap: { width: 300 }
            }
        });

        this.blueTeamText = this.make.text({
            x: 350,
            y: 350,
            text: this.blueTeamId,
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 25px Arial',
                fill: 'blue',
                align: 'center',
                wordWrap: { width: 300 }
            }
        });

    },
    update: function(){
        // 遊戲狀態更新

        if(this.frameCnt < this.FIND_DIST_FRAME){
            this.frameCnt += 1
            return;
        }

        if(this.frameCnt == this.FIND_DIST_FRAME){

            this.roundCnt += 1;
            this.timerboard.text = "Round "+this.roundCnt;
            this.Arena.FindDist(); // 探索移動點
            
        }else if(this.frameCnt < this.FIND_ENEMY_FRAME){

            this.Arena.CombatantsMoving(); // 執行移動

            if(this.frameCnt == Math.floor(this.FIND_ENEMY_FRAME/2)){
                this.Arena.BoardsGeomancyAnimation()
            }

        }else if(this.frameCnt == this.FIND_ENEMY_FRAME){

            this.Arena.BoardsEffecting() // 地板效果發動(unuse)
            this.Arena.CleanUp(); // 清理戰場
            this.Arena.CheckSkillLaunchable(); // 確認技能發動資格(simple)
            this.Arena.FindEnemy(); // 探索敵人

        }else if(this.frameCnt < this.END_FRAME){
            
            this.Arena.CombatantBattling(); // 執行戰鬥

            if(this.frameCnt == this.DAMAGE_CALCULATE_FRAME){

                this.Calculator.ApplySkill(); // 技能計算(simple)
                this.Calculator.ApplyDamage(); // 傷害計算
            }
            else if(this.frameCnt == this.END_FRAME-1){
    
                var RoundResult = this.Arena.CleanUp(); // 清理戰場
                if(RoundResult != 'Next'){

                    this.END_FRAME = -1; //防止再進來這個if
                    if (RoundResult == 'Red'){
                        uploadGameResult(this.redTeamId,this.redTeamArray,this.blueTeamId,this.blueTeamArray)
                    }else if(RoundResult == 'Blue'){
                        uploadGameResult(this.blueTeamId,this.redTeamArray,this.redTeamId,this.blueTeamArray)
                    }

                    this.time.addEvent({ 
                        delay: 1000, 
                        callback: ()=>{this.scene.start('settlement',{'logging':this.Calculator.logging,'result':RoundResult})}, 
                        callbackScope: this }); // 遊戲結束
                    
                }
                this.Arena.RoundEnd(); // 回合結束
    
            }
        }

        if(this.roundCnt == 45 && this.END_FRAME > 0){

            this.Arena.boards[0][0].setGeomancy('毒素','N',100);
            this.Arena.boards[0][1].setGeomancy('毒素','N',100);
            this.Arena.boards[0][2].setGeomancy('毒素','N',100);
            this.Arena.boards[0][3].setGeomancy('毒素','N',100);
            this.Arena.boards[1][0].setGeomancy('毒素','N',100);
            this.Arena.boards[1][3].setGeomancy('毒素','N',100);
            this.Arena.boards[2][0].setGeomancy('毒素','N',100);
            this.Arena.boards[2][3].setGeomancy('毒素','N',100);
            this.Arena.boards[3][0].setGeomancy('毒素','N',100);
            this.Arena.boards[3][1].setGeomancy('毒素','N',100);
            this.Arena.boards[3][2].setGeomancy('毒素','N',100);
            this.Arena.boards[3][3].setGeomancy('毒素','N',100);

        }

        this.frameCnt = (this.frameCnt+1) % (this.END_FRAME);
    }
}



/*===========================================================================================*/

const leaderboard = {
    key: 'leaderboard',
    init(data){
        this.databaseContent = data.databaseContent;
    }
    ,
    preload: function(){
        this.load.image('back','assets/back.png');

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png');
        this.load.image('海盜船長','./assets/characters/Captain.png');
        this.load.image('怪鳥比莉','./assets/characters/Billy.png');
        this.load.image('幸運仙子','./assets/characters/Fairy.png');
        this.load.image('枯木大王','./assets/characters/Dead_Wood.png')
        this.load.image('宗師血鬼','./assets/characters/Vampire.png');
        /* 新角色 */

        this.load.image('block', 'assets/300x300.png');
    }
    ,
    create: function(){

        this.showTeamNum = 8;

        this.back = this.add.image(300, 500, 'back').setScale(0.4);
        this.back.setInteractive({useHandCursor: true})
        this.back.on('pointerdown',()=>{
            this.scene.start('lobby');
        })

        var leaderboardArray = new Array();

        for(var id in this.databaseContent.teams){
            if(id == 'Guest') continue;
            const teamArray = membersToTeamArray(this.databaseContent.teams[id].members);
            const win = this.databaseContent.teams[id].win;
            const lose = this.databaseContent.teams[id].lose;
            const winRate = isNaN(win/(win+lose)) ? 0 : win/(win+lose)*100;
            leaderboardArray.push({teamId:id,win:win,lose:lose,winRate:winRate,teamArray:teamArray});
        }

        leaderboardArray.sort((a,b)=>{return b.winRate-a.winRate});

        for(let i=0; i<Math.min(leaderboardArray.length,this.showTeamNum); i++){
            let teamRec = leaderboardArray[i];
            let rowText = teamRec.teamId + '   勝率: ' + teamRec.winRate.toFixed(2) + '%'
                            + '  ( ' + teamRec.win + ' / ' + (teamRec.win+teamRec.lose) + ' )';
            this.make.text({
                x: 640-280,
                y: 140+i*60,
                text: i+1,
                origin: { x: 1.0, y: 1.0 },
                style: {
                    font: 'bold 20px Arial',
                    fill: 'white',
                },
            });
            this.make.text({
                x: 640+140,
                y: 140+i*60,
                text: rowText,
                origin: { x: 1.0, y: 1.0 },
                style: {
                    font: 'bold 20px Arial',
                    fill: 'white',
                },
            });

            let blocks = this.add.group({ key: 'block', repeat:2, setScale: { x: 1/6, y: 1/6 } });
            Phaser.Actions.GridAlign(blocks.getChildren(), {
                width: 3,
                cellWidth: 50,
                cellHeight: 50,
                x: 640+60,
                y: i*60,
            });
            for(let j=0 ; j<teamRec.teamArray.length ; j++){
                let name = RegisterList[teamRec.teamArray[j]];
                let block  = blocks.getChildren()[j];
                this.add.image(block.x, block.y, name).setScale(30/256);
            }
            
        }

    }
}

/*===========================================================================================*/

const settlement = {
    key: 'settlement',
    init: function(data){
        this.logging = data.logging;
        this.result = data.result;
        this.resultText= {'Duce':'平局！','Red':'紅方勝利！','Blue':'藍方勝利！'}
    },
    preload: function(){},
    create: function(){

        const damageKingIdx = this.logging.damages.indexOf(Math.max(...this.logging.damages));
        const injureKingIdx = this.logging.injures.indexOf(Math.max(...this.logging.injures));

        const damageKing = ((damageKingIdx < 2) ? '(紅方) ' : '(藍方) ') + this.logging.names[damageKingIdx];
        const injureKing = ((injureKingIdx < 2) ? '(紅方) ' : '(藍方) ') + this.logging.names[injureKingIdx];

        const settlementText = 
        this.resultText[this.result] + '\n\n\n' +
        '造成傷害最多 : ' + damageKing + ' --> ' + this.logging.damages[damageKingIdx] + '\n\n' + 
        '承受傷害最多 : ' + injureKing + ' --> ' + this.logging.injures[injureKingIdx];

        this.settlementboard = this.make.text({
            x: 640,
            y: 300,
            text: settlementText,
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 20px Arial',
                fill: 'white',
                align: 'left',
                wordWrap: { width: 1000 }
            }
        });

        this.settlementboard.setInteractive({useHandCursor: true})
        this.settlementboard.on('pointerdown', () => {
            this.scene.start('lobby');
        }
        )

        this.frameCnt = 0;
    },
    update: function(){
        if(this.frameCnt > 180){
            this.scene.start('lobby');
        }
        this.frameCnt += 1;
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 615,
    parent: 'app',
    scene: [
        
        lobby,
        introduce,
        gameStart,
        settlement,
        leaderboard,
        
    ]
}

const game = new Phaser.Game(config);
