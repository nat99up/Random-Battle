export default class Board {

    constructor(config) {
        
        this.x = config.x
        this.y = config.y

        this.block = config.block;
        this.occupy = null;
        this.status = [];
        
    }
}