import Combatant from "./Combatant.js";

export default class Board {

    constructor(config) {
        
        this.x = config.x
        this.y = config.y

        this.block = config.block;
        this.occupy = null;

        this.geomancy = null;
        this.geomancyTeam = null;
        
    }

    setGeomancy(geomancyName,team){
        if(geomancyName == '毒素'){
            this.geomancy = this.poison;
            this.geomancyTeam = team;
        }
    }

    removeGeomancy(){
        this.geomancy = null;
        this.geomancyTeam = null;
    }

    runGeomancy(){
        if(this.geomancy){
            this.geomancy();
        }
    }

    poison(){ //毒素
        if(this.occupy instanceof Combatant && this.occupy.arenaId[0] != this.geomancyTeam){
            this.occupy.hp.decrease(3);
        }
    }


}