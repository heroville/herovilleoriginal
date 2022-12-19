import app from "../../app";
import template from "./resourceDisplay.html";

app.component("resourceDisplay", {
    bindings: {
        resource: "<"
    },
    template: template
});