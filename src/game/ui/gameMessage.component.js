import app from "../../app"
import template from "./gameMessage.html"

app.component("gameMessage", {
    template,
    controller: function (message) {
        this.message = message;
    }
});
