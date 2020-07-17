import Board from "./Board.js"
import {SkillType,TargetType} from "./SkillInterface.js"

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
                this.boards[i][j] = new Board({y:block.y, x:block.x, block:block ,scene:this.scene});
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

    // Private
    _returnAllBoardsInRange(originBoardCoords,rangeMatrix,boardCallback){

        // use this.boards[][]
        
        const originRow = originBoardCoords.row;
        const originCol = originBoardCoords.col;
        const centerRow = Math.floor(rangeMatrix.length/2);
        const centerCol = Math.floor(rangeMatrix[0].length/2);

        var targetArray = [];
        var targetRow = null;
        var targetCol = null;

        for(let i=0; i<rangeMatrix.length; i++){
            for(let j=0; j<rangeMatrix[0].length; j++){
                if(rangeMatrix[i][j] <= 0){
                    continue;
                }

                targetRow = originRow + i - centerRow;
                targetCol = originCol + j - centerCol;
                
                if(targetRow < 0 || targetRow >= this.rows || targetCol < 0 || targetCol >= this.cols){
                    continue;
                }

                if( ! boardCallback(this.boards[targetRow][targetCol]) ){
                    continue;
                }
                
                for(let k=0; k<rangeMatrix[i][j]; k++){
                    targetArray.push({row:targetRow,col:targetCol})
                }
            }
        }

        return targetArray;

    }

    FindDist(){
        // using this.teamRed,this.teamBlue,this.board
        let findingQueue = this.teamRed.concat(this.teamBlue);
        findingQueue.forEach(combatant => {

            // get [{row:row1,col:col1},{row:row2,col:col2},...]
            var distArray = this._returnAllBoardsInRange(
                combatant.boardCoords,
                combatant.moveRange,
                (board)=>{return board.occupy == null || board.occupy == combatant}
            );

            const idx = Math.floor(Math.random() * distArray.length);
            const distPosition = this.boards[distArray[idx].row][distArray[idx].col];

            this.setBoard(combatant,distArray[idx].row, distArray[idx].col);

            combatant.animateExecutor.setMoving(distPosition,Math.floor(this.scene.FIND_ENEMY_FRAME/2))

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

    BoardsGeomancyAnimation(){
        for(let i=0; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                this.boards[i][j].perfromAnimate();
            }
        }
    }

    BoardsEffecting(){
        for(let i=0; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                this.boards[i][j].runGeomancy();
            }
        }
    }

    CheckSkillLaunchable(){

        let findingQueue = this.teamRed.concat(this.teamBlue);
        findingQueue.forEach(combatant => {

            // Checkout MP is max
            if(combatant.mp.value == combatant.mp.max){

                // 🚧 Under construction 🚧

                // combatant.skillTarget 用 combatant.activeSkill.targetType 跟 combatant.activeSkill.targetRange設置
                // skillTarget 為「場地」的Array
                
                combatant.skillTarget = null;
                if(combatant.activeSkill.targetType == TargetType.SELF){

                    combatant.skillTarget = [this.boards[combatant.boardCoords.row][combatant.boardCoords.col]];
                    
                }else if(combatant.activeSkill.targetType == TargetType.ENEMY){

                    var targetArray = this._returnAllBoardsInRange(
                        combatant.boardCoords,
                        combatant.activeSkill.targetRange,
                        (board)=>{return board.occupy != null && board.occupy.arenaId[0] != combatant.arenaId[0]}
                    );

                    if(targetArray.length > 0){
                        combatant.skillTarget = targetArray.map((target)=>{
                            return this.boards[target.row][target.col];
                        });
                        combatant.skillTarget = combatant.activeSkill.selectTarget(combatant.skillTarget);
                    }else{
                        combatant.skillTarget = null;
                    }   
                }else if(combatant.activeSkill.targetType == TargetType.ALLIED){

                    var targetArray = this._returnAllBoardsInRange(
                        combatant.boardCoords,
                        combatant.activeSkill.targetRange,
                        (board)=>{return board.occupy != null && board.occupy.arenaId[0] == combatant.arenaId[0]}
                    );

                    if(targetArray.length > 0){
                        combatant.skillTarget = targetArray.map((target)=>{
                            return this.boards[target.row][target.col];
                        });
                        combatant.skillTarget = combatant.activeSkill.selectTarget(combatant.skillTarget);
                    }else{
                        combatant.skillTarget = null;
                    }   
                }else if(combatant.activeSkill.targetType == TargetType.AOE){

                    var targetArray = this._returnAllBoardsInRange(
                        combatant.boardCoords,
                        combatant.activeSkill.targetRange,
                        (board)=>{return 1}
                    );

                    if(targetArray.length > 0){
                        combatant.skillTarget = targetArray.map((target)=>{
                            return this.boards[target.row][target.col];
                        });
                    }else{
                        combatant.skillTarget = null;
                    }   
                }else if(combatant.activeSkill.targetType == TargetType.BOARD){

                    var targetArray = this._returnAllBoardsInRange(
                        combatant.boardCoords,
                        combatant.activeSkill.targetRange,
                        (board)=>{return 1}
                    );

                    if(targetArray.length > 0){
                        combatant.skillTarget = targetArray.map((target)=>{
                            return this.boards[target.row][target.col];
                        });
                    }else{
                        combatant.skillTarget = null;
                    }   
                }
                
                if(combatant.skillTarget != null){
                    const targetPosition = combatant.skillTarget.map((board)=>{
                        return {x:board.x ,y:board.y};
                    });
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

            // 技能優先
            if(combatant.battleAction == 'skill'){
                return ;
            }

            // get [{row:row1,col:col1},{row:row2,col:col2},...]
            var targetArray = this._returnAllBoardsInRange(
                combatant.boardCoords,
                combatant.attackRange,
                (board)=>{return board.occupy != null && board.occupy.arenaId[0] != combatant.arenaId[0]}
            );

            var targetArrayWithTaunt = new Array();
            for(let i in targetArray){
                let row = targetArray[i].row;
                let col = targetArray[i].col;
                let taunt = this.boards[row][col].occupy.core.taunt;
                for(let j=0 ; j<taunt ; j++){
                    targetArrayWithTaunt.push({row:row,col:col});
                }
            }

            targetArray = targetArrayWithTaunt;


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
                combatant.skillTarget = null;
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
                combatant.skillTarget = null;
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