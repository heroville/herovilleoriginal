/**
 * UI / Tutorial: tutorial steps, error display, theme toggle.
 * Used by MainController; receives scope for panel/state; touches errorDialog DOM for showError.
 */

function UiServiceFactory() {

    function startInfo(scope) {
        scope.panelInfo = true;
    }

    function nextTutorial(scope) {
        switch (scope.panelNumber) {
            case 0: {
                scope.panel = ["You have been granted control of a new town in an unexplored region of the world. Your job is to attract heroes from all over the land to adventure, work and more importantly spend their gold."];
                scope.panelNumber++;
                break;
            }
            case 1: {
                scope.panel = ["To start off you need to begin by gathering the initial resources so that you can build a Tent to attract your first hero. Click the 'Gather' button until you have enough resources to buy a tent. (5 resources)"];
                scope.panelNumber++;
                scope.showTutorial = false;
                break;
            }
            case 2: {
                scope.panel = ["Alright, now click the 'Improve Tent' button to purchase a tent and unlock your first hero. Your heroes name does not affect their playstyle, feel free to name them whatever you want or just keep the default name."];
                scope.panelNumber++;
                break;
            }
            case 3: {
                scope.panel = ["Congratulations! You now have your first hero, You can check on your hero by clicking on the newly unlocked 'Hero' tab. This page gives you a quick summary of your heroes. Here you can see their level, health, XP, inventory, location and adventure status. Later you can also see thier profession."];
                scope.showTutorial = true;
                scope.panelNumber++;
                break;
            }
            case 4: {
                scope.panel = ["You may notice that your hero has earnt some gold. If not, they will gain some as they defeat enemies. Unfortunately, your hero is rather reluctant to give you their gold and as a result you need to create items or provide services to encourage them to spend their gold."];
                scope.panelNumber++;
                break;
            }
            case 5: {
                scope.panel = ["But, before we get to taking gold from the hero we need the room to store it. For this we need to expand the Stockpile, gather the required resources (25) and press the 'Improve Stockpile' button."];
                scope.showTutorial = false;
                scope.panelNumber++;
                break;
            }
            case 6: {
                scope.panel = ["Alright, the stockpile has room for 5 gold and thankfully also unlocks the first item you can produce for a hero, the potion. Once more you will need to gather the required resources (25) head over to the new 'Production' tab and click on the 'Create Potion' button"];
                scope.panelNumber++;
                break;
            }
            case 7: {
                scope.panel = ["The timer will count down the 5 seconds of production time and your first potion will then be created. Once your hero next returns home from an adventure, if they has taken some damage they will purchase the potion for 1 gold. This will heal them for 20% health, but more importanly deposit that gold into your towns inventory."];
                scope.panelNumber++;
                break;
            }
            case 8: {
                scope.panel = ["You now have your first gold, I would recommend using it to purchase the first upgrade 'Bonus Resources' which will allow you to gain 2 resources per click instead of 1. This upgrade is located in the 'Upgrades' panel and is purchased by clicking on it. Purchase the 'Bonus Resources' upgrade"];
                scope.panelNumber++;
                break;
            }
            case 9: {
                scope.panel = ["Nice work! Purchasing upgrades costs gold and provide a permenant bonus for the game. It is recommended you keep an eye on the available upgrades"];
                scope.showTutorial = true;
                scope.panelNumber++;
                break;
            }
            case 10: {
                scope.panel = ["By now your hero might be close to level 3 and as such has stopped gaining any experience. To fix this he needs to fight in stronger dungeons, back on the 'Town' tab you can see you have a building called 'Dungeons', once again gather the resources required (25) and click the 'Improve Dungeons' button."];
                scope.showTutorial = false;
                scope.panelNumber++;
                break;
            }
            case 11: {
                scope.panel = ["The new dungeon should be visible on the 'Town' tab, your hero will adventure in this dungeon once he has had enough successes in the previous dungeon. It is important to keep upgrading dungeons so that you are able to keep your heroes earning experience."];
                scope.showTutorial = true;
                scope.panelNumber++;
                break;
            }
            case 12: {
                scope.panel = ["Unfortunately, the stronger dungeons are more of a challenge to adventurers and they will have some trouble completing them without a better weapon. So for that we need a 'Blacksmith', but we cant do that at this time first we need a 'Market'. Gather the required resources (40) and click 'Improve Market'."];
                scope.showTutorial = false;
                scope.panelNumber++;
                break;
            }
            case 13: {
                scope.panel = ["Alright, the market unlocks the ability to purchase blueprints for new buildings allowing you to construct them. Head over to the 'Production' tab and you should see the 'Blacksmith Blueprint' is available for 1 gold. If you havn't already, create another potion for your hero to purchase then click 'Buy Blacksmith Blueprint'. While you wait you can create another tent for a second hero."];
                scope.panelNumber++;
                break;
            }
            case 14: {
                scope.panel = ["Good Job, you have now unlocked the Blacksmith. Head over to the 'Town' tab and you should now see the Blacksmith listed under buildings. This one is more expensive but certainly worth it. But first, you will need to improve the Stockpile, once you have done that gather the required resources (100) and click 'Improve Blacksmith'."];
                scope.panelNumber++;
                break;
            }
            case 15: {
                scope.panel = ["The Blacksmith unlocks weapons for your hero to purchase, head over to the 'Production' tab and you should see the 'Dagger' is now available. Gather the required 15 resources and click 'Create Dagger'."];
                scope.panelNumber++;
                break;
            }
            case 16: {
                scope.panel = ["Weapons are required for heroes to be able to clear stronger dungeons, while the dagger is not much better than your fist now later on you can equip weapons that allow to you instantly kill some of the strongest monsters. It is worth noticing that weapons have a durability and every time they strike an enemy it loses one of its durability. If a weapon breaks while a hero is in a dungeon he will only have his fist left to kill the remaining enemies."];
                scope.showTutorial = true;
                scope.panelNumber++;
                break;
            }
            case 17: {
                scope.panel = ["You may have also noticed by now a message appearing that informs you that your hero has lost a fight. Currently when a hero loses they will have to start again from level 1, while it is not a huge issue at the moment at higher levels it can be quite annoying. Fortunately the 'Save Point' upgrade exists, this allows heroes to keep their experience and gold when they lose. Use potions and weapons to earn 3 gold and purchase this upgrade."];
                scope.showTutorial = false;
                scope.panelNumber++;
                break;
            }
            case 18: {
                scope.panel = ["By now you are probably starting to wish there was a better way to collect resources than gathering and I am here to tell you that there is. Once a hero reaches level 5 a new blueprint appears, this is the Tavern blueprint and it unlocks the first tier of classes for your hero 'Adventurer' and 'Labourer'. This Blueprint costs 5 gold, but while you wait you can get more heroes by upgrading the Tent, or more weapons through the Blacksmith. Purchase the Tavern blueprint and then click 'Improve Tavern' (150) on the 'Town' tab."];
                scope.panelNumber++;
                break;
            }
            case 19: {
                scope.panel = ["The Tavern unlocks the 'Professions' tab. If you click over to it you will see a list of available professions (Adventurer/Labourer) and any hero you have over level 3 who does not have a profession. If you upgraded the blacksmith you may have noticed there is a profession requirement for the next weapon. If you upgrade your hero to an 'Adventurer' they will be able to equip the new weapon, but more importantly at the moment is the 'Labourer', this allows them to work for your town."];
                scope.showTutorial = true;
                scope.panelNumber++;
                break;
            }
            case 20: {
                scope.panel = ["The labourer will gather resources while idle in town as well as be employed to work for the town and produce items in the 'Production' tab. A labourer can NOT adventure and the change is permenant, so it is recommended to not make all your heroes Labourers. You will gain access to more classes at level 10 with the Academy, each has its own benefits and drawbacks which will be listed on the 'Professions' tab."];
                scope.panelNumber++;
                break;
            }
            case 21: {
                scope.panel = ["This is the end of the tutorial for the game. This screen will be replaced by a game log which will display some of the recent game events. There are many more features to unlock and more being added all the time. Enjoy!"];
                scope.panelNumber++;
                break;
            }
            case 22: {
                scope.panel = [""];
                startInfo(scope);
                scope.showTutorial = false;
                break;
            }
        }
    }

    function showError(scope, message) {
        const el = document.getElementById("errorDialog");
        if (el) el.innerHTML = message;
        setTimeout(function () {
            const clearEl = document.getElementById("errorDialog");
            if (clearEl) clearEl.innerHTML = "<br />";
        }, 3000);
        if (scope.panelInfo) {
            const d = new Date();
            scope.panel.unshift(d.toTimeString().slice(0, 8) + " : " + message);
            if (scope.panel.length > 10) {
                scope.panel.pop();
            }
        }
    }

    function skipTut(scope) {
        scope.panelNumber = 22;
        nextTutorial(scope);
    }

    function changeTheme(scope) {
        scope.dark = !scope.dark;
    }

    return {
        nextTutorial,
        skipTut,
        startInfo,
        showError,
        changeTheme
    };
}

export default UiServiceFactory;
