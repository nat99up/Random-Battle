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
    '怪鳥比莉'
    /* 新角色 */
]

//var LOCAL_TEAM_ID = localStorage.getItem('LOCAL_TEAM_ID') ? localStorage.getItem('LOCAL_TEAM_ID') : 'Guest';
var LOCAL_TEAM_ID = 'Guest'
var LOCAL_TEAM = [];
var INFINITY = false;


const lobby = {
    key: 'lobby',
    preload: function(){

        this.load.image('logo','./assets/Logo.png');
        this.load.image('sword','./assets/sword.png');
        this.load.image('dice','./assets/dice.png');
        this.load.image('infinity','./assets/infinity.png');
        this.load.image('team-setting','./assets/team-setting.png')

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png');
        this.load.image('海盜船長','./assets/characters/Captain.png');
        this.load.image('怪鳥比莉','./assets/characters/Billy.png');
        /* 新角色 */

        // 場地、隊伍
        this.load.image('block', 'assets/300x300.png');
        this.load.image('flag-team-blue','./assets/150x150-blue.png');
        this.load.image('flag-team-red','./assets/150x150-red.png');
    },

    create: function(){

        this.logo = this.add.image(640, 100, 'logo').setScale(0.5);
        this.sword = this.add.image(400, 480, 'sword').setScale(0.5);
        this.dice = this.add.image(720, 480, 'dice').setScale(0.5);
        this.infinity = this.add.image(560, 480, 'infinity').setScale(0.5);
        this.team_setting = this.add.image(880, 480, 'team-setting').setScale(0.5);

        var blocks = this.add.group({ key: 'block', repeat: RegisterList.length-1, setScale: { x: 1/3, y: 1/3 } });
        
        Phaser.Actions.GridAlign(blocks.getChildren(), {
            width: 5,
            cellWidth: 100,
            cellHeight: 100,
            x: 640-300,
            y: 150
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
            y: 575,
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
            LOCAL_TEAM_ID = prompt("請輸入隊伍ID:", "GUEST");
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

            INFINITY = false;

            let a = getDatabaseContent();
            if( a == false){
                alert('Connecting....')
                return ;
            }
            if(LOCAL_TEAM.length == 3){ 

                setTeamData(LOCAL_TEAM_ID,LOCAL_TEAM);
                this.scene.start('gameStart',{
                    "blueTeamID":LOCAL_TEAM_ID,
                    "blueTeam":LOCAL_TEAM
                });

            }else{
                alert('Please selected 3 Combatants');
            }
        })

        // Ramdom pick
        //this.dice.setInteractive({useHandCursor: true})
        this.dice.on('pointerdown',()=>{
            INFINITY = false;
            this.scene.start('gameStart');
        })

        // Infinity run
        //this.infinity.setInteractive({useHandCursor: true})
        this.infinity.on('pointerdown',()=>{
            INFINITY = true;
        })

        this.frameCnt = 0;
    },
    update: function(){
        if(INFINITY && this.frameCnt > 30){
            this.scene.start('gameStart');
        }
        this.frameCnt += 1;
    }
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
        /* 新角色技能*/
    },
    init: function(data){

        var ramdomEnemyList = new Array(RegisterList.length).fill(0);
        ramdomEnemyList = ramdomEnemyList.map((x,i)=>i);

        if(data.blueTeamID){

            this.blueTeamId = data.blueTeamID;
            this.blueTeamArray = data.blueTeam;

            const redTeamData = pickOpponent(data.blueTeamID);

            this.redTeamId = redTeamData.id;
            this.redTeamArray = redTeamData.array;
            
        }        

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
        this.Arena = new Arena({scene:this, top:0, left:640-300, rows:4, cols:4, cellSize:150, key:'block'})
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
        this.scoreboard = this.make.text({
            x: 200,
            y: 100,
            text: 'Round 0',
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 25px Arial',
                fill: 'white',
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
            this.scoreboard.text = "Round "+this.roundCnt;
            this.Arena.FindDist(); // 探索移動點
            
        }else if(this.frameCnt < this.FIND_ENEMY_FRAME){

            this.Arena.CombatantsMoving(); // 執行移動

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

                    if (RoundResult == 'Red'){
                        uploadGameResult(this.redTeamId,this.blueTeamID)
                    }else if(RoundResult == 'Blue'){
                        uploadGameResult(this.blueTeamId,this.redTeamID)
                    }

                    this.time.addEvent({ 
                        delay: 1000, 
                        callback: ()=>{this.scene.start('settlement',{'logging':this.Calculator.logging,'result':RoundResult})}, 
                        callbackScope: this }); // 遊戲結束
                }
                this.Arena.RoundEnd(); // 回合結束
    
            }
        }

        this.frameCnt = (this.frameCnt+1) % (this.END_FRAME);
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
        '造成傷害最多 : \n' + damageKing + ' --> ' + this.logging.damages[damageKingIdx] + '\n\n' + 
        '承受傷害最多 : \n' + injureKing + ' --> ' + this.logging.injures[injureKingIdx];

        this.settlementboard = this.make.text({
            x: 640,
            y: 350,
            text: settlementText,
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 20px Arial',
                fill: 'white',
                align: 'left',
                wordWrap: { width: 300 }
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
        gameStart,
        settlement,
        
    ]
}

const game = new Phaser.Game(config);
