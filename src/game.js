import Combatant from "./Combatant.js";
import Arena from "./Arena.js"
import BattleCalculator from "./BattleCalculator.js"


var INFINITY = false;

var StatisticsTable = [
    {name:'原型機0號',win:0,lose:0},
    {name:'原型機1號',win:0,lose:0},
    {name:'原型機2號',win:0,lose:0},
    {name:'角鬥士',win:0,lose:0},
    {name:'海盜船長',win:0,lose:0}
]

const gameStart = {
    key: 'gameStart',
    preload: function(){
        // 載入資源
        this.load.json('prototype_data', './assets/datas/prototype-series.json');

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png')
        this.load.image('海盜船長','./assets/characters/Captain.png')

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
        
    },
    init: function(data){

        var ramdomEnemyList = new Array(StatisticsTable.length).fill(0);
        ramdomEnemyList = ramdomEnemyList.map((x,i)=>i);
        ramdomEnemyList.sort(() => Math.random() - 0.5)

        this.b0_cid = ramdomEnemyList[0];
        this.b1_cid = ramdomEnemyList[1];
        this.b2_cid = ramdomEnemyList[2];

        ramdomEnemyList.sort(() => Math.random() - 0.5)
        this.r0_cid = ramdomEnemyList[0];
        this.r1_cid = ramdomEnemyList[1];
        this.r2_cid = ramdomEnemyList[2];

        // 藍方隊伍戰鬥員編號
        if(data.blueTeam){
            this.b0_cid = data.blueTeam[0];
            this.b1_cid = data.blueTeam[1];
            this.b2_cid = data.blueTeam[2];
        }

        // 紅方隊伍戰鬥員編號
        if(data.redTeam){
            this.r0_cid = data.redTeam[0];
            this.r1_cid = data.redTeam[1];
            this.r2_cid = data.redTeam[2];            
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
        let jsonDatas = this.cache.json.get('prototype_data');


        // 建立戰鬥員及隊伍
        this.teamRed = new Array();
        
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.r0_cid]}));
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.r1_cid]}));
        this.teamRed.push(new Combatant({scene:this, data:jsonDatas[this.r2_cid]}));

        this.teamBlue = new Array();
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.b0_cid]}));
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.b1_cid]}));
        this.teamBlue.push(new Combatant({scene:this, data:jsonDatas[this.b2_cid]}));
        
        
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

        var leaderboardTexts = new Array(jsonDatas.length).fill(0)

        leaderboardTexts = leaderboardTexts.map((x,i)=>{

            const name = StatisticsTable[i].name;
            const w = StatisticsTable[i].win;
            const l = StatisticsTable[i].lose;

            var r = w/(w+l)*100;
            r = r.toFixed(2);

            return  name+' : '+ r + '% ( '+w+' / '+(w+l)+' )';
        })

        this.leaderboard = this.make.text({
            x: 1200,
            y: 250,
            text: leaderboardTexts.join('\n\n'),
            origin: { x: 1.0, y: 1.0 },
            style: {
                font: 'bold 16px Arial',
                fill: 'white',
                align: 'left',
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
                        StatisticsTable[this.r0_cid].win += 1;
                        StatisticsTable[this.r1_cid].win += 1;
                        StatisticsTable[this.r2_cid].win += 1;
                        StatisticsTable[this.b0_cid].lose += 1;
                        StatisticsTable[this.b1_cid].lose += 1;
                        StatisticsTable[this.b2_cid].lose += 1;
                        
                    }else if(RoundResult == 'Blue'){
                        StatisticsTable[this.b0_cid].win += 1;
                        StatisticsTable[this.b1_cid].win += 1;
                        StatisticsTable[this.b2_cid].win += 1;
                        StatisticsTable[this.r0_cid].lose += 1;
                        StatisticsTable[this.r1_cid].lose += 1;
                        StatisticsTable[this.r2_cid].lose += 1;

                    }
                    setTimeout(()=>{this.scene.start('settlement',this.Calculator.logging),1500}) // 遊戲結束
                     
                }
                this.Arena.RoundEnd(); // 回合結束
    
            }
        }

        this.frameCnt = (this.frameCnt+1) % (this.END_FRAME);
    }
}

