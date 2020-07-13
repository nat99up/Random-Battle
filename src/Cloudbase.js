firebase.initializeApp({
    databaseURL: "https://randombattle-5090e.firebaseio.com/"
});
  
const database = firebase.database();
var ready = false;
var promise = database.ref('/').on('value',result=>{

    console.log('Firebase is updated!')

    ready = true;
    const baseData = result.val();

    getDatabaseContent = ()=>{
        return baseData
    }

    getTeamData = (teamId)=>{
        return baseData.teams[teamId];
    }

    setTeamData = (teamId,teamArray)=>{

        if(teamId == 'Guest'){
            // 訪客陣容不紀錄
            return ;
        }

        let members = teamArrayToMembers(teamArray);
        if(baseData.teams[teamId]){
            database.ref('/teams/' + teamId).update({members:members});
        }else{
            database.ref('/teams/' + teamId).set({members:members,win:0,lose:0});
        }   
    }

    pickOpponent = (myTeamId)=>{
        const OpponentTidArray = Object.keys(baseData.teams).filter( tid=>tid!=myTeamId && tid != 'Guest')
        const idx = Math.floor(Math.random() * OpponentTidArray.length);

        return {id:OpponentTidArray[idx],array:membersToTeamArray(baseData.teams[OpponentTidArray[idx]].members)}
    }

    uploadGameResult = (winnerTeamId,loserTeamId) => {

        if(winnerTeamId == 'Guest' || loserTeamId == 'Guest'){
            // 訪客對戰不紀錄
            return ;
        }

        database.ref('/teams/' + winnerTeamId + '/win').transaction(function(win){
            return win + 1;
        });

        database.ref('/teams/' + loserTeamId + '/lose').transaction(function(lose){
            return lose + 1;
        });

        
    }
});

export function getDatabaseContent(){
    return ready;
}

export function getTeamData(teamId){
    return ready;
}

export function setTeamData(teamId,teamArray){
    return ready
}

export function pickOpponent(myTeamId){
    return ready
}

export function uploadGameResult(winnerTeamId,loserTeamId){
    return ready;
}

export function membersToTeamArray(members){
    return members.split(',').map(cid=>Number(cid));
}

export function teamArrayToMembers(teamArray){
    return teamArray.map(String).join(',');
}