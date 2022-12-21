import app from "../../app";

app.service("gameLoopService", function (gameLoop, heroesService)
{
    var $srvc = this;
    this.init = function() {
        setInterval($srvc.gameLoop, gameLoop.loopTime);
    }
    this.gameLoop = function()
    {
        heroesService.rest();
        console.log("Game Loop");
    }

    
});