# ☕ Projeto WoT – Máquina de Café via MQTT

Este projeto implementa uma máquina de café baseada na framework [Eclipse Thingweb™ node-wot](https://github.com/eclipse-thingweb/node-wot), utilizando **MQTT** como protocolo de comunicação entre um `servient` produtor e um `servient` consumidor.

Os ficheiros da framework original **não foram modificados**. Foram criados scripts próprios (`coffee_producer.js`, `coffee_consumer_manual.js`, etc.) que utilizam a biblioteca `node-wot` para construir e expor a Thing Description, bem como para consumir e interagir com a máquina.

---

## 📦 Estrutura do Projeto

```
coffee-machine-mqtt/
├── examples/
│   └── scripts/
│       ├── coffee_producer.js            # Produtor principal com ação e evento
│       ├── coffee_consumer.js            # Consumidor automático
│       ├── coffee_consumer_manual.js     # Consumidor com controlo manual (teclado)
│       └── thing_description.json        # Thing Description (TD) com binding MQTT
```

---

## ✅ Funcionalidades Implementadas

-   [x] **Exposição da máquina de café** com as propriedades:

    -   `availableResourceLevel` (nível de água)
    -   `possibleDrinks` (tipos de bebidas)
    -   `maintenanceNeeded` (flag de manutenção)

-   [x] **Ação** `makeDrink`: produz uma bebida e reduz o nível de água.

-   [x] **Evento** `outOfResource`: disparado automaticamente quando o nível é inferior a 2.

-   [x] Comunicação **100% MQTT** (propriedades, ações e eventos).

-   [x] **Consumidor manual** que permite interação por teclado.

---

## 🔗 Binding Templates

A Thing Description (`thing_description.json`) foi adaptada para incluir **binding MQTT**:

```json
"forms": [
  {
    "href": "mqtt://localhost:1883/CoffeeMachine/properties/availableResourceLevel",
    "contentType": "application/json",
    "op": ["readproperty", "writeproperty", "observeproperty"]
  }
]
```

O mesmo foi feito para todas as propriedades, ações e eventos.
As Thing Descriptions foram definidas diretamente nos scripts JS como objetos embutidos, com os `forms` estruturados de acordo com os [binding templates do W3C](https://github.com/w3c/wot-binding-templates).

---

## ▶️ Comandos para Executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor Mosquitto (local)

```bash
mosquitto -v
```

> Ou usar o broker online `mqtt://test.mosquitto.org`

---

### 3. Iniciar o produtor

```bash
node examples/scripts/coffee_producer.js
```

---

### 4. Iniciar o consumidor

#### Automático

```bash
node examples/scripts/coffee_consumer.js
```

#### Manual (teclado: Enter = pedir café)

```bash
node examples/scripts/coffee_consumer_manual.js
```

---

### 5. Monitorizar MQTT

```bash
mosquitto_sub -h localhost -t "#" -v
```

---

---

## 🧪 Testes com MQTT Explorer

Podes testar todos os tópicos e interações no [MQTT Explorer](https://mqtt-explorer.com):

### 📥 Tópicos a observar ou publicar

| Tipo        | Tópico MQTT                                       | Operação                | Exemplo de Payload             |
| ----------- | ------------------------------------------------- | ----------------------- | ------------------------------ |
| Propriedade | `CoffeeMachine/properties/availableResourceLevel` | Observe / Read          | _(Automático)_                 |
| Propriedade | `CoffeeMachine/properties/possibleDrinks`         | Read                    | _(Automático)_                 |
| Propriedade | `CoffeeMachine/properties/maintenanceNeeded`      | Read                    | _(Automático)_                 |
| Ação        | `CoffeeMachine/actions/makeDrink`                 | Publish (Invoke Action) | `{}`                           |
| Evento      | `CoffeeMachine/events/outOfResource`              | Subscribe (Evento)      | `"Water level critically low"` |

> 💡 Ao pedir bebidas no consumidor (`coffee_consumer_manual.js`), haverá atualizações em `availableResourceLevel` e possivelmente o evento `outOfResource`.

---

## 📎 Referências

-   [Eclipse node-wot](https://github.com/eclipse-thingweb/node-wot)
-   [MQTT protocol](https://mqtt.org/)
-   [Mosquitto broker](https://mosquitto.org/)
-   [Thing Description Binding Templates](https://github.com/w3c/wot-binding-templates)

---

## 👨‍💻 Autor

Duarte Cancela – Projeto prático de WoT (Web das Coisas)
