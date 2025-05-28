const readline = require("readline");
const { Servient } = require("@node-wot/core");
const MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory;

const td = {
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
            forms: [
                {
                    href: "mqtt://localhost:1883/CoffeeMachine/properties/availableResourceLevel",
                    contentType: "application/json",
                    op: ["observeproperty", "readproperty"],
                },
            ],
        },
        possibleDrinks: {
            type: "array",
            items: { type: "string" },
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
            forms: [
                {
                    href: "mqtt://localhost:1883/CoffeeMachine/properties/maintenanceNeeded",
                    contentType: "application/json",
                    op: ["readproperty"],
                },
            ],
        },
    },
    actions: {
        makeDrink: {
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
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const servient = new Servient();
servient.addClientFactory(new MqttClientFactory({ uri: "mqtt://localhost:1883" }));

console.log("🚀 [1] A iniciar consumidor manual...");

servient
    .start()
    .then((WoT) => {
        console.log("✅ [2] Servient iniciado");

        WoT.consume(td)
            .then(async (thing) => {
                console.log("✅ [3] TD consumida com sucesso");

                // Observar alterações no nível de água
                thing.observeProperty("availableResourceLevel", async (value) => {
                    console.log("📡 Nível atualizado:", await value.value());
                });

                // Subscrição do evento
                thing.subscribeEvent("outOfResource", (data) => {
                    console.log("🚨 Evento: OUT OF RESOURCE →", data);
                });

                // Espera por Enter para fazer bebida
                const prompt = () => {
                    rl.question("☕ Prima Enter para pedir uma bebida (ou 'q' para sair): ", async (input) => {
                        if (input.toLowerCase() === "q") {
                            console.log("👋 A sair...");
                            rl.close();
                            process.exit(0);
                        }

                        try {
                            console.log("🧃 A pedir bebida...");
                            const result = await thing.invokeAction("makeDrink");
                            console.log("✅ Bebida servida:", result);
                        } catch (err) {
                            console.error("❌ Erro ao invocar makeDrink:", err.message);
                        }

                        prompt(); // repetir prompt
                    });
                };

                prompt();
            })
            .catch((err) => {
                console.error("❌ Erro ao consumir TD:", err.message);
            });
    })
    .catch((err) => {
        console.error("❌ Erro ao iniciar servient:", err.message);
    });