const lobby = {
    key: 'lobby',
    preload: function(){

        this.load.image('logo','./assets/Logo.png');
        this.load.image('sword','./assets/sword.png');
        this.load.image('dice','./assets/dice.png');
        this.load.image('infinity','./assets/infinity.png');

        // 載入資源
        this.load.json('prototype_data', './assets/datas/prototype-series.json');

        // 人物圖像
        this.load.image('原型機0號','./assets/characters/Prototype_0.png');
        this.load.image('原型機1號','./assets/characters/Prototype_1.png');
        this.load.image('原型機2號','./assets/characters/Prototype_2.png');
        this.load.image('角鬥士','./assets/characters/Gladiator.png')
        this.load.image('海盜船長','./assets/characters/Captain.png')

        // 場地、隊伍
        this.load.image('block', 'assets/300x300.png');
        this.load.image('flag-team-blue','./assets/150x150-blue.png');
        this.load.image('flag-team-red','./assets/150x150-red.png');
    },

    create: function(){

        this.logo = this.add.image(640, 100, 'logo').setScale(0.75);
        this.sword = this.add.image(400, 500, 'sword').setScale(0.75);
        this.dice = this.add.image(880, 500, 'dice').setScale(0.75);
        this.infinity = this.add.image(640, 500, 'infinity').setScale(0.75);

        var blocks = this.add.group({ key: 'block', repeat: StatisticsTable.length-1, setScale: { x: 0.5, y: 0.5 } });
        
        Phaser.Actions.GridAlign(blocks.getChildren(), {
            width: 5,
            cellWidth: 150,
            cellHeight: 150,
            x: 640-150*StatisticsTable.length/2,
            y: 250
        });

        this.roleList = new Array(StatisticsTable.length).fill(null);
        this.roleSelected = [];

        for(let i=0; i<StatisticsTable.length; i++){

            let name = StatisticsTable[i].name;
            let block  = blocks.getChildren()[i];
            this.roleList[i] = this.add.image(block.x, block.y, name).setScale(80/256);
            this.roleList[i].box = this.add.image(block.x, block.y, 'flag-team-blue');
            this.roleList[i].box.visible = false;
            this.roleList[i].selected = false;

            block.setInteractive({useHandCursor: true})
            block.on('pointerdown', () => {
                this.roleList[i].box.visible = ! this.roleList[i].box.visible;
                this.roleList[i].selected = ! this.roleList[i].selected;
                
                var index = this.roleSelected.indexOf(i)
                if(index > -1){
                    this.roleSelected.splice(index,1);
                }else{
                    this.roleSelected.push(i);
                }
            })
        }

        // Hand pick
        this.sword.setInteractive({useHandCursor: true})
        this.sword.on('pointerdown',()=>{
            
            if(this.roleSelected.length == 3){
                INFINITY = false;
                this.scene.start('gameStart',{"buleTeam":this.roleSelected});
            }else{
                alert('Please selected 3 Combatants');
            }

        })

        // Ramdom pick
        this.dice.setInteractive({useHandCursor: true})
        this.dice.on('pointerdown',()=>{
            INFINITY = false;
            this.scene.start('gameStart');
        })

        // Infinity run
        this.infinity.setInteractive({useHandCursor: true})
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


const settlement = {
    key: 'settlement',
    init: function(logging){
        this.logging = logging;
    },
    preload: function(){},
    create: function(){

        const damageKingIdx = this.logging.damages.indexOf(Math.max(...this.logging.damages));
        const injureKingIdx = this.logging.injures.indexOf(Math.max(...this.logging.injures));

        const damageKing = ((damageKingIdx < 2) ? '(紅)' : '(藍)') + this.logging.names[damageKingIdx];
        const injureKing = ((injureKingIdx < 2) ? '(紅)' : '(藍)') + this.logging.names[injureKingIdx];

        const settlementText = 
        '傷害最多 : ' + damageKing + ' --> ' + this.logging.damages[damageKingIdx] + '\n\n' + 
        '承受最多 : ' + injureKing + ' --> ' + this.logging.injures[injureKingIdx];

        this.settlementboard = this.make.text({
            x: 650,
            y: 250,
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
    },
    update: function(){}
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
