const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { Kafka } = require('kafkajs');
const { v4: uuidv4} = require('uuid');
const port = 3001;

function processMessage(message){
    console.log(`Consumer: ${message.value}`);
    io.emit("message", message.value.toString());
}

async function startKafka(){
    
    const kafka = new Kafka({
        clientId: uuidv4(),
        brokers:['localhost:9092']
    });

    const consumer = kafka.consumer({groupId: 'test-group'});
    
    await consumer.connect();
    
    await consumer.subscribe({topic: 'sensor.temperature', fromBeginning: false});
    
    await consumer.run({
        eachBatchAutoResolve: false,
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
            for (let message of batch.messages) {
                if (!isRunning() || isStale()) break
                await processMessage(message)
                resolveOffset(message.offset)
                await heartbeat()
            }
        }
    })
}

async function startApp(){

    await startKafka();

    app.get('/', function(req, res){
        res.sendfile('index.html');
    });

    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });

    http.listen(port, function(){
        console.log("Running on port " + port)
    });
}

startApp();