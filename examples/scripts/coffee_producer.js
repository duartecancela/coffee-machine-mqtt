const { Servient } = require("@node-wot/core");
const MqttBrokerServer = require("@node-wot/binding-mqtt").MqttBrokerServer;

const servient = new Servient();
servient.addServer(new MqttBrokerServer({ uri: "mqtt://localhost:1883" }));

servient.start().then((WoT) => {
    WoT.produce({
        title: "CoffeeMachine",
        id: "urn:dev:wot:coffee-machine",
        securityDefinitions: {
            nosec_sc: { scheme: "nosec" },
        },
        security: ["nosec_sc"],
        properties: {
            availableResourceLevel: {
                type: "integer",
                observable: true,
                readOnly: false,
                writeOnly: false,
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/properties/availableResourceLevel",
                        contentType: "application/json",
                        op: ["readproperty", "observeproperty"],
                    },
                ],
            },
            possibleDrinks: {
                type: "array",
                items: { type: "string" },
                readOnly: true,
                writeOnly: false,
                observable: false,
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/properties/possibleDrinks",
                        contentType: "application/json",
                        op: ["readproperty"],
                    },
                ],
            },
            maintenanceNeeded: {
                type: "boolean",
                observable: false,
                readOnly: false,
                writeOnly: false,
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/properties/maintenanceNeeded",
                        contentType: "application/json",
                        op: ["readproperty", "writeproperty"],
                    },
                ],
            },
        },
        actions: {
            makeDrink: {
                description: "Make a drink and decrease water level",
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/actions/makeDrink",
                        contentType: "application/json",
                        op: ["invokeaction"],
                    },
                ],
            },
        },
        events: {
            outOfResource: {
                data: { type: "string" },
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/events/outOfResource",
                        contentType: "application/json",
                        op: ["subscribeevent"],
                    },
                ],
            },
        },
    }).then((thing) => {
        let level = 10;
        const drinks = ["espresso", "americano", "latte"];
        let maintenance = false;

        // Handlers
        thing.setPropertyReadHandler("availableResourceLevel", () => level);
        thing.setPropertyReadHandler("possibleDrinks", () => drinks);
        thing.setPropertyReadHandler("maintenanceNeeded", () => maintenance);

        thing.setActionHandler("makeDrink", async () => {
            if (level > 0) {
                level--;
                console.log(`[PRODUCER] Drink made. Level now: ${level}`);
                thing.emitPropertyChange("availableResourceLevel");

                if (level <= 2) {
                    console.log(`[PRODUCER] Warning: out of resource!`);
                    thing.emitEvent("outOfResource", "Water level critically low");
                }

                return "Drink served!";
            } else {
                return "Cannot make drink. No water!";
            }
        });

        // Expose
        thing.expose().then(() => {
            console.log("✅ CoffeeMachine exposed via MQTT");
            // Emit level every 10s to simulate sensor update
            setInterval(() => {
                thing.emitPropertyChange("availableResourceLevel");
            }, 10000);
        });
    });
});
