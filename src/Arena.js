import Board from "./Board.js"
import {SkillInterface,SkillType,TargetType} from "./SkillInterface.js"

export default class Arena {

    constructor(config) {

        this.scene = config.scene
        this.rows = config.rows;
        this.cols = config.cols;
        this.cellSize = config.cellSize; // default=150
        this.top = config.top;
        this.left = config.left;

        this.boards = new Array(this.rows).fill(null).map(()=>new Array(this.cols ).fill(null));
        
        var blocks = this.scene.add.group({ key: 'block', repeat: this.rows * this.cols-1, setScale: { x: this.cellSize/300, y: this.cellSize/300 } });
        
        Phaser.Actions.GridAlign(blocks.getChildren(), {
            height: this.rows,
            width: this.cols,
            cellWidth: this.cellSize,
            cellHeight: this.cellSize,
            x: this.left,
            y: this.top
        });

        for(let i=0; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                let block = blocks.getChildren()[i*this.cols+j];
                this.boards[i][j] = new Board({y:this.top+(i+0.5)*this.cellSize, x:this.left+(j+0.5)*this.cellSize, block:block});
            }
        }

    }


    setBoard(obj,row,col){

        // 只跟Arena.boards,Arena.boardPosition,Combatant.boardCoords有關

        if (!obj.boardCoords){
            obj.x = this.boards[row][col].x;
            obj.y = this.boards[row][col].y;
        }else{
            this.boards[obj.boardCoords.row][obj.boardCoords.col].occupy = null;
        }

        obj.boardCoords = {row:row, col:col};
        this.boards[row][col].occupy = obj;

    }

    addTeams(teamRed,teamBlue){
        this.teamRed = teamRed;
        this.teamBlue = teamBlue;

        for(let j=0; j<this.teamRed.length; j++){

            this.setBoard(this.teamRed[j],0,this.cols-1-j);
            this.teamRed[j].arenaId = 'r'+j;
            this.teamRed[j].setTeam('red');
            
            this.setBoard(this.teamBlue[j],this.rows-1,j);
            this.teamBlue[j].arenaId = 'b'+j;
            this.teamBlue[j].setTeam('blue');
            
        }

    }

    FindDist(){
        // using this.teamRed,this.teamBlue,this.board
        let findingQueue = this.teamRed.concat(this.teamBlue);
        findingQueue.forEach(combatant => {

            let midRow = Math.floor(combatant.moveRange.length/2);
            let midCol = Math.floor(combatant.moveRange[0].length/2);

            var distArray = [];
            var distRow = null;
            var distCol = null;

            for(let i=0; i<combatant.moveRange.length; i++){
                for(let j=0; j<combatant.moveRange[0].length; j++){

                    if(combatant.moveRange[i][j] <= 0){
                        continue;
                    }

                    distRow = combatant.boardCoords.row + i - midRow;
                    distCol = combatant.boardCoords.col + j - midCol;
                    
                    if(distRow < 0 || distRow >= this.rows || distCol < 0 || distCol >= this.cols){
                        continue;
                    }
                    if(this.boards[distRow][distCol].occupy && this.boards[distRow][distCol].occupy.arenaId != combatant.arenaId){
                        continue;
                    }
                    for(let k=0; k<combatant.moveRange[i][j]; k++){
                        distArray.push({row:distRow,col:distCol})
                    }
                }
            }

            const idx = Math.floor(Math.random() * distArray.length);
            const distPosition = this.boards[distArray[idx].row][distArray[idx].col];

            this.setBoard(combatant,distArray[idx].row, distArray[idx].col);

            combatant.animateExecutor.setMoving(distPosition,Math.floor(this.scene.FIND_ENEMY_FRAME*1/2))

        })

    }

    CombatantsMoving(){

        let moveQueue = this.teamRed.concat(this.teamBlue);
        moveQueue.forEach(combatant => {
            if(combatant.animateExecutor.moving){
                combatant.animateExecutor.moving();
            }
        })
    }

    BoardsEffecting(){
        
    }

    CheckSkillLaunchable(){

        let findingQueue = this.teamRed.concat(this.teamBlue);
        findingQueue.forEach(combatant => {
            if(combatant.mp.value == combatant.mp.max){

                // 🚧 Under construction 🚧

                // combatant.skillTarget 用 combatant.activeSkill.targetType 跟 combatant.activeSkill.targetRange設置
                // skillTarget 可能為「戰鬥員」或「場地」
                
                combatant.skillTarget = null;
                if(combatant.activeSkill.targetType == TargetType.SELF){
                    combatant.skillTarget = combatant; 
                }else if(combatant.activeSkill.targetType == TargetType.ENEMY){

                    // 先隨機挑一個enemy target (single)
                    const targetRange = combatant.activeSkill.targetRange;
                    let midRow = Math.floor(targetRange.length/2);
                    let midCol = Math.floor(targetRange[0].length/2);

                    var targetArray = [];
                    var targetRow = null;
                    var targetCol = null;

                    for(let i=0; i<targetRange.length; i++){
                        for(let j=0; j<targetRange[0].length; j++){

                            if(targetRange[i][j] <= 0){
                                continue;
                            }

                            targetRow = combatant.boardCoords.row + i - midRow;
                            targetCol = combatant.boardCoords.col + j - midCol;
                            
                            if(targetRow < 0 || targetRow >= this.rows || targetCol < 0 || targetCol >= this.cols){
                                continue;
                            }

                            if(this.boards[targetRow][targetCol].occupy == null || this.boards[targetRow][targetCol].occupy.arenaId[0] == combatant.arenaId[0]){
                                continue;
                            }
                            
                            for(let k=0; k<targetRange[i][j]; k++){
                                targetArray.push({row:targetRow,col:targetCol})
                            }
                        }
                    }

                    if(targetArray.length > 0){
                        const idx = Math.floor(Math.random() * targetArray.length);
                        combatant.skillTarget = this.boards[targetArray[idx].row][targetArray[idx].col].occupy;
                    }else{
                        combatant.skillTarget = null;
                    }   
                }
                
                if(combatant.skillTarget != null){
                    const targetPosition = {x:combatant.skillTarget.x,y:combatant.skillTarget.y};
                    combatant.animateExecutor.launchSkill(targetPosition, Math.floor((this.scene.END_FRAME-this.scene.FIND_ENEMY_FRAME)*3/5));
                    combatant.battleAction = 'skill';
                }else{
                    combatant.battleAction = 'idle';
                }

            }else{
                combatant.battleAction = 'idle';
            }
        })
    }

    FindEnemy(){
        // using this.teamRed,this.teamBlue,this.board
        let findingQueue = this.teamRed.concat(this.teamBlue);
        findingQueue.forEach(combatant => {

            if(combatant.battleAction == 'skill'){
                return ;
            }

            let midRow = Math.floor(combatant.attackRange.length/2);
            let midCol = Math.floor(combatant.attackRange[0].length/2);

            var targetArray = [];
            var targetRow = null;
            var targetCol = null;

            for(let i=0; i<combatant.attackRange.length; i++){
                for(let j=0; j<combatant.attackRange[0].length; j++){

                    if(combatant.attackRange[i][j] <= 0){
                        continue;
                    }

                    targetRow = combatant.boardCoords.row + i - midRow;
                    targetCol = combatant.boardCoords.col + j - midCol;
                    
                    if(targetRow < 0 || targetRow >= this.rows || targetCol < 0 || targetCol >= this.cols){
                        continue;
                    }

                    if(this.boards[targetRow][targetCol].occupy == null || this.boards[targetRow][targetCol].occupy.arenaId[0] == combatant.arenaId[0]){
                        continue;
                    }
                    
                    for(let k=0; k<combatant.attackRange[i][j] * this.boards[targetRow][targetCol].occupy.core.taunt; k++){
                        targetArray.push({row:targetRow,col:targetCol})
                    }
                }
            }

            if(targetArray.length > 0){
                const idx = Math.floor(Math.random() * targetArray.length);
                const targetPosition = this.boards[targetArray[idx].row][targetArray[idx].col];

                combatant.enemy = this.boards[targetArray[idx].row][targetArray[idx].col].occupy;
                combatant.animateExecutor.setAttack(targetPosition, Math.floor((this.scene.END_FRAME-this.scene.FIND_ENEMY_FRAME)*3/5));
                combatant.battleAction = 'attack';
            }else{
                combatant.enemy = null;
                combatant.battleAction = 'idle';
            }   
        }
        )
    }

    

    CombatantBattling(){

        let moveQueue = this.teamRed.concat(this.teamBlue);
        moveQueue.forEach(combatant => {
            if(combatant.battleAction == 'attack' && combatant.animateExecutor.attacking){
                combatant.animateExecutor.attacking();
            }
        })

    }

    

    CleanUp(){
        this.teamRed = this.teamRed.filter(combatant=>{
            if(combatant.hp.value == 0){
                this.boards[combatant.boardCoords.row][combatant.boardCoords.col].occupy = null;
                combatant.enemy = null;
                combatant.cleanUp();
                return false
            }else{
                return true
            }
        })

        

        this.teamBlue = this.teamBlue.filter(combatant=>{
            if(combatant.hp.value == 0){
                this.boards[combatant.boardCoords.row][combatant.boardCoords.col].occupy = null;
                combatant.enemy = null;
                combatant.cleanUp();
                return false
            }else{
                return true
            }
        })

        if(this.teamBlue.length == 0 && this.teamRed.length == 0){
            return 'Duce'
        }else if(this.teamBlue.length == 0){
            return 'Red'
        }else if(this.teamRed.length == 0){
            return 'Blue'
        }

        return 'Next'
        
    }

    RoundEnd(){
        let moveQueue = this.teamRed.concat(this.teamBlue);
        moveQueue.forEach(combatant => {
            combatant.battleAction = 'idle';
            combatant.skillTarget = null;
            combatant.enemy = null;

            combatant.animateExecutor.moving = null;
            combatant.animateExecutor.attacking = null;

        })
        
    }

}