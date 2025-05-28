const { Servient } = require("@node-wot/core");
const MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory;
const fs = require("fs");

const tdPath = "examples/scripts/thing_description.json";

console.log("🔍 [1] A ler ficheiro TD:", tdPath);

let td;
try {
    const raw = fs.readFileSync(tdPath, "utf-8");
    console.log("🔍 [2] Ficheiro TD lido com sucesso.");
    td = JSON.parse(raw);
    console.log("🔍 [3] TD parseado com sucesso:", td.title);
} catch (err) {
    console.error("❌ [ERRO] Falha ao ler/parsear TD:", err);
    process.exit(1);
}

const servient = new Servient();
servient.addClientFactory(new MqttClientFactory({ uri: "mqtt://localhost:1883" }));

console.log("🚀 [4] A iniciar Servient...");
servient
    .start()
    .then((WoT) => {
        console.log("✅ [5] Servient iniciado.");

        WoT.consume(td)
            .then(async (thing) => {
                console.log("📦 [6] TD consumida. A ler propriedade...");
                try {
                    const level = await thing.readProperty("availableResourceLevel");
                    console.log("✅ [7] Water level (manual test):", level);
                } catch (err) {
                    console.error("❌ [8] Falha ao ler propriedade:", err);
                }
            })
            .catch((err) => {
                console.error("❌ [9] Falha ao consumir a Thing:", err);
            });
    })
    .catch((err) => {
        console.error("❌ [10] Falha ao iniciar Servient:", err);
    });
