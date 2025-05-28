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
                observable: false,
                readOnly: true,
                writeOnly: false,
                forms: [
                    {
                        href: "mqtt://localhost:1883/CoffeeMachine/properties/availableResourceLevel",
                        contentType: "application/json",
                        op: ["readproperty"],
                    },
                ],
            },
        },
    })
        .then((thing) => {
            let level = 10;

            thing.setPropertyReadHandler("availableResourceLevel", async () => {
                console.log("[PRODUCER] → Property read request received. Current level:", level);
                return level;
            });

            thing.expose().then(() => {
                console.log("[PRODUCER] CoffeeMachine minimal exposed via MQTT.");
                console.log("[PRODUCER] TD gerada:");
                console.log(JSON.stringify(thing.getThingDescription(), null, 2));
            });
        })
        .catch((err) => {
            console.error("[PRODUCER] Failed to produce Thing:", err);
        });
});
