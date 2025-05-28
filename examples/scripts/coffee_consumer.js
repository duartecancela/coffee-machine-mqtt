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

const servient = new Servient();
servient.addClientFactory(new MqttClientFactory({ uri: "mqtt://localhost:1883" }));

console.log("🚀 [1] A iniciar consumidor...");

servient
    .start()
    .then((WoT) => {
        console.log("✅ [2] Servient iniciado");

        WoT.consume(td)
            .then(async (thing) => {
                console.log("✅ [3] TD consumida com sucesso");

                // Ler propriedades iniciais
                const level = await thing.readProperty("availableResourceLevel");
                const drinks = await thing.readProperty("possibleDrinks");
                const maintenance = await thing.readProperty("maintenanceNeeded");

                console.log("🥤 [4] Nível atual de água:", await level.value());
                console.log("☕ [5] Bebidas disponíveis:", await drinks.value());
                console.log("🛠 [6] Manutenção necessária:", await maintenance.value());

                // Observar nível de água
                thing.observeProperty("availableResourceLevel", async (value) => {
                    const val = await value.value();
                    console.log("📡 Novo nível observado:", val);
                });

                // Subscrição do evento
                thing.subscribeEvent("outOfResource", (data) => {
                    console.log("🚨 Evento recebido: OUT OF RESOURCE →", data);
                });

                // Ação automática: pedir uma bebida a cada 5s
                setInterval(async () => {
                    console.log("🧃 A pedir bebida...");
                    const result = await thing.invokeAction("makeDrink");
                    console.log("✅ Resposta:", result);
                }, 5000);
            })
            .catch((err) => {
                console.error("❌ Erro ao consumir TD:", err.message);
            });
    })
    .catch((err) => {
        console.error("❌ Erro ao iniciar servient:", err.message);
    });
